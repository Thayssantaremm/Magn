"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MagnMark } from "./MagnMark";
import { PageTree } from "./PageTree";
import { CmdK } from "./CmdK";

type Row = { id: string; parentId: string | null; title: string };

export function Shell({ activeId, children }: { activeId?: string; children: React.ReactNode }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [me, setMe] = useState<any>(null);

  async function load() {
    const res = await fetch("/api/pages");
    setRows(await res.json());
    const meRes = await fetch("/api/auth/me");
    if (meRes.ok) setMe(await meRes.json());
  }

  async function create(parentId: string | null = null) {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nova página", parentId }),
    });
    const page = await res.json();
    window.location.href = `/p/${page.id}`;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="flex min-h-screen">
      <aside className="w-72 shrink-0 border-r border-magn-border bg-white">
        <div className="flex items-center gap-2 border-b border-magn-border px-4 py-3">
          <MagnMark />
          <div className="leading-tight flex-1">
            <div className="text-sm font-semibold">Magn</div>
            <div className="text-xs text-gray-500 truncate">
              {me?.workspace?.name ?? "Workspace"}
            </div>
          </div>
          <button onClick={logout} className="text-xs rounded border px-2 py-1 hover:bg-magn-hover">Sair</button>
        </div>

        <div className="p-3 space-y-3">
          <button
            onClick={() => create(null)}
            className="w-full rounded-md border border-magn-border px-3 py-2 text-sm hover:bg-magn-hover"
          >
            New page
          </button>

          <div className="grid gap-1">
            <Link className="rounded-md px-2 py-1 text-sm hover:bg-magn-hover" href="/planner">
              Magn Planner
            </Link>
            <Link className="rounded-md px-2 py-1 text-sm hover:bg-magn-hover" href="/inbox">
              Inbox (WA/IG)
            </Link>
            <Link className="rounded-md px-2 py-1 text-sm hover:bg-magn-hover" href="/crm/contacts">
              CRM
            </Link>
            <Link className="rounded-md px-2 py-1 text-sm hover:bg-magn-hover" href="/admin/audit">
              Auditoria
            </Link>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-gray-500">Pages</div>
            <PageTree rows={rows} activeId={activeId} />
          </div>

          <div className="text-xs text-gray-500">Ctrl/⌘ + K para buscar</div>
        </div>
      </aside>

      <main className="flex-1 bg-white">
        <CmdK rows={rows.map((r) => ({ id: r.id, title: r.title }))} onCreate={() => create(null)} />
        {children}
      </main>
    </div>
  );
}
