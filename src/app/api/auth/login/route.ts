import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { audit } from "@/lib/audit";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const body = Schema.parse(await req.json());

  const user = await prisma.user.findUnique({ where: { email: body.email }, include: { memberships: true } });
  if (!user) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600_000);

  await prisma.session.create({ data: { userId: user.id, tokenHash, expiresAt } });
  setSessionCookie(token, 7 * 24 * 3600);

  const wsId = user.memberships[0]?.workspaceId;
  if (wsId) {
    await audit({ workspaceId: wsId, actorUserId: user.id, action: "login", entity: "user", entityId: user.id });
  }

  return NextResponse.json({ ok: true });
}
