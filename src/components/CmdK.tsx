"use client";
import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";

type Row = { id: string; title: string };

export function CmdK({ rows, onCreate }: { rows: Row[]; onCreate: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows.slice(0, 30);
    return rows.filter((r) => (r.title || "untitled").toLowerCase().includes(query)).slice(0, 30);
  }, [rows, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30" onMouseDown={() => setOpen(false)}>
      <div
        className="mx-auto mt-24 w-[92%] max-w-xl overflow-hidden rounded-xl border border-magn-border bg-white shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Command>
          <div className="flex items-center gap-2 border-b border-magn-border px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-magn-yellow" />
            <Command.Input
              value={q}
              onValueChange={setQ}
              placeholder="Buscar páginas…"
              className="w-full bg-transparent text-sm outline-none"
              autoFocus
            />
            <kbd className="rounded border px-2 py-0.5 text-xs text-gray-500">ESC</kbd>
          </div>

          <Command.List className="max-h-80 overflow-auto p-2">
            <Command.Empty className="p-3 text-sm text-gray-500">Nada encontrado.</Command.Empty>

            <Command.Item
              onSelect={() => {
                setOpen(false);
                onCreate();
              }}
              className="cursor-pointer rounded-md px-3 py-2 text-sm aria-selected:bg-magn-hover"
            >
              + Criar nova página
            </Command.Item>

            <div className="my-2 border-t border-magn-border" />

            {filtered.map((r) => (
              <Command.Item
                key={r.id}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/p/${r.id}`);
                }}
                className="cursor-pointer rounded-md px-3 py-2 text-sm aria-selected:bg-magn-hover"
              >
                {r.title || "Untitled"}
              </Command.Item>
            ))}
          </Command.List>

          <div className="border-t border-magn-border px-3 py-2 text-xs text-gray-500">
            Dica: Ctrl/⌘ + K • Enter para navegar
          </div>
        </Command>
      </div>
    </div>
  );
}
