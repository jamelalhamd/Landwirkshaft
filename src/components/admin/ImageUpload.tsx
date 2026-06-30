'use client'
import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (url: string) => void
  folder: 'news' | 'staff' | 'documents' | 'research' | 'media' | 'logos'
  accept?: string
}

export function ImageUpload({ value, onChange, folder, accept = 'image/*' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (inputRef.current) inputRef.current.value = ''

    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Upload failed')
      }
      const { url } = (await res.json()) as { url: string }
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
            aria-label="Remove"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-fluid-sm text-ink hover:bg-surface/80 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {uploading ? 'Uploading…' : value ? 'Change image' : 'Upload image'}
      </button>

      {error && <p className="text-fluid-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => { void handleChange(e) }}
      />
    </div>
  )
}
