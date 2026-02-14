import { prisma } from "@/lib/prisma";
import { requestIp } from "@/lib/auth";

export async function audit(params: {
  workspaceId: string;
  actorUserId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: any;
}) {
  await prisma.auditLog.create({
    data: {
      workspaceId: params.workspaceId,
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      ip: requestIp(),
      meta: params.meta ?? undefined,
    },
  });
}
