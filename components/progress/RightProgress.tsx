"use client";

import { scenes } from "@/data/vehicle";
import { useActiveSceneIndex } from "@/lib/animation/activeSceneStore";
import { scrollToScene } from "@/lib/animation/useMasterScroll";

/**
 * Vertical scene-progress rail on the right edge, echoing the wireframe's
 * numbered column with a connecting tick line — not a generic progress bar.
 * The active number is bold; clicking any number smoothly scrolls there.
 */
export default function RightProgress() {
  const active = useActiveSceneIndex();

  return (
    <nav className="hidden md:flex fixed top-1/2 -translate-y-1/2 right-5 lg:right-8 z-30 flex-col items-center">
      {scenes.map((scene, i) => {
        const isActive = i === active;
        const isLast = i === scenes.length - 1;
        return (
          <div key={scene.id} className="flex flex-col items-center">
            <button
              onClick={() => scrollToScene(scene.id)}
              className="group relative flex items-center justify-center py-1"
              aria-label={`Go to ${scene.navLabel}`}
            >
              <span
                className={`font-display transition-all duration-400 ease-cinematic leading-none ${
                  isActive
                    ? "text-[15px] font-extrabold text-bone"
                    : "text-[11px] font-medium text-ash group-hover:text-smoke"
                }`}
              >
                {scene.index}
              </span>
              <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap text-[10px] tracking-label opacity-0 group-hover:opacity-70 transition-opacity duration-300 text-smoke">
                {scene.navLabel}
              </span>
            </button>
            {!isLast && (
              <span
                className={`w-px transition-all duration-300 ${
                  isActive || i < active ? "h-3 bg-bone/50" : "h-3 bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
