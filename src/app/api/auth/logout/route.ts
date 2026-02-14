import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie } from "@/lib/auth";
import { cookies } from "next/headers";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST() {
  const token = cookies().get("magn_session")?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
