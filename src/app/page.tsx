"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";

type Row = { id: string; title: string; updatedAt: string };

export default function Home() {
  const [pages, setPages] = useState<Row[]>([]);

  async function load() {
    const res = await fetch("/api/pages");
    if (!res.ok) return;
    setPages(await res.json());
  }

  async function create() {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nova página" }),
    });
    const page = await res.json();
    location.href = `/p/${page.id}`;
  }

  useEffect(() => { load(); }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-3xl p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Home</h1>
          <button
            onClick={create}
            className="rounded-md bg-magn-green px-3 py-2 text-sm font-medium text-magn-black hover:opacity-90"
          >
            New page
          </button>
        </div>

        <div className="mt-6 space-y-2">
          {pages.slice(0, 12).map((p) => (
            <Link key={p.id} href={`/p/${p.id}`} className="block rounded-md border border-magn-border p-3 hover:bg-magn-hover">
              <div className="font-medium">{p.title || "Untitled"}</div>
              <div className="text-xs text-gray-500">Atualizado: {new Date(p.updatedAt).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
