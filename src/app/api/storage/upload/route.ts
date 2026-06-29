import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/getSession'
import { uploadFile } from '@/lib/firebase/storage-utils'

const ALLOWED_FOLDERS = new Set(['news', 'staff', 'documents', 'research', 'media', 'attachments', 'logos'])

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const folder = formData.get('folder') as string | null

  if (!file || !folder) {
    return NextResponse.json({ error: 'Missing file or folder' }, { status: 400 })
  }

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  // Staff and media management require at least editor; admin routes are gated by session
  if (folder === 'staff' && !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const MAX_BYTES = 100 * 1024 * 1024 // 100 MB ceiling
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(folder, buffer, file.name, file.type)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[storage/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
