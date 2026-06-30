import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin role required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  let query = adminDb()
    .collection('contact_messages')
    .orderBy('created_at', 'desc') as FirebaseFirestore.Query

  if (statusFilter) {
    query = adminDb()
      .collection('contact_messages')
      .where('status', '==', statusFilter)
      .orderBy('created_at', 'desc')
  }

  const snap = await query.limit(200).get()
  return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
}
