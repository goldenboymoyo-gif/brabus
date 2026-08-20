"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/animation/gsapSetup";
import SceneChrome from "@/components/ui/SceneChrome";

/**
 * SCENE 08 — THE BEAST
 * The most dramatic beat: headlight intensity + fog both climb hard across
 * this range in the camera choreography, so the vehicle reads as almost
 * pure silhouette + blazing eyes. This component only sets the copy.
 */
export default function BeastScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".beast-line",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scene-08",
            start: "top 50%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SceneChrome id="scene-08" sceneKey="beast">
      <div ref={root} className="relative h-full w-full flex items-center justify-end px-6 md:px-16 lg:px-24">
        <div className="text-right max-w-xl">
          <p className="font-display font-extrabold uppercase leading-[0.95] text-[10vw] sm:text-[48px] md:text-[58px]">
            <span className="beast-line block">You don&apos;t drive it.</span>
            <span className="beast-line block">You command it.</span>
          </p>
        </div>
      </div>
    </SceneChrome>
  );
}
