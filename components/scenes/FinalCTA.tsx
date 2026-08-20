"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/animation/gsapSetup";
import SceneChrome from "@/components/ui/SceneChrome";
import { scrollToScene } from "@/lib/animation/useMasterScroll";

/**
 * SCENE 09 — FINAL CTA
 * Minimal, centered, bold — deliberately the quietest scene in the film.
 */
export default function FinalCTA() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-reveal",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scene-09",
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SceneChrome id="scene-09" sceneKey="finalCta">
      <div ref={root} className="relative h-full w-full flex flex-col items-center justify-center text-center px-6">
        <h2 className="cta-reveal font-display font-extrabold uppercase leading-[0.95] text-[11vw] sm:text-[54px] md:text-[64px] mb-9">
          Ready to unleash it?
        </h2>
        <div className="cta-reveal flex flex-col sm:flex-row items-center gap-4">
          <button onClick={() => scrollToScene("scene-02")} className="btn-ghost min-w-[240px]">
            EXPLORE THE MACHINE
          </button>
          <button className="btn-ghost min-w-[240px] !border-bone !bg-bone !text-black hover:!bg-transparent hover:!text-bone">
            REQUEST INFORMATION
          </button>
        </div>
      </div>
    </SceneChrome>
  );
}
