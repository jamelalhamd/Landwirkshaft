import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/getSession'
import { deleteFile } from '@/lib/firebase/storage-utils'

const ALLOWED_PREFIXES = ['news/', 'staff/', 'documents/', 'research/', 'media/', 'attachments/']

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filePath = searchParams.get('path')

  if (!filePath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }

  // Prevent path traversal — only allow known prefixes
  const safe = ALLOWED_PREFIXES.some((p) => filePath.startsWith(p))
  if (!safe || filePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  try {
    await deleteFile(filePath)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[storage/delete]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
