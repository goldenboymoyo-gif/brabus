"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/animation/gsapSetup";
import { scrollToScene } from "@/lib/animation/useMasterScroll";
import SceneChrome from "@/components/ui/SceneChrome";
import { vehicleMeta } from "@/data/vehicle";

/**
 * SCENE 02 — 3D HERO
 * The persistent canvas performs the orbit (front -> 3/4 -> side ->
 * rear 3/4 -> rear) over this section's scroll range; this component only
 * places the wireframe's boxed info card in the same position/proportion.
 */
export default function HeroScene() {
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        card.current,
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scene-02",
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <SceneChrome id="scene-02" sceneKey="hero">
      <div className="relative h-full w-full">
        <div
          ref={card}
          className="absolute right-6 md:right-16 lg:right-24 top-1/2 -translate-y-1/2 z-10 w-[240px] md:w-[280px] border border-line bg-black/50 backdrop-blur-sm px-6 py-7"
        >
          <p className="eyebrow mb-2">{vehicleMeta.year}</p>
          <h2 className="font-display font-extrabold text-[26px] md:text-[30px] leading-none uppercase mb-4">
            {vehicleMeta.model}
            <br />
            {vehicleMeta.year}
          </h2>
          <p className="text-[11px] tracking-label text-smoke leading-relaxed mb-6">
            ICONIC SHAPE.
            <br />
            BRUTAL PRESENCE.
          </p>
          <button onClick={() => scrollToScene("scene-03")} className="btn-ghost !px-5 !py-2.5 text-[10px]">
            DISCOVER
          </button>
        </div>
      </div>
    </SceneChrome>
  );
}
