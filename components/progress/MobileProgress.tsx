"use client";

import { scenes } from "@/data/vehicle";
import { useActiveSceneIndex } from "@/lib/animation/activeSceneStore";

/**
 * Compact mobile stand-in for the desktop sidebar + right progress rail —
 * a slim fixed bar showing "0X / 09 — LABEL" with a thin fill underneath.
 */
export default function MobileProgress() {
  const active = useActiveSceneIndex();
  const scene = scenes[active];
  const pct = ((active + 1) / scenes.length) * 100;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-black/70 backdrop-blur-md border-t border-line-soft">
      <div className="h-[2px] bg-line-soft">
        <div
          className="h-full bg-bone transition-all duration-500 ease-cinematic"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between px-5 py-2.5">
        <span className="text-[10px] tracking-label text-ash">
          {scene.index} / {scenes.length.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] tracking-label text-bone">{scene.navLabel}</span>
      </div>
    </div>
  );
}
