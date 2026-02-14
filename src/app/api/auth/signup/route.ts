import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { audit } from "@/lib/audit";

const Schema = z.object({
  name: z.string().optional(),
  workspaceName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const body = Schema.parse(await req.json());

  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });

  const passwordHash = await bcrypt.hash(body.password, 10);

  const ws = await prisma.workspace.create({ data: { name: body.workspaceName } });

  const user = await prisma.user.create({
    data: { email: body.email, passwordHash, name: body.name ?? null },
  });

  await prisma.membership.create({
    data: { userId: user.id, workspaceId: ws.id, role: "OWNER" },
  });

  // session
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600_000);

  await prisma.session.create({ data: { userId: user.id, tokenHash, expiresAt } });
  setSessionCookie(token, 7 * 24 * 3600);

  await audit({
    workspaceId: ws.id,
    actorUserId: user.id,
    action: "signup",
    entity: "user",
    entityId: user.id,
    meta: { email: body.email },
  });

  return NextResponse.json({ ok: true });
}
