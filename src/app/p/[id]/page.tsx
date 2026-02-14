"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { EmojiPicker } from "@/components/EmojiPicker";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import { BlockNoteView } from "@blocknote/react";
import { useCreateBlockNote } from "@blocknote/react";

export default function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const editor = useCreateBlockNote({ initialContent: [] });

  async function load() {
    const res = await fetch(`/api/pages/${id}`);
    const data = await res.json();
    setTitle(data.title ?? "Untitled");
    if (data.content) editor.replaceBlocks(editor.document, data.content);
  }

  useEffect(() => { load(); }, [id]);

  async function save(nextTitle?: string) {
    const payload: any = { content: editor.document };
    if (typeof nextTitle === "string") payload.title = nextTitle;

    await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  function insertEmoji(emoji: string) {
    editor.insertText(emoji);
    setShowEmoji(false);
  }

  return (
    <Shell activeId={id}>
      <div className="mx-auto max-w-3xl p-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => save(title)}
            className="w-full bg-transparent text-4xl font-semibold outline-none"
            placeholder="Untitled"
          />
          <button className="shrink-0 rounded-md border border-magn-border px-3 py-2 text-sm hover:bg-magn-hover"
            onClick={() => setShowEmoji((v) => !v)} type="button" title="Emojis">
            😀
          </button>
        </div>

        {showEmoji ? (
          <div className="mb-4">
            <EmojiPicker onPick={insertEmoji} />
          </div>
        ) : null}

        <div className="mt-2">
          <BlockNoteView editor={editor} onChange={() => save()} />
        </div>
      </div>
    </Shell>
  );
}
