import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { runAutomations } from "@/lib/automation";
import { encryptString, sha256Base64Url } from "@/lib/crypto";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;
const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID; // set in Vercel after first signup

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "OK", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!DEFAULT_WORKSPACE_ID) {
    return NextResponse.json({ ok: false, error: "DEFAULT_WORKSPACE_ID not set" }, { status: 500 });
  }

  try {
    const entries = body?.entry ?? [];

    for (const entry of entries) {
      const changes = entry?.changes ?? [];

      for (const change of changes) {
        const value = change?.value;

        const messages = value?.messages ?? [];
        for (const msg of messages) {
          const text = msg?.text?.body ?? null;
          const externalMsgId = msg?.id ?? null;
          const from = msg?.from ?? null;

          const externalConvId = `wa:${from ?? "unknown"}`;

          const conv = await prisma.conversation.upsert({
            where: { workspaceId_externalId: { workspaceId: DEFAULT_WORKSPACE_ID, externalId: externalConvId } },
            create: {
              workspaceId: DEFAULT_WORKSPACE_ID,
              channel: "whatsapp",
              externalId: externalConvId,
              displayName: from ?? "WhatsApp",
              lastMessageAt: new Date(),
            },
            update: { lastMessageAt: new Date() },
          });

          let contactId: string | null = null;
          if (from) {
            const phoneHash = sha256Base64Url(from);
            // upsert by unique phoneHash
            const existing = await prisma.contact.findUnique({ where: { phoneHash } });
            const c = existing
              ? await prisma.contact.update({
                  where: { id: existing.id },
                  data: { source: "whatsapp" },
                })
              : await prisma.contact.create({
                  data: {
                    workspaceId: DEFAULT_WORKSPACE_ID,
                    phoneEnc: encryptString(from),
                    phoneHash,
                    source: "whatsapp",
                  },
                });

            contactId = c.id;
            if (!conv.contactId) {
              await prisma.conversation.update({ where: { id: conv.id }, data: { contactId } });
            }
          }

          const created = await prisma.message.create({
            data: {
              workspaceId: DEFAULT_WORKSPACE_ID,
              conversationId: conv.id,
              direction: "in",
              textEnc: text ? encryptString(text) : null,
              externalId: externalMsgId,
              raw: msg,
              sentAt: new Date(),
            },
          });

          await runAutomations(DEFAULT_WORKSPACE_ID, "new_message", {
            channel: "whatsapp",
            text: text ?? "",
            conversationId: conv.id,
            messageId: created.id,
            contactId,
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 500 });
  }
}
