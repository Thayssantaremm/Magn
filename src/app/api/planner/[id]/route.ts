import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getContext } from "@/lib/context";
import { canWrite } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Patch = z.object({
  title: z.string().optional(),
  start: z.string().optional(),
  end: z.string().nullable().optional(),
  allDay: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await getContext();
  if (!canWrite(ctx.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = Patch.parse(await req.json());
  const e = await prisma.plannerEvent.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.start ? { start: new Date(body.start) } : {}),
      ...(body.end !== undefined ? { end: body.end ? new Date(body.end) : null } : {}),
      ...(body.allDay !== undefined ? { allDay: body.allDay } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    },
  });

  await audit({ workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "update", entity: "planner_event", entityId: e.id });

  return NextResponse.json(e);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await getContext();
  if (!canWrite(ctx.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await prisma.plannerEvent.delete({ where: { id: params.id } });
  await audit({ workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "delete", entity: "planner_event", entityId: params.id });

  return NextResponse.json({ ok: true });
}
