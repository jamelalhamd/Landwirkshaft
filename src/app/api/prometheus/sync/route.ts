import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'

// Zugangsdaten werden ausschließlich über Umgebungsvariablen konfiguriert.
// Niemals Passwörter im Quellcode speichern.
const PROMETHEUS_URL = process.env.PROMETHEUS_URL ?? 'http://gcsar.gov.sy/ar/prometheus'
const PROMETHEUS_USERNAME = process.env.PROMETHEUS_USERNAME ?? 'info-dept'
const PROMETHEUS_PASSWORD = process.env.PROMETHEUS_PASSWORD ?? ''

// POST /api/prometheus/sync — externe Daten abrufen und in Firestore speichern
export async function POST(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin-Berechtigung erforderlich' }, { status: 403 })
  }

  if (!PROMETHEUS_PASSWORD) {
    return NextResponse.json(
      {
        error: 'PROMETHEUS_PASSWORD ist nicht konfiguriert.',
        hint: 'Füge PROMETHEUS_PASSWORD=<passwort> in .env.local ein und starte den Server neu.',
      },
      { status: 503 },
    )
  }

  const syncStart = Date.now()

  try {
    // HTTP Basic Auth — Standard für viele Regierungssysteme
    const basicAuth = Buffer.from(`${PROMETHEUS_USERNAME}:${PROMETHEUS_PASSWORD}`).toString('base64')

    const response = await fetch(PROMETHEUS_URL, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json, text/html, */*',
        'User-Agent': 'GCSAR-Platform/1.0',
      },
      signal: AbortSignal.timeout(30_000),
    })

    if (response.status === 401) {
      return NextResponse.json(
        { error: 'Authentifizierung fehlgeschlagen — Benutzername oder Passwort falsch.' },
        { status: 401 },
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Externer Server antwortete mit Status ${response.status}` },
        { status: 502 },
      )
    }

    const contentType = response.headers.get('content-type') ?? ''
    const now = new Date().toISOString()

    // JSON-Antwort verarbeiten
    if (contentType.includes('application/json')) {
      const json = await response.json() as unknown
      const records: unknown[] = Array.isArray(json)
        ? json
        : (typeof json === 'object' && json !== null)
          ? ((json as Record<string, unknown>)['data'] ?? (json as Record<string, unknown>)['records'] ?? []) as unknown[]
          : []

      if (!Array.isArray(records) || records.length === 0) {
        return NextResponse.json({ ok: true, count: 0, message: 'Keine Datensätze gefunden.' })
      }

      // In Batches von max. 500 in Firestore schreiben (Firestore-Limit)
      let count = 0
      let batch = adminDb().batch()

      for (const record of records) {
        if (!record || typeof record !== 'object') continue
        const ref = adminDb().collection('prometheus_data').doc()
        batch.set(ref, {
          ...(record as Record<string, unknown>),
          _synced_at: now,
          _source_url: PROMETHEUS_URL,
          status: 'draft',
          created_at: now,
          updated_at: now,
        })
        count++
        if (count % 500 === 0) {
          await batch.commit()
          batch = adminDb().batch()
        }
      }
      if (count % 500 !== 0) await batch.commit()

      await writeAuditLog({
        actorId: session.profile!.uid,
        action: 'prometheus_sync',
        resourceType: 'prometheus_data',
        metadata: { count, url: PROMETHEUS_URL, duration_ms: Date.now() - syncStart },
        request,
      })

      return NextResponse.json({ ok: true, count, duration_ms: Date.now() - syncStart })
    }

    // HTML/XML-Antwort — Vorschau zurückgeben, manuelles Parsing erforderlich
    const rawText = await response.text()
    const preview = rawText.slice(0, 1000)

    await writeAuditLog({
      actorId: session.profile!.uid,
      action: 'prometheus_sync_html',
      resourceType: 'prometheus_data',
      metadata: { url: PROMETHEUS_URL, content_type: contentType, preview: preview.slice(0, 200) },
      request,
    })

    return NextResponse.json({
      ok: false,
      message: 'Die externe Quelle liefert kein JSON. Manuelles Parsing erforderlich.',
      content_type: contentType,
      preview,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json(
      { error: 'Synchronisation fehlgeschlagen', message },
      { status: 502 },
    )
  }
}

// GET /api/prometheus/sync — letzten Sync-Status abrufen
export async function GET() {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const countSnap = await adminDb().collection('prometheus_data').count().get()
  const total = countSnap.data().count

  const logsSnap = await adminDb()
    .collection('audit_logs')
    .where('action', 'in', ['prometheus_sync', 'prometheus_sync_html'])
    .orderBy('created_at', 'desc')
    .limit(5)
    .get()

  const logs = logsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return NextResponse.json({ total_records: total, recent_syncs: logs })
}
