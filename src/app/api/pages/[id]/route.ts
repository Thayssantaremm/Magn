import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getContext } from "@/lib/context";
import { canWrite } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const PatchSchema = z.object({
  title: z.string().optional(),
  content: z.any().optional(),
  icon: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  isDeleted: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await getContext();
  const page = await prisma.page.findFirst({
    where: { id: params.id, isDeleted: false, workspaceId: ctx.workspaceId },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await getContext();
  if (!canWrite(ctx.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const patch = PatchSchema.parse(await req.json());

  const page = await prisma.page.update({
    where: { id: params.id },
    data: patch,
  });

  await audit({ workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "update", entity: "page", entityId: params.id });

  return NextResponse.json(page);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await getContext();
  if (!canWrite(ctx.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await prisma.page.update({
    where: { id: params.id },
    data: { isDeleted: true },
  });

  await audit({ workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "delete", entity: "page", entityId: params.id });

  return NextResponse.json({ ok: true });
}
