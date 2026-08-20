"use client";

import { useEffect, useState } from "react";
import { navLinks, vehicleMeta } from "@/data/vehicle";
import { scrollToScene } from "@/lib/animation/useMasterScroll";
import { setInteriorMuted, isInteriorMuted } from "@/components/three/InteriorSound";
import MobileMenu from "./MobileMenu";

/**
 * Fixed premium nav — wordmark, model designation, primary links, CTA,
 * hamburger. Gains a hairline + subtle backdrop once the page scrolls past
 * the opening reveal so it stays legible without ever feeling heavy.
 */
export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-8 h-16 md:h-[72px] transition-colors duration-500 ${
          scrolled ? "bg-black/70 backdrop-blur-md border-b border-line-soft" : "bg-transparent"
        }`}
      >
        <button
          onClick={() => scrollToScene("scene-01")}
          className="flex items-baseline gap-3 md:gap-4 shrink-0"
          aria-label="Back to top"
        >
          <span className="font-display font-extrabold text-[19px] md:text-[22px] tracking-[0.06em] leading-none">
            {vehicleMeta.brand}
          </span>
          <span className="hidden sm:inline text-[11px] tracking-label text-ash leading-none translate-y-[1px]">
            {vehicleMeta.model} {vehicleMeta.year}
          </span>
        </button>

        <nav className="hidden xl:flex items-center gap-9">
          {navLinks.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollToScene(l.href.replace("#", ""))}
              className="text-[11px] font-medium tracking-label text-smoke hover:text-bone transition-colors duration-300"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setInteriorMuted(next);
            }}
            aria-label={muted ? "Unmute interior sound" : "Mute interior sound"}
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 border border-line hover:border-bone text-smoke hover:text-bone transition-all duration-300"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
          <button
            onClick={() => scrollToScene("scene-09")}
            className="hidden sm:inline-flex items-center border border-line px-5 py-2.5 text-[10px] font-medium tracking-label hover:border-bone hover:bg-bone hover:text-black transition-all duration-300"
          >
            REQUEST INFO
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex flex-col items-end gap-[5px] w-8 py-2 group"
          >
            <span className="h-px w-8 bg-bone transition-all duration-300 group-hover:w-5" />
            <span className="h-px w-5 bg-bone transition-all duration-300 group-hover:w-8" />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
