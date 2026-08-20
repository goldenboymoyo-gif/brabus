"use client";

import { useState } from "react";
import { paintColor } from "@/lib/three/sharedState";

/* ========================================================================
 * Color Picker UI
 * ---------------------------------------------------------------------------
 * Floating panel that lets the user change the car's exterior paint color.
 * Appears on click of the paint icon. Preset Brabus colors + custom input.
 * ======================================================================== */

const PRESET_COLORS = [
  { name: "Obsidian Black", hex: "#0c0c0f" },
  { name: "Arctic White", hex: "#e8e4e0" },
  { name: "Brabus Red", hex: "#8b1a1a" },
  { name: "Racing Blue", hex: "#1a3a6b" },
  { name: "British Racing Green", hex: "#1a4a2a" },
  { name: "Champagne Gold", hex: "#c9a96e" },
  { name: "Matte Gunmetal", hex: "#2a2d32" },
  { name: "Desert Sand", hex: "#b8a080" },
  { name: "Midnight Purple", hex: "#2a1040" },
  { name: "Nardo Grey", hex: "#7a7d82" },
];

export default function ColorPicker() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("#e8e4e0");

  const selectColor = (hex: string) => {
    setSelected(hex);
    paintColor.current = hex;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2 border border-line bg-black/80 backdrop-blur-sm px-4 py-2.5 text-[10px] tracking-label text-bone/80 hover:border-bone hover:text-bone transition-all duration-300"
        title="Change paint color"
      >
        <div
          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
          style={{ backgroundColor: selected }}
        />
        <span className="hidden md:inline">PAINT</span>
      </button>

      {/* Color panel */}
      {open && (
        <div className="absolute bottom-14 right-0 bg-black/90 backdrop-blur-md border border-line p-4 w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-[9px] tracking-label text-ash/60 mb-3">EXTERIOR COLOR</p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => selectColor(c.hex)}
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  selected === c.hex ? "border-bone scale-110" : "border-white/10"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[9px] tracking-label text-ash/60">CUSTOM</label>
            <input
              type="color"
              value={selected}
              onChange={(e) => selectColor(e.target.value)}
              className="w-8 h-8 border-0 bg-transparent cursor-pointer"
            />
            <span className="text-[10px] text-bone/60 font-mono">{selected}</span>
          </div>
          <p className="text-[8px] text-ash/40 mt-2">{PRESET_COLORS.find(c => c.hex === selected)?.name || "Custom"}</p>
        </div>
      )}
    </div>
  );
}
