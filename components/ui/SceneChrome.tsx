import type { ReactNode } from "react";
import { scenes } from "@/data/vehicle";
import { SECTION_HEIGHT_VH, type SceneKey } from "@/lib/constants/scroll";

/**
 * Shared per-scene chrome: sets each section's scroll height to its share
 * of the master 0..1 timeline (see lib/constants/scroll.ts) so the visible
 * DOM section always matches the 3D choreography's scroll progress, then
 * pins its content to the viewport for the cinematic "scenes transition
 * into one another" feel rather than classic section-by-section scrolling.
 */
export default function SceneChrome({
  id,
  sceneKey,
  className = "",
  children,
}: {
  id: string;
  sceneKey: SceneKey;
  className?: string;
  children: ReactNode;
}) {
  const heightVh = SECTION_HEIGHT_VH[sceneKey];
  return (
    <section
      id={id}
      data-scene={id}
      className={`relative w-full ${className}`}
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">{children}</div>
    </section>
  );
}

export function sceneLabel(id: string) {
  return scenes.find((s) => s.id === id);
}
