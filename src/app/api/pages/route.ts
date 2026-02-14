import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getContext } from "@/lib/context";
import { canWrite } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const CreateSchema = z.object({
  title: z.string().min(1).optional(),
  parentId: z.string().optional().nullable(),
});

export async function GET() {
  const ctx = await getContext();
  const pages = await prisma.page.findMany({
    where: { isDeleted: false, workspaceId: ctx.workspaceId },
    select: { id: true, parentId: true, title: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(pages);
}

export async function POST(req: Request) {
  const ctx = await getContext();
  if (!canWrite(ctx.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = CreateSchema.parse(await req.json());

  const page = await prisma.page.create({
    data: { workspaceId: ctx.workspaceId, title: body.title ?? "Untitled", parentId: body.parentId ?? null },
    select: { id: true, parentId: true, title: true },
  });

  await audit({ workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "create", entity: "page", entityId: page.id });

  return NextResponse.json(page);
}
