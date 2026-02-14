"use client";
import { Shell } from "@/components/Shell";
import { useEffect, useState } from "react";

export default function Inbox() {
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);

  async function loadConvs() {
    const res = await fetch("/api/inbox/conversations");
    const data = await res.json();
    setConvs(data);
    if (!active && data[0]?.id) setActive(data[0].id);
  }

  async function loadMsgs(id: string) {
    const res = await fetch(`/api/inbox/messages?conversationId=${id}`);
    setMsgs(await res.json());
  }

  useEffect(() => { loadConvs(); }, []);
  useEffect(() => { if (active) loadMsgs(active); }, [active]);

  return (
    <Shell>
      <div className="flex h-[calc(100vh-0px)]">
        <div className="w-80 border-r border-magn-border p-4">
          <div className="mb-3 text-lg font-semibold">Inbox</div>
          <div className="space-y-2">
            {convs.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)}
                className={["w-full rounded-md border border-magn-border p-3 text-left hover:bg-magn-hover", active===c.id?"bg-magn-hover":"bg-white"].join(" ")}>
                <div className="text-sm font-medium">{c.displayName ?? c.contact?.name ?? "Sem nome"}</div>
                <div className="text-xs text-gray-500">{c.channel}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Mensagens</div>
            <button onClick={() => active && loadMsgs(active)} className="rounded-md border border-magn-border px-3 py-2 text-sm hover:bg-magn-hover">
              Atualizar
            </button>
          </div>

          <div className="space-y-2">
            {msgs.map((m) => (
              <div key={m.id}
                className={["max-w-xl rounded-xl border border-magn-border p-3 text-sm", m.direction==="out"?"ml-auto bg-magn-hover":"bg-white"].join(" ")}>
                {m.text ?? <span className="text-gray-500">(sem texto)</span>}
              </div>
            ))}
            {msgs.length === 0 ? <div className="text-sm text-gray-500">Sem mensagens ainda.</div> : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}
