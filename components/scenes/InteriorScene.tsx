"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/animation/gsapSetup";
import { scrollToScene } from "@/lib/animation/useMasterScroll";
import SceneChrome from "@/components/ui/SceneChrome";

/**
 * SCENE 06 — INTERIOR
 * The camera pushes through the driver door into the cockpit while the 3D
 * InteriorCabin fades in. This overlay delivers the editorial headline,
 * staggered material callouts, and a feature list that reveals in sync with
 * the multi-stage camera path (approach → push through → settle → pan).
 */

const FEATURES = [
  { label: "Hand-Stitched Nappa Leather", tag: "MATERIAL" },
  { label: "Open-Pore Carbon Fiber Trim", tag: "MATERIAL" },
  { label: "12.3\" Digital Cockpit", tag: "TECHNOLOGY" },
  { label: "Burmester 4D Surround Sound", tag: "TECHNOLOGY" },
  { label: "Ambient Lighting — 64 Colors", tag: "EXPERIENCE" },
  { label: "Heated Steering Wheel", tag: "COMFORT" },
];

export default function InteriorScene() {
  const card = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      // Main title card — slides in from the right
      gsap.fromTo(
        card.current,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scene-06",
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Feature list — stagger in from bottom with sequential reveal
      gsap.fromTo(
        ".interior-feature",
        { opacity: 0, y: 20, x: 12 },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scene-06",
            start: "top 40%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Hairline separator
      gsap.fromTo(
        ".interior-hairline",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "#scene-06",
            start: "top 35%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <SceneChrome id="scene-06" sceneKey="interior">
      <div className="relative h-full w-full">
        {/* ---- Main headline card (right column) ---- */}
        <div
          ref={card}
          className="absolute right-6 md:right-16 lg:right-24 top-[18%] z-10 max-w-[320px] text-right"
        >
          <p className="eyebrow mb-3">SCENE 06</p>
          <h2 className="font-display font-extrabold uppercase leading-[0.92] text-[32px] md:text-[40px] lg:text-[48px] mb-2">
            The command
            <br />
            center.
          </h2>
          <p className="text-[11px] tracking-label text-smoke/70 mb-8 leading-relaxed max-w-[220px] ml-auto">
            STEP INSIDE WHERE LUXURY
            <br />
            MEETS UNCOMPROMISING CONTROL.
          </p>

          {/* Hairline */}
          <div className="interior-hairline hairline w-16 ml-auto mb-8 origin-right" />

          {/* Feature callouts */}
          <div ref={featuresRef} className="space-y-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="interior-feature flex items-center justify-end gap-3 opacity-0"
              >
                <div className="text-right">
                  <p className="text-[9px] tracking-label text-ash/60 mb-0.5">
                    {f.tag}
                  </p>
                  <p className="text-[12px] text-bone/90 font-medium">
                    {f.label}
                  </p>
                </div>
                <div className="w-1 h-1 rounded-full bg-bone/40 shrink-0" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={() => scrollToScene("scene-07")}
              className="btn-ghost"
            >
              EXPLORE SPECS
            </button>
          </div>
        </div>

        {/* ---- Left side — subtle material accent text ---- */}
        <div className="absolute left-6 md:left-16 lg:left-24 bottom-[18%] z-10 pointer-events-none">
          <div className="interior-feature opacity-0">
            <p className="font-display font-extrabold uppercase text-[60px] md:text-[80px] leading-none text-transparent text-stroke/30 select-none">
              CRAFT
            </p>
          </div>
        </div>
      </div>
    </SceneChrome>
  );
}
