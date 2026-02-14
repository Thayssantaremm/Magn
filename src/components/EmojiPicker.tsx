"use client";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="rounded-xl border border-magn-border bg-white p-2 shadow-sm">
      <Picker data={data} theme="light" onEmojiSelect={(e: any) => onPick(e.native)} />
    </div>
  );
}
