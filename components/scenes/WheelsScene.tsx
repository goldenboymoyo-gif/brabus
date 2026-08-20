"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/animation/gsapSetup";
import { scrollToScene } from "@/lib/animation/useMasterScroll";
import SceneChrome from "@/components/ui/SceneChrome";

/**
 * SCENE 05 — WHEELS
 * WheelAssembly.tsx handles the exploded tire/rim/disc/caliper 3D piece;
 * this places the wireframe's right-column copy + EXPLORE CTA.
 */
export default function WheelsScene() {
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
            trigger: "#scene-05",
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <SceneChrome id="scene-05" sceneKey="wheels">
      <div className="relative h-full w-full">
        <div
          ref={card}
          className="absolute right-6 md:right-16 lg:right-24 top-1/2 -translate-y-1/2 z-10 max-w-[300px] text-right"
        >
          <p className="eyebrow mb-3">SCENE 05</p>
          <p className="font-display font-extrabold uppercase leading-[0.95] text-[30px] md:text-[36px] mb-6">
            Engineered to
            <br />
            command the road.
          </p>
          <button onClick={() => scrollToScene("scene-06")} className="btn-ghost">
            EXPLORE
          </button>
        </div>
      </div>
    </SceneChrome>
  );
}
