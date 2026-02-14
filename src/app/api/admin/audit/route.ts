import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContext } from "@/lib/context";
import { canAdmin } from "@/lib/rbac";

export async function GET() {
  const ctx = await getContext();
  if (!canAdmin(ctx.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const logs = await prisma.auditLog.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: true },
  });

  return NextResponse.json(
    logs.map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      actorEmail: l.actor?.email ?? null,
    }))
  );
}
