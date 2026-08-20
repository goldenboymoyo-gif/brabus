"use client";

import { legendItems, scenes } from "@/data/vehicle";
import { useActiveSceneIndex } from "@/lib/animation/activeSceneStore";
import { scrollToScene } from "@/lib/animation/useMasterScroll";

const SWATCH: Record<string, JSX.Element> = {
  fill: <span className="w-3 h-3 bg-bone/70 inline-block shrink-0" />,
  cross: (
    <span className="w-3 h-3 border border-bone/70 inline-block relative shrink-0">
      <span className="absolute inset-0 rotate-45 border-t border-bone/50" />
      <span className="absolute inset-0 -rotate-45 border-t border-bone/50" />
    </span>
  ),
  play: (
    <span className="w-3 h-3 rounded-full border border-bone/70 inline-flex items-center justify-center shrink-0">
      <span
        className="w-0 h-0 ml-[1px]"
        style={{
          borderTop: "3px solid transparent",
          borderBottom: "3px solid transparent",
          borderLeft: "4px solid rgba(244,243,239,0.8)",
        }}
      />
    </span>
  ),
  dash: (
    <span className="w-3 flex flex-col gap-[2px] shrink-0">
      <span className="h-px w-full bg-bone/50" style={{ borderTop: "1px dashed rgba(244,243,239,0.5)" }} />
    </span>
  ),
};

/**
 * Editorial left sidebar — reproduces the wireframe overview panel: title,
 * description, legend, and the numbered scroll-progress list. Fixed on
 * desktop/tablet; collapses to a slim rail trigger on mobile.
 */
export default function Sidebar() {
  const active = useActiveSceneIndex();

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[172px] lg:w-[212px] z-30 flex-col justify-between py-20 px-6 lg:px-8 border-r border-line-soft bg-void">
      <div>
        <p className="eyebrow mb-3">WIRE FRAME</p>
        <h2 className="font-display font-extrabold text-[22px] lg:text-[26px] leading-[0.95] uppercase mb-6">
          Overview
        </h2>
        <p className="text-[12px] leading-relaxed text-smoke">
          One page, scroll-driven 3D experience. Each section is a scene in
          the story.
        </p>

        <div className="hairline my-8" />

        <p className="eyebrow mb-4">LEGEND</p>
        <ul className="flex flex-col gap-3">
          {legendItems.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-[11px] text-smoke">
              {SWATCH[item.swatch]}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="hairline my-8" />

        <p className="eyebrow mb-4">SCROLL PROGRESS</p>
        <ol className="flex flex-col gap-[10px]">
          {scenes.map((scene, i) => {
            const isActive = i === active;
            return (
              <li key={scene.id}>
                <button
                  onClick={() => scrollToScene(scene.id)}
                  className="flex items-center gap-3 group w-full text-left"
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full border text-[9px] font-medium shrink-0 transition-all duration-300 ${
                      isActive
                        ? "border-bone bg-bone text-black"
                        : "border-line text-ash group-hover:border-bone group-hover:text-bone"
                    }`}
                  >
                    {scene.index}
                  </span>
                  <span
                    className={`text-[10.5px] tracking-label transition-colors duration-300 ${
                      isActive ? "text-bone" : "text-ash group-hover:text-smoke"
                    }`}
                  >
                    {scene.shortLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-col items-start gap-3 text-ash">
        <div className="w-6 h-9 border border-line rounded-full flex justify-center pt-1.5">
          <span className="w-[3px] h-[6px] bg-bone/70 rounded-full animate-bounce" />
        </div>
        <span className="text-[9px] tracking-label rotate-0">Scroll Down</span>
      </div>
    </aside>
  );
}
