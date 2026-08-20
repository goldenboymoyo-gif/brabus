"use client";

import { navLinks, footerLinks, vehicleMeta } from "@/data/vehicle";
import { scrollToScene } from "@/lib/animation/useMasterScroll";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-500 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between px-6 h-16">
        <span className="font-display font-extrabold text-[19px] tracking-[0.06em]">
          {vehicleMeta.brand}
        </span>
        <button onClick={onClose} aria-label="Close menu" className="relative w-8 h-8">
          <span className="absolute top-1/2 left-0 w-8 h-px bg-bone rotate-45" />
          <span className="absolute top-1/2 left-0 w-8 h-px bg-bone -rotate-45" />
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-6 mt-10">
        {navLinks.map((l, i) => (
          <button
            key={l.label}
            onClick={() => {
              scrollToScene(l.href.replace("#", ""));
              onClose();
            }}
            className="text-left py-4 border-b border-line-soft font-display font-semibold text-[32px] tracking-tight uppercase"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={() => {
            scrollToScene("scene-09");
            onClose();
          }}
          className="mt-8 btn-ghost w-fit"
        >
          REQUEST INFO
        </button>
      </nav>

      <div className="absolute bottom-8 left-6 right-6 flex flex-wrap gap-x-6 gap-y-2">
        {footerLinks.map((f) => (
          <span key={f.label} className="text-[10px] tracking-label text-ash">
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}
