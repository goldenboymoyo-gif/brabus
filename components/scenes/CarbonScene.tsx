"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/animation/gsapSetup";
import SceneChrome from "@/components/ui/SceneChrome";

/**
 * SCENE 04 — CARBON
 * Camera macro-pushes into the woven carbon surface (CarbonSurface.tsx);
 * this component places the three-line editorial copy block from the
 * wireframe's right column.
 */
export default function CarbonScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".carbon-line",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scene-04",
            start: "top 50%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SceneChrome id="scene-04" sceneKey="carbon">
      <div ref={root} className="relative h-full w-full flex items-center justify-end">
        <div className="mr-6 md:mr-16 lg:mr-24 text-right">
          <p className="eyebrow mb-4">SCENE 04</p>
          <p className="font-display font-extrabold uppercase leading-[0.95] text-[40px] md:text-[56px] lg:text-[64px]">
            <span className="carbon-line block">Carbon.</span>
            <span className="carbon-line block">Precision.</span>
            <span className="carbon-line block">Obsession.</span>
          </p>
          <div className="hairline w-24 ml-auto mt-6" />
        </div>
      </div>
    </SceneChrome>
  );
}
