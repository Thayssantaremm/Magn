import { prisma } from "@/lib/prisma";

type Trigger = "new_message" | "stage_changed" | "tag_added";

type Action =
  | { type: "create_task"; title: string; dueHours?: number; notes?: string }
  | { type: "create_deal"; title: string; stage?: string; value?: number }
  | { type: "add_contact_tag"; tag: string };

function strIncludes(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function runAutomations(workspaceId: string, trigger: Trigger, input: any) {
  const rules = await prisma.automationRule.findMany({
    where: { enabled: true, trigger, workspaceId },
    orderBy: { updatedAt: "desc" },
  });

  for (const rule of rules) {
    try {
      const filter = (rule.filter as any) ?? {};

      if (trigger === "new_message") {
        const channelOk = !filter.channel || filter.channel === input.channel;
        const containsOk =
          !filter.contains || (input.text && strIncludes(input.text, filter.contains));
        if (!channelOk || !containsOk) {
          await prisma.automationLog.create({
            data: { workspaceId, ruleId: rule.id, status: "skipped", input, output: { reason: "filter_no_match" } },
          });
          continue;
        }
      }

      const actions = (rule.actions as any[]) ?? [];
      const outputs: any[] = [];

      for (const a of actions as Action[]) {
        if (a.type === "create_task") {
          const dueAt = a.dueHours ? new Date(Date.now() + a.dueHours * 3600_000) : null;
          const act = await prisma.activity.create({
            data: {
              workspaceId,
              type: "task",
              title: a.title,
              dueAt,
              notes: a.notes ?? null,
              contactId: input.contactId ?? null,
            },
          });
          outputs.push({ createdActivityId: act.id });
        }

        if (a.type === "create_deal") {
          if (!input.contactId) {
            outputs.push({ skipped: "create_deal_no_contact" });
            continue;
          }
          const deal = await prisma.deal.create({
            data: {
              workspaceId,
              contactId: input.contactId,
              title: a.title,
              stage: a.stage ?? "Qualificado",
              value: a.value ?? null,
            },
          });
          outputs.push({ createdDealId: deal.id });
        }

        if (a.type === "add_contact_tag") {
          if (!input.contactId) {
            outputs.push({ skipped: "add_tag_no_contact" });
            continue;
          }
          const c = await prisma.contact.findUnique({ where: { id: input.contactId } });
          const tags = Array.from(new Set([...(c?.tags ?? []), a.tag]));
          await prisma.contact.update({ where: { id: input.contactId }, data: { tags } });
          outputs.push({ addedTag: a.tag });
        }
      }

      await prisma.automationLog.create({
        data: { workspaceId, ruleId: rule.id, status: "ok", input, output: { actions: outputs } },
      });
    } catch (e: any) {
      await prisma.automationLog.create({
        data: { workspaceId, ruleId: rule.id, status: "error", input, output: { error: e?.message ?? "error" } },
      });
    }
  }
}
