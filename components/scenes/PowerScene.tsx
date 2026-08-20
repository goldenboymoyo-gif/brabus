"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/animation/gsapSetup";
import SceneChrome from "@/components/ui/SceneChrome";

const LETTERS = "POWER".split("");

/**
 * SCENE 03 — POWER
 * The oversized outline typography from the wireframe, letters breaking
 * apart as the vehicle "accelerates" (handled by the CameraRig FOV punch +
 * Particles speed-streaks driven from the same scroll range).
 */
export default function PowerScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>(".power-letter");
      gsap.set(letters, { xPercent: 0, rotate: 0, opacity: 0.9 });

      gsap.to(letters, {
        xPercent: (i) => (i - 2) * 14,
        rotate: (i) => (i - 2) * 3.2,
        letterSpacing: "0.06em",
        opacity: 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: "#scene-03",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      gsap.fromTo(
        ".power-copy",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scene-03",
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SceneChrome id="scene-03" sceneKey="power">
      <div ref={root} className="relative h-full w-full flex items-center">
        <h2 className="pointer-events-none select-none absolute left-0 md:left-[196px] lg:left-[236px] right-0 text-center font-display font-extrabold uppercase leading-none text-[22vw] md:text-[19vw] text-transparent text-stroke">
          {LETTERS.map((l, i) => (
            <span key={i} className="power-letter inline-block">
              {l}
            </span>
          ))}
        </h2>

        <div className="power-copy relative z-10 ml-auto mr-6 md:mr-16 lg:mr-24 max-w-xs text-right">
          <p className="eyebrow mb-3">SCENE 03</p>
          <p className="font-display font-extrabold text-[26px] md:text-[30px] leading-[0.95] uppercase">
            Relentless
            <br />
            acceleration.
          </p>
        </div>
      </div>
    </SceneChrome>
  );
}
