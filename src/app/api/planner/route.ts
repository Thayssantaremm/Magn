import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getContext } from "@/lib/context";
import { canWrite } from "@/lib/rbac";
import { audit } from "@/lib/audit";

export async function GET() {
  const ctx = await getContext();
  const events = await prisma.plannerEvent.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { start: "asc" },
  });
  return NextResponse.json(events);
}

const Create = z.object({
  title: z.string().min(1),
  start: z.string(),
  end: z.string().nullable().optional(),
  allDay: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const ctx = await getContext();
  if (!canWrite(ctx.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = Create.parse(await req.json());
  const e = await prisma.plannerEvent.create({
    data: {
      workspaceId: ctx.workspaceId,
      title: body.title,
      start: new Date(body.start),
      end: body.end ? new Date(body.end) : null,
      allDay: body.allDay ?? false,
      notes: body.notes ?? null,
    },
  });

  await audit({ workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "create", entity: "planner_event", entityId: e.id });

  return NextResponse.json(e);
}
