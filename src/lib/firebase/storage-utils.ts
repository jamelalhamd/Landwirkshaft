import 'server-only'
import { adminStorage } from '@/lib/firebase/admin'
import { randomUUID } from 'crypto'
import path from 'path'

export interface StorageFile {
  name: string
  path: string
  url: string
  contentType: string
  size: number
  updatedAt: string
}

function publicUrl(bucketName: string, filePath: string): string {
  return (
    `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/` +
    `${encodeURIComponent(filePath)}?alt=media`
  )
}

export async function uploadFile(
  folder: string,
  buffer: Buffer,
  originalName: string,
  contentType: string,
): Promise<StorageFile> {
  const ext = path.extname(originalName).toLowerCase()
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
  const filePath = `${folder}/${fileName}`

  const bucket = adminStorage()
  const file = bucket.file(filePath)

  await file.save(buffer, { metadata: { contentType } })

  const [metadata] = await file.getMetadata()

  return {
    name: fileName,
    path: filePath,
    url: publicUrl(bucket.name, filePath),
    contentType: (metadata.contentType as string | undefined) ?? contentType,
    size: Number(metadata.size ?? buffer.length),
    updatedAt: (metadata.updated as string | undefined) ?? new Date().toISOString(),
  }
}

export async function listFiles(folder: string): Promise<StorageFile[]> {
  const bucket = adminStorage()
  const [files] = await bucket.getFiles({ prefix: `${folder}/` })

  const results = await Promise.all(
    files
      .filter((f) => !f.name.endsWith('/'))
      .map(async (f) => {
        const [meta] = await f.getMetadata()
        return {
          name: path.basename(f.name),
          path: f.name,
          url: publicUrl(bucket.name, f.name),
          contentType: (meta.contentType as string | undefined) ?? 'application/octet-stream',
          size: Number(meta.size ?? 0),
          updatedAt: (meta.updated as string | undefined) ?? new Date().toISOString(),
        } satisfies StorageFile
      }),
  )

  return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function deleteFile(filePath: string): Promise<void> {
  await adminStorage().file(filePath).delete()
}
