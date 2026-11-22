import 'server-only';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export interface AuditEntry {
  actorId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      metadata:
        entry.metadata !== undefined
          ? (entry.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
    },
  });
}
