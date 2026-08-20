"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/animation/gsapSetup";
import SceneChrome from "@/components/ui/SceneChrome";
import { specifications, isSpecVerified } from "@/data/vehicle";

/**
 * SCENE 07 — SPECIFICATIONS
 * Reproduces the wireframe's spec-block ring around the centered vehicle.
 * Figures come from data/vehicle.ts (currently concept/placeholder values —
 * see isSpecVerified) and count up into place as the section enters view.
 */
export default function SpecificationsScene() {
  const root = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".spec-block",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scene-07",
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );

      specifications.forEach((spec, i) => {
        const el = valueRefs.current[i];
        if (!el) return;
        const raw = spec.value.replace(/,/g, "");
        const hasDecimal = raw.includes(".");
        const target = parseFloat(raw);
        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: target,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#scene-07",
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = hasDecimal
              ? proxy.val.toFixed(1)
              : Math.round(proxy.val).toLocaleString("en-US");
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const left = specifications.slice(0, 2);
  const right = specifications.slice(2, 4);

  return (
    <SceneChrome id="scene-07" sceneKey="specifications">
      <div ref={root} className="relative h-full w-full flex items-center justify-between px-6 md:px-16 lg:px-24">
        <div className="flex flex-col gap-10 md:gap-14 z-10">
          {left.map((spec, i) => (
            <div key={spec.key} className="spec-block">
              <p className="eyebrow mb-2">{spec.label}</p>
              <p className="font-display font-extrabold text-[13vw] sm:text-[52px] md:text-[64px] leading-none tabular-nums">
                <span ref={(el) => { valueRefs.current[i] = el; }}>0</span>
                <span className="text-[16px] md:text-[20px] font-medium tracking-label ml-2 text-smoke align-top">
                  {spec.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-10 md:gap-14 z-10 text-right">
          {right.map((spec, i) => (
            <div key={spec.key} className="spec-block">
              <p className="eyebrow mb-2">{spec.label}</p>
              <p className="font-display font-extrabold text-[13vw] sm:text-[52px] md:text-[64px] leading-none tabular-nums">
                <span ref={(el) => { valueRefs.current[i + 2] = el; }}>0</span>
                <span className="text-[16px] md:text-[20px] font-medium tracking-label ml-2 text-smoke align-top">
                  {spec.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        {!isSpecVerified && (
          <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[9px] tracking-label text-ash">
            CONCEPT FIGURES — SUBJECT TO CHANGE
          </p>
        )}
      </div>
    </SceneChrome>
  );
}
