import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";

export async function GET() {
  const ctx = await getContext();
  const convs = await prisma.conversation.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: { contact: true },
  });
  return NextResponse.json(convs);
}
