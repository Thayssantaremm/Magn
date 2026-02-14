"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

type Row = { id: string; parentId: string | null; title: string };

function buildTree(rows: Row[]) {
  const byParent = new Map<string | null, Row[]>();
  for (const r of rows) {
    const key = r.parentId ?? null;
    byParent.set(key, [...(byParent.get(key) ?? []), r]);
  }
  return byParent;
}

export function PageTree({ rows, activeId }: { rows: Row[]; activeId?: string }) {
  const byParent = useMemo(() => buildTree(rows), [rows]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function NodeList({ parentId, depth }: { parentId: string | null; depth: number }) {
    const kids = byParent.get(parentId) ?? [];
    return (
      <div className="space-y-0.5">
        {kids.map((p) => {
          const hasChildren = (byParent.get(p.id) ?? []).length > 0;
          const isOpen = open[p.id] ?? true;
          const isActive = activeId === p.id;
          return (
            <div key={p.id}>
              <div
                className={[
                  "flex items-center gap-2 rounded-md px-2 py-1 text-sm",
                  isActive ? "bg-magn-hover" : "hover:bg-magn-hover/70",
                ].join(" ")}
                style={{ marginLeft: depth * 10 }}
              >
                {hasChildren ? (
                  <button
                    className="h-5 w-5 rounded hover:bg-white/60"
                    onClick={() => setOpen((s) => ({ ...s, [p.id]: !isOpen }))}
                    type="button"
                  >
                    <span className="text-xs">{isOpen ? "▾" : "▸"}</span>
                  </button>
                ) : (
                  <span className="inline-block h-5 w-5" />
                )}

                <Link className="flex-1 truncate" href={`/p/${p.id}`}>
                  {p.title || "Untitled"}
                </Link>
              </div>

              {hasChildren && isOpen ? (
                <div className="mt-0.5">
                  <NodeList parentId={p.id} depth={depth + 1} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return <NodeList parentId={null} depth={0} />;
}
