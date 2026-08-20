"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/animation/gsapSetup";
import { scrollToScene } from "@/lib/animation/useMasterScroll";
import SceneChrome from "@/components/ui/SceneChrome";
import { vehicleMeta } from "@/data/vehicle";

/**
 * SCENE 01 — THE REVEAL
 * Opens near-total black; a controlled vignette lifts and the headlights
 * bloom in as the choreography's headlight/fog values (driven in
 * lib/three/cameraPath.ts) creep up across this section's scroll range.
 */
export default function RevealScene() {
  const root = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        veil.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: "#scene-01",
            start: "top top",
            end: "50% top",
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        copy.current,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 1.4, ease: "power3.out", delay: 0.4 }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <SceneChrome id="scene-01" sceneKey="reveal" className="bg-transparent">
      <div ref={root} className="relative w-full h-full">
        <div
          ref={veil}
          className="absolute inset-0 z-[5] bg-black pointer-events-none"
        />

        <div className="relative z-10 h-full w-full flex flex-col justify-end px-6 md:pl-[220px] lg:pl-[260px] md:pr-16 pb-20 md:pb-28">
          <div ref={copy} className="max-w-xl">
            <p className="font-display font-extrabold text-[15px] tracking-[0.1em] mb-6">
              {vehicleMeta.brand}
            </p>
            <h1 className="font-display font-extrabold uppercase leading-[0.92] text-[13vw] sm:text-[64px] md:text-[76px] lg:text-[92px] tracking-tight">
              Built to be
              <br />
              unreasonable.
            </h1>
            <div className="hairline w-24 my-7" />
            <button
              onClick={() => scrollToScene("scene-02")}
              className="btn-ghost"
            >
              EXPLORE
            </button>
          </div>
        </div>
      </div>
    </SceneChrome>
  );
}
