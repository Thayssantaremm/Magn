import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE = "magn_session";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getSession() {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return null;
  const tokenHash = hashToken(c);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { include: { memberships: { include: { workspace: true } } } } },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export function setSessionCookie(token: string, maxAgeSeconds: number) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export function requestIp(): string | null {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
}
