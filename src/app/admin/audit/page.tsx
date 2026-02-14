"use client";
import { Shell } from "@/components/Shell";
import { useEffect, useState } from "react";

export default function AuditPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/audit");
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Sem permissão");
      return;
    }
    setRows(await res.json());
  }

  useEffect(() => { load(); }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-5xl p-10">
        <h1 className="text-2xl font-semibold">Auditoria</h1>
        <p className="mt-1 text-sm text-gray-500">Quem fez o quê e quando.</p>
        {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}

        <div className="mt-6 rounded-xl border border-magn-border overflow-hidden">
          <div className="grid grid-cols-5 gap-0 border-b border-magn-border bg-magn-hover px-4 py-2 text-xs font-semibold">
            <div>Quando</div><div>Ação</div><div>Entidade</div><div>ID</div><div>Usuário</div>
          </div>
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-5 px-4 py-3 text-sm border-b border-magn-border last:border-b-0">
              <div className="text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
              <div>{r.action}</div>
              <div>{r.entity}</div>
              <div className="truncate">{r.entityId ?? "—"}</div>
              <div className="truncate">{r.actorEmail ?? "—"}</div>
            </div>
          ))}
          {rows.length === 0 && !err ? <div className="p-4 text-sm text-gray-500">Sem logs ainda.</div> : null}
        </div>
      </div>
    </Shell>
  );
}
