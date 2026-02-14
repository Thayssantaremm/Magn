"use client";
import { Shell } from "@/components/Shell";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

type E = { id: string; title: string; start: string; end?: string | null; allDay: boolean };

export default function Planner() {
  const [events, setEvents] = useState<E[]>([]);

  async function load() {
    const res = await fetch("/api/planner");
    const data = await res.json();
    setEvents(data.map((e: any) => ({ id: e.id, title: e.title, start: e.start, end: e.end, allDay: e.allDay })));
  }

  useEffect(() => { load(); }, []);

  async function create(dateStr: string) {
    const title = prompt("Título do evento (Magn Planner):")?.trim();
    if (!title) return;

    await fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, start: dateStr, allDay: true }),
    });

    load();
  }

  async function onDrop(info: any) {
    await fetch(`/api/planner/${info.event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: info.event.start?.toISOString(),
        end: info.event.end?.toISOString() ?? null,
        allDay: info.event.allDay,
      }),
    });
    load();
  }

  return (
    <Shell>
      <div className="mx-auto max-w-5xl p-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Magn Planner</h1>
          <div className="text-sm text-gray-500">Clique no dia para criar • Arraste para mover</div>
        </div>

        <div className="rounded-xl border border-magn-border p-3">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
            events={events}
            dateClick={(arg) => create(arg.dateStr)}
            editable
            eventDrop={onDrop}
            eventResize={onDrop}
            height="auto"
          />
        </div>
      </div>
    </Shell>
  );
}
