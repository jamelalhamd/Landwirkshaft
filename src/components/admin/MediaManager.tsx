'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Trash2, FileText, Film, ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StorageFile } from '@/lib/firebase/storage-utils'
import type { Locale } from '@/lib/i18n/config'
import type { UserRole } from '@/lib/auth/types'

const ROLE_RANK: Record<UserRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
}

const FOLDERS: { id: string; ar: string; en: string }[] = [
  { id: 'media',     ar: 'الوسائط العامة',  en: 'General Media'  },
  { id: 'news',      ar: 'صور الأخبار',     en: 'News Images'    },
  { id: 'documents', ar: 'الوثائق',         en: 'Documents'      },
  { id: 'research',  ar: 'الأبحاث',         en: 'Research'       },
  { id: 'staff',     ar: 'صور الموظفين',    en: 'Staff Photos'   },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FilePreview({ file }: { file: StorageFile }) {
  const isImage = file.contentType.startsWith('image/')
  const isVideo = file.contentType.startsWith('video/')

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.url}
        alt={file.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    )
  }
  if (isVideo) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <Film className="size-10 text-gray-400" aria-hidden />
      </div>
    )
  }
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <FileText className="size-10 text-gray-400" aria-hidden />
    </div>
  )
}

export function MediaManager({
  locale,
  initialFiles,
  role,
}: {
  locale: Locale
  initialFiles: StorageFile[]
  role: UserRole
}) {
  const isAr = locale === 'ar'
  const canDelete = ROLE_RANK[role] >= ROLE_RANK['admin']

  const [activeFolder, setActiveFolder] = useState('media')
  const [files, setFiles] = useState<StorageFile[]>(initialFiles)
  const [loadingFolder, setLoadingFolder] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = (ar: string, en: string) => (isAr ? ar : en)

  const switchFolder = useCallback(async (folder: string) => {
    setActiveFolder(folder)
    setFiles([])
    setError(null)
    setLoadingFolder(true)
    try {
      const res = await fetch(`/api/storage/files?folder=${folder}`)
      if (!res.ok) throw new Error(await res.text())
      setFiles(await res.json())
    } catch {
      setError(t('فشل تحميل الملفات', 'Failed to load files'))
    } finally {
      setLoadingFolder(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null)
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', activeFolder)
        const res = await fetch('/api/storage/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const body = (await res.json()) as { error?: string }
          throw new Error(body.error ?? t('فشل الرفع', 'Upload failed'))
        }
        const uploaded: StorageFile = await res.json()
        setFiles((prev) => [uploaded, ...prev])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('فشل الرفع', 'Upload failed'))
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [activeFolder], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void uploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void uploadFile(file)
  }

  const handleDelete = async (filePath: string) => {
    if (!confirm(t('هل تريد حذف هذا الملف نهائياً؟', 'Permanently delete this file?'))) return
    setDeletingPath(filePath)
    setError(null)
    try {
      const res = await fetch(`/api/storage/delete?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(t('فشل الحذف', 'Delete failed'))
      setFiles((prev) => prev.filter((f) => f.path !== filePath))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('فشل الحذف', 'Delete failed'))
    } finally {
      setDeletingPath(null)
    }
  }

  return (
    <div>
      {/* Folder tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => void switchFolder(f.id)}
            disabled={loadingFolder}
            className={cn(
              'rounded-lg px-4 py-2 text-fluid-sm font-medium transition-colors',
              activeFolder === f.id
                ? 'bg-primary-700 text-white'
                : 'border border-border bg-surface text-ink-muted hover:bg-primary-50 hover:text-primary-700',
            )}
          >
            {isAr ? f.ar : f.en}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <label
        htmlFor="media-upload"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          dragOver
            ? 'border-primary-600 bg-primary-50'
            : 'border-border hover:border-primary-400 hover:bg-primary-50/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={inputRef}
          id="media-upload"
          type="file"
          accept="image/*,application/pdf,video/*"
          onChange={handleFileInput}
          className="sr-only"
          disabled={uploading}
        />
        {uploading ? (
          <Loader2 className="mb-2 size-8 animate-spin text-primary-600" aria-hidden />
        ) : (
          <Upload className="mb-2 size-8 text-ink-muted" aria-hidden />
        )}
        <p className="font-medium text-ink">
          {uploading
            ? t('جارٍ الرفع...', 'Uploading…')
            : t('انقر أو اسحب ملفاً هنا', 'Click or drag a file here')}
        </p>
        <p className="mt-1 text-fluid-xs text-ink-muted">
          {t('صور · PDF · فيديو', 'Images · PDF · Video')}
        </p>
      </label>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-fluid-sm text-red-800"
        >
          {error}
        </div>
      )}

      {/* File grid */}
      {loadingFolder ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-primary-600" aria-hidden />
        </div>
      ) : files.length === 0 ? (
        <p className="py-16 text-center text-fluid-sm text-ink-muted">
          {t('لا توجد ملفات في هذا المجلد بعد', 'No files in this folder yet')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => (
            <div key={file.path} className="gov-card overflow-hidden">
              <div className="aspect-video bg-gray-100">
                <FilePreview file={file} />
              </div>
              <div className="p-3">
                <p className="truncate text-fluid-xs font-semibold text-ink" title={file.name}>
                  {file.name}
                </p>
                <p className="text-fluid-xs text-ink-muted">{formatBytes(file.size)}</p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-fluid-xs text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <ExternalLink className="size-3" aria-hidden />
                    {t('عرض', 'View')}
                  </a>
                  {canDelete && (
                    <button
                      onClick={() => void handleDelete(file.path)}
                      disabled={deletingPath === file.path}
                      className="flex items-center justify-center rounded-md border border-red-200 px-2 py-1 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      aria-label={t('حذف', 'Delete')}
                    >
                      {deletingPath === file.path ? (
                        <Loader2 className="size-3 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="size-3" aria-hidden />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
