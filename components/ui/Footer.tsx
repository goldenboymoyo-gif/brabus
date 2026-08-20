import { footerLinks, socialLinks, vehicleMeta } from "@/data/vehicle";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line-soft bg-black px-6 md:px-10 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="font-display font-extrabold text-[17px] tracking-[0.06em]">
            {vehicleMeta.brand}
          </span>
          <span className="text-[10px] tracking-label text-ash">
            © 2026 {vehicleMeta.brand}. All Rights Reserved.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
          {footerLinks.map((f) => (
            <a
              key={f.label}
              href={f.href}
              className="text-[10px] tracking-label text-ash hover:text-bone transition-colors duration-300"
            >
              {f.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-[9px] tracking-label text-ash hover:border-bone hover:text-bone transition-colors duration-300"
            >
              {s.label[0]}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
