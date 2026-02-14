import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getContext() {
  const session = await requireSession();
  const membership = session.user.memberships[0];
  if (!membership) throw new Error("NO_WORKSPACE");
  return {
    userId: session.user.id,
    workspaceId: membership.workspaceId,
    role: membership.role,
  };
}

export async function ensureWorkspace(workspaceId: string) {
  const session = await requireSession();
  const m = await prisma.membership.findFirst({ where: { userId: session.user.id, workspaceId } });
  if (!m) throw new Error("FORBIDDEN");
  return { userId: session.user.id, role: m.role };
}
