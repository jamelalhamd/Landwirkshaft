import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/getSession'
import { listFiles } from '@/lib/firebase/storage-utils'

const ALLOWED_FOLDERS = new Set(['news', 'staff', 'documents', 'research', 'media', 'attachments'])

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const folder = searchParams.get('folder') ?? 'media'

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  // Attachments (private) require admin role
  if (folder === 'attachments' && !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const files = await listFiles(folder)
    return NextResponse.json(files)
  } catch (err) {
    console.error('[storage/files]', err)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
