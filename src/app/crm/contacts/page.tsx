"use client";
import { Shell } from "@/components/Shell";
import { useEffect, useState } from "react";

export default function Contacts() {
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/crm/contacts");
    setRows(await res.json());
  }

  async function create() {
    const name = prompt("Nome do contato:")?.trim() ?? "";
    if (!name) return;
    await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, source: "manual" }),
    });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-5xl p-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">CRM • Contatos</h1>
          <button onClick={create} className="rounded-md bg-magn-green px-3 py-2 text-sm font-medium text-magn-black hover:opacity-90">
            Novo contato
          </button>
        </div>

        <div className="rounded-xl border border-magn-border overflow-hidden">
          <div className="grid grid-cols-4 gap-0 border-b border-magn-border bg-magn-hover px-4 py-2 text-xs font-semibold">
            <div>Nome</div><div>Telefone</div><div>Instagram</div><div>Email</div>
          </div>
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-4 px-4 py-3 text-sm border-b border-magn-border last:border-b-0">
              <div className="font-medium">{r.name ?? "—"}</div>
              <div>{r.phone ?? "—"}</div>
              <div>{r.instagram ?? "—"}</div>
              <div>{r.email ?? "—"}</div>
            </div>
          ))}
          {rows.length === 0 ? <div className="p-4 text-sm text-gray-500">Sem contatos ainda.</div> : null}
        </div>
      </div>
    </Shell>
  );
}
