import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getContext } from "@/lib/context";
import { canWrite } from "@/lib/rbac";
import { encryptString, decryptString, sha256Base64Url } from "@/lib/crypto";
import { audit } from "@/lib/audit";

export async function GET() {
  const ctx = await getContext();
  const contacts = await prisma.contact.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    contacts.map((c) => ({
      id: c.id,
      name: c.name,
      phone: decryptString(c.phoneEnc),
      instagram: decryptString(c.instagramEnc),
      email: decryptString(c.emailEnc),
      tags: c.tags,
      source: c.source,
      notes: decryptString(c.notesEnc),
      updatedAt: c.updatedAt,
    }))
  );
}

const Create = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  email: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const ctx = await getContext();
  if (!canWrite(ctx.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = Create.parse(await req.json());

  const phoneHash = body.phone ? sha256Base64Url(body.phone) : null;
  const emailHash = body.email ? sha256Base64Url(body.email.toLowerCase()) : null;
  const instagramHash = body.instagram ? sha256Base64Url(body.instagram.toLowerCase()) : null;

  const c = await prisma.contact.create({
    data: {
      workspaceId: ctx.workspaceId,
      name: body.name ?? null,
      phoneEnc: body.phone ? encryptString(body.phone) : null,
      phoneHash,
      instagramEnc: body.instagram ? encryptString(body.instagram) : null,
      instagramHash,
      emailEnc: body.email ? encryptString(body.email) : null,
      emailHash,
      source: body.source ?? "manual",
      notesEnc: body.notes ? encryptString(body.notes) : null,
    },
  });

  await audit({ workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "create", entity: "contact", entityId: c.id });

  return NextResponse.json({ ok: true, id: c.id });
}
