"use client";

import { useEffect } from "react";
import { ensureGsapRegistered, ScrollTrigger } from "@/lib/animation/gsapSetup";
import { updateScrollProgress, scrollState } from "@/lib/three/scrollState";
import { SCENE_RANGES } from "@/lib/constants/scroll";
import { setActiveSceneIndex } from "@/lib/animation/activeSceneStore";

/**
 * Drives the single master scroll timeline for the whole experience.
 * One ScrollTrigger spans the full document height; its progress (0..1)
 * feeds the 3D camera rig directly (via the scrollState singleton, no
 * React re-render) and also updates which scene is "active" for the
 * sidebar / right progress rail / top nav.
 */
export function useMasterScroll() {
  useEffect(() => {
    ensureGsapRegistered();

    const mm = gsapMatchMedia();
    scrollState.reducedFx = mm;

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        updateScrollProgress(self.progress);
        const idx = SCENE_RANGES.findIndex(
          (r) => self.progress >= r.start && self.progress < r.end
        );
        setActiveSceneIndex(idx === -1 ? SCENE_RANGES.length - 1 : idx);
      },
    });

    const onResize = () => {
      scrollState.width = window.innerWidth;
      scrollState.height = window.innerHeight;
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
    };
  }, []);
}

function gsapMatchMedia(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 820px)").matches;
}

/** Smoothly scrolls the page to a given scene id (e.g. "scene-03"). */
export function scrollToScene(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
