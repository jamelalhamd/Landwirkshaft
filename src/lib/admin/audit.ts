import 'server-only'
import { adminDb } from '@/lib/firebase/admin'

interface AuditParams {
  actorId: string
  action: string
  resourceType: string
  resourceId?: string
  metadata?: Record<string, unknown>
  request?: Request
}

// Schreibt einen unveränderlichen Audit-Log-Eintrag in Firestore.
// Muss nach jeder Admin-Mutation aufgerufen werden (Erstellen, Bearbeiten, Löschen).
export async function writeAuditLog({
  actorId,
  action,
  resourceType,
  resourceId,
  metadata = {},
  request,
}: AuditParams): Promise<void> {
  await adminDb()
    .collection('audit_logs')
    .add({
      actor_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId ?? null,
      ip_address: request?.headers.get('x-forwarded-for') ?? null,
      user_agent: request?.headers.get('user-agent') ?? null,
      metadata,
      created_at: new Date().toISOString(),
    })
}
