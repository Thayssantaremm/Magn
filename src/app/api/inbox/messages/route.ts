import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { decryptString } from "@/lib/crypto";

export async function GET(req: Request) {
  const ctx = await getContext();
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  const msgs = await prisma.message.findMany({
    where: { conversationId, workspaceId: ctx.workspaceId },
    orderBy: { sentAt: "asc" },
  });

  return NextResponse.json(
    msgs.map((m) => ({ ...m, text: decryptString(m.textEnc) }))
  );
}
