import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const membership = session.user.memberships[0];
  return NextResponse.json({
    user: { id: session.user.id, email: session.user.email, name: session.user.name },
    workspace: membership?.workspace ? { id: membership.workspace.id, name: membership.workspace.name } : null,
    role: membership?.role ?? null,
  });
}
