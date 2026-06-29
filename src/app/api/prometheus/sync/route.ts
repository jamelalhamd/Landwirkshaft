import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'

const PROMETHEUS_URL      = process.env.PROMETHEUS_URL      ?? 'http://gcsar.gov.sy/ar/prometheus'
const PROMETHEUS_USERNAME = process.env.PROMETHEUS_USERNAME ?? 'info-dept'
const PROMETHEUS_PASSWORD = process.env.PROMETHEUS_PASSWORD ?? ''

// Basis-URL der Quelle (für wp-login.php)
const BASE_URL = (() => {
  try { return new URL(PROMETHEUS_URL).origin } catch { return 'http://gcsar.gov.sy' }
})()

// Alle Set-Cookie-Header zu einem Cookie-String zusammenführen
function collectCookies(res: Response): string {
  return res.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ')
}

// HTML-Tags und HTML-Entitäten entfernen
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

// Form-Action aus HTML extrahieren
function parseFormAction(html: string): string {
  const m = html.match(/<form[^>]+action=["']([^"']*?)["']/i)
  if (!m?.[1]) return `${BASE_URL}/wp-login.php`
  const a = m[1]
  if (a.startsWith('http')) return a
  return `${BASE_URL}${a.startsWith('/') ? '' : '/'}${a}`
}

// Versteckte Formularfelder extrahieren (z.B. WordPress-Nonce)
function parseHiddenFields(html: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of html.matchAll(/<input[^>]+>/gi)) {
    const tag  = m[0]
    const type = tag.match(/type=["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const name = tag.match(/name=["']([^"']+)["']/i)?.[1]
    const val  = tag.match(/value=["']([^"']*?)["']/i)?.[1] ?? ''
    if (name && type !== 'submit' && type !== 'button' && type !== 'reset') {
      out[name] = val
    }
  }
  return out
}

// HTML-Tabellen in strukturierte Daten umwandeln
function parseHtmlTables(html: string): Record<string, string>[][] {
  const tables: Record<string, string>[][] = []

  for (const tableM of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const tableHtml = tableM[0]

    // Spalten-Header aus <thead><th> lesen
    const headers: string[] = []
    const thSec = tableHtml.match(/<thead[\s\S]*?<\/thead>/i)?.[0] ?? ''
    for (const th of thSec.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)) {
      headers.push(stripTags(th[1] ?? ''))
    }

    // Datenzeilen aus <tbody><tr><td> lesen
    const rows: Record<string, string>[] = []
    const bodySec = tableHtml.match(/<tbody[\s\S]*?<\/tbody>/i)?.[0] ?? tableHtml
    for (const rowM of bodySec.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells: string[] = []
      for (const td of (rowM[1] ?? '').matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)) {
        cells.push(stripTags(td[1] ?? ''))
      }
      if (cells.length === 0) continue
      const row: Record<string, string> = {}
      cells.forEach((c, i) => { row[headers[i] ?? `col_${i}`] = c })
      rows.push(row)
    }

    if (rows.length > 0) tables.push(rows)
  }

  return tables
}

// JSON-Arrays aus <script>-Tags extrahieren (für WordPress-Seiten mit JS-Daten)
function extractJsonFromScripts(html: string): unknown[] {
  const results: unknown[] = []
  for (const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)) {
    const script = m[1] ?? ''
    for (const arrM of script.matchAll(/(\[[\s\S]{10,}\])/g)) {
      const raw = arrM[1]
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed) && parsed.length > 0) {
          results.push(...(parsed as unknown[]))
          break
        }
      } catch { /* kein gültiges JSON */ }
    }
  }
  return results
}

// Records in Firestore-Batches speichern (max 500 pro Batch)
async function storeRecords(
  records: unknown[],
  now: string,
  actorId: string,
  syncStart: number,
  request: Request,
): Promise<Response> {
  if (records.length === 0) {
    return NextResponse.json({ ok: true, count: 0, message: 'Keine Datensätze auf der Seite gefunden.' })
  }

  let batch = adminDb().batch()
  let count = 0

  for (const record of records) {
    if (!record || typeof record !== 'object') continue
    const ref = adminDb().collection('prometheus_data').doc()
    batch.set(ref, {
      ...(record as Record<string, unknown>),
      _synced_at:   now,
      _source_url:  PROMETHEUS_URL,
      status:       'draft',
      created_at:   now,
      updated_at:   now,
    })
    count++
    if (count % 500 === 0) {
      await batch.commit()
      batch = adminDb().batch()
    }
  }
  if (count % 500 !== 0) await batch.commit()

  await writeAuditLog({
    actorId,
    action:       'prometheus_sync',
    resourceType: 'prometheus_data',
    metadata:     { count, url: PROMETHEUS_URL, duration_ms: Date.now() - syncStart },
    request,
  })

  return NextResponse.json({ ok: true, count, duration_ms: Date.now() - syncStart })
}

// WordPress-Formular-Login: Anmeldeseite laden → Formular ausfüllen → Session-Cookie erhalten
async function wpLogin(): Promise<string> {
  const loginUrl = `${BASE_URL}/wp-login.php`

  // 1. Anmeldeseite laden (für Nonce und Test-Cookie)
  const pageResp = await fetch(loginUrl, {
    headers: { Cookie: 'wordpress_test_cookie=WP+Cookie+check' },
    redirect: 'manual',
    signal: AbortSignal.timeout(20_000),
  })
  const pageHtml  = await pageResp.text()
  const initCookies = collectCookies(pageResp)

  // Formular-Action und versteckte Felder auslesen
  const formAction    = parseFormAction(pageHtml)
  const hiddenFields  = parseHiddenFields(pageHtml)

  // 2. Zugangsdaten einreichen
  const body = new URLSearchParams({
    ...hiddenFields,
    log:         PROMETHEUS_USERNAME,
    pwd:         PROMETHEUS_PASSWORD,
    'wp-submit': 'Log In',
    redirect_to: new URL(PROMETHEUS_URL).pathname,
    testcookie:  '1',
  })

  const loginResp = await fetch(formAction, {
    method:   'POST',
    headers:  {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: `wordpress_test_cookie=WP+Cookie+check; ${initCookies}`,
    },
    body:     body.toString(),
    redirect: 'manual',
    signal:   AbortSignal.timeout(20_000),
  })

  const sessionCookies = collectCookies(loginResp)

  // Keine Session-Cookies → Anmeldung fehlgeschlagen
  if (!sessionCookies.includes('wordpress_logged_in') && !sessionCookies.includes('wordpress_sec')) {
    // Manche WP-Setups senden andere Cookie-Namen — trotzdem weitermachen wenn Cookies vorhanden
    if (!sessionCookies) {
      const body = await loginResp.text()
      const hint = body.includes('incorrect') || body.includes('wrong') || body.includes('invalid')
        ? 'Benutzername oder Passwort falsch.'
        : 'Login nicht erfolgreich — keine Session-Cookies erhalten.'
      throw new Error(hint)
    }
  }

  return [initCookies, sessionCookies].filter(Boolean).join('; ')
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/prometheus/sync — Sync-Status und letzte Logs abrufen
// ──────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const countSnap = await adminDb().collection('prometheus_data').count().get()
  const total = countSnap.data().count

  // Nur nach created_at sortieren — kein Composite-Index nötig
  const logsSnap = await adminDb()
    .collection('audit_logs')
    .orderBy('created_at', 'desc')
    .limit(20)
    .get()

  type LogEntry = { id: string } & Record<string, unknown>
  const logs: LogEntry[] = logsSnap.docs
    .map((d): LogEntry => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
    .filter((d: LogEntry) => {
      const a = d['action'] as string | undefined
      return a === 'prometheus_sync' || a === 'prometheus_sync_html' || a === 'prometheus_sync_unstructured'
    })
    .slice(0, 5)

  return NextResponse.json({ total_records: total, recent_syncs: logs })
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/prometheus/sync — Synchronisation starten
// ──────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin-Berechtigung erforderlich' }, { status: 403 })
  }

  if (!PROMETHEUS_PASSWORD) {
    return NextResponse.json(
      {
        error: 'PROMETHEUS_PASSWORD ist nicht konfiguriert.',
        hint:  'Füge PROMETHEUS_PASSWORD=<passwort> in .env.local ein und starte den Server neu.',
      },
      { status: 503 },
    )
  }

  const syncStart = Date.now()

  try {
    // ── Schritt 1: WordPress-Anmeldung ──────────────────────────────────────
    let sessionCookies: string
    try {
      sessionCookies = await wpLogin()
    } catch (loginErr) {
      return NextResponse.json(
        {
          error:   'WordPress-Anmeldung fehlgeschlagen',
          message: loginErr instanceof Error ? loginErr.message : String(loginErr),
          hint:    'Bitte PROMETHEUS_USERNAME und PROMETHEUS_PASSWORD in .env.local prüfen.',
        },
        { status: 401 },
      )
    }

    // ── Schritt 2: Geschützte Seite abrufen ─────────────────────────────────
    const dataResp = await fetch(PROMETHEUS_URL, {
      headers: {
        Cookie:     sessionCookies,
        Accept:     'text/html,application/json,*/*',
        'User-Agent': 'GCSAR-Platform/1.0',
      },
      signal: AbortSignal.timeout(30_000),
    })

    if (!dataResp.ok) {
      return NextResponse.json(
        { error: `Seite antwortet mit Status ${dataResp.status} nach erfolgreichem Login.` },
        { status: 502 },
      )
    }

    const contentType = dataResp.headers.get('content-type') ?? ''
    const now = new Date().toISOString()

    // ── JSON-Antwort ──────────────────────────────────────────────────────────
    if (contentType.includes('application/json')) {
      const json = await dataResp.json() as unknown
      const records: unknown[] = Array.isArray(json)
        ? json
        : (typeof json === 'object' && json !== null)
          ? ((json as Record<string, unknown>)['data'] ?? (json as Record<string, unknown>)['records'] ?? []) as unknown[]
          : []
      return storeRecords(records, now, session.profile!.uid, syncStart, request)
    }

    // ── HTML-Antwort: Inhalte extrahieren ────────────────────────────────────
    const html = await dataResp.text()

    // Prüfen ob erneut die Login-Seite zurückgegeben wurde
    if (html.includes('wp-login') && html.includes('You need to login')) {
      return NextResponse.json(
        {
          error: 'Die Login-Seite wurde nach der Anmeldung erneut angezeigt.',
          hint:  'Das Passwort ist wahrscheinlich falsch. Bitte PROMETHEUS_PASSWORD in .env.local prüfen.',
        },
        { status: 401 },
      )
    }

    // 1. Versuch: HTML-Tabellen parsen
    const tables = parseHtmlTables(html)
    if (tables.length > 0) {
      const records = tables.flatMap((tbl, idx) =>
        tbl.map((row) => ({ _table_index: idx, ...row })),
      )
      return storeRecords(records, now, session.profile!.uid, syncStart, request)
    }

    // 2. Versuch: JSON in <script>-Tags finden
    const scriptData = extractJsonFromScripts(html)
    if (scriptData.length > 0) {
      return storeRecords(scriptData, now, session.profile!.uid, syncStart, request)
    }

    // 3. Kein strukturiertes Format — HTML-Vorschau für manuellen Review zurückgeben
    await writeAuditLog({
      actorId:      session.profile!.uid,
      action:       'prometheus_sync_unstructured',
      resourceType: 'prometheus_data',
      metadata:     { url: PROMETHEUS_URL, html_length: html.length },
      request,
    })

    return NextResponse.json({
      ok:           false,
      message:      'Login erfolgreich, aber die Seite enthält keine erkennbaren Tabellen oder JSON-Daten.',
      html_preview: html.slice(0, 3000),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: 'Synchronisation fehlgeschlagen', message }, { status: 502 })
  }
}
