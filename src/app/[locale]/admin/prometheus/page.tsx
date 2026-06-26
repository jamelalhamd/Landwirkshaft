'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SyncLog {
  id: string
  actor_id: string
  action: string
  metadata: {
    count?: number
    url?: string
    duration_ms?: number
    content_type?: string
    preview?: string
  }
  created_at: string
}

interface SyncStatus {
  total_records: number
  recent_syncs: SyncLog[]
}

export default function PrometheusPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    ok: boolean
    count?: number
    duration_ms?: number
    error?: string
    message?: string
    preview?: string
  } | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  async function loadStatus() {
    setLoadingStatus(true)
    try {
      const res = await fetch('/api/prometheus/sync')
      if (res.ok) setStatus((await res.json()) as SyncStatus)
    } finally {
      setLoadingStatus(false)
    }
  }

  useEffect(() => { void loadStatus() }, [])

  async function startSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/prometheus/sync', { method: 'POST' })
      const json = await res.json() as typeof syncResult
      setSyncResult(json)
      if (res.ok) await loadStatus()
    } catch {
      setSyncResult({ ok: false, error: 'Netzwerkfehler' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">
          استيراد بيانات Prometheus
        </h1>
        <p className="text-fluid-sm text-ink-muted">
          مزامنة البيانات من النظام الخارجي وتخزينها في قاعدة بيانات Firestore.
        </p>
      </div>

      {/* Konfigurationshinweis */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
          <div className="space-y-2 text-fluid-sm text-amber-900">
            <p className="font-semibold">إعداد مطلوب — بيانات الاعتماد</p>
            <p>
              أضف متغيرات البيئة التالية إلى ملف{' '}
              <code className="rounded bg-amber-100 px-1 font-mono">.env.local</code>:
            </p>
            <pre className="rounded-lg bg-amber-100 p-3 font-mono text-fluid-xs leading-relaxed">
{`PROMETHEUS_URL=http://gcsar.gov.sy/ar/prometheus
PROMETHEUS_USERNAME=info-dept
PROMETHEUS_PASSWORD=<كلمة_المرور>`}
            </pre>
            <p className="text-fluid-xs">
              أعد تشغيل الخادم بعد إضافة المتغيرات.{' '}
              <strong>لا تضع كلمات المرور في كود المصدر.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Status-Karte */}
      <div className="gov-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <Database className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-bold text-ink">حالة قاعدة البيانات</h2>
              <p className="text-fluid-xs text-ink-muted">
                {loadingStatus
                  ? 'جارٍ التحميل...'
                  : `${status?.total_records ?? 0} سجل محفوظ في Firestore`}
              </p>
            </div>
          </div>
          <button
            onClick={() => void startSync()}
            disabled={syncing}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-fluid-sm font-semibold text-white transition-colors',
              syncing
                ? 'cursor-not-allowed bg-primary-400'
                : 'bg-primary-700 hover:bg-primary-800',
            )}
          >
            <RefreshCw className={cn('size-4', syncing && 'animate-spin')} aria-hidden />
            {syncing ? 'جارٍ المزامنة...' : 'مزامنة الآن'}
          </button>
        </div>

        {/* Sync-Ergebnis */}
        {syncResult && (
          <div
            className={cn(
              'mt-4 rounded-lg border p-4 text-fluid-sm',
              syncResult.ok
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800',
            )}
          >
            <div className="flex items-start gap-2">
              {syncResult.ok
                ? <CheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                : <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />}
              <div>
                {syncResult.ok ? (
                  <p>
                    تمت المزامنة بنجاح —{' '}
                    <strong>{syncResult.count} سجل</strong>
                    {syncResult.duration_ms != null && ` في ${syncResult.duration_ms} مللي ثانية`}
                  </p>
                ) : (
                  <>
                    <p className="font-semibold">{syncResult.error}</p>
                    {syncResult.message && <p className="mt-1 text-fluid-xs">{syncResult.message}</p>}
                    {syncResult.preview && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-fluid-xs font-medium">
                          معاينة الاستجابة
                        </summary>
                        <pre className="mt-1 overflow-x-auto rounded bg-red-100 p-2 text-fluid-xs">
                          {syncResult.preview}
                        </pre>
                      </details>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Letzte Sync-Logs */}
      {status && status.recent_syncs.length > 0 && (
        <div className="gov-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-semibold text-ink">سجل المزامنات الأخيرة</h3>
          </div>
          <table className="w-full text-fluid-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-ink-muted">التاريخ</th>
                <th className="px-4 py-3 text-start font-medium text-ink-muted">النوع</th>
                <th className="px-4 py-3 text-start font-medium text-ink-muted">السجلات</th>
                <th className="px-4 py-3 text-start font-medium text-ink-muted">المدة</th>
              </tr>
            </thead>
            <tbody>
              {status.recent_syncs.map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="px-4 py-3 text-ink-muted">
                    {new Date(log.created_at).toLocaleString('ar-SY')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-fluid-xs font-medium',
                      log.action === 'prometheus_sync'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700',
                    )}>
                      {log.action === 'prometheus_sync' ? 'JSON ناجح' : 'HTML (يتطلب فحصاً)'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {log.metadata.count != null ? log.metadata.count : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {log.metadata.duration_ms != null ? `${log.metadata.duration_ms} ms` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
