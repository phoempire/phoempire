import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import herbs from "@/assets/herbs.jpg";
import menuPho from "@/assets/menu-pho.jpg";
import interior from "@/assets/interior.jpg";
import { supabase } from "@/integrations/supabase/client";

gsap.registerPlugin(ScrollTrigger);

const fallbacks = [herbs, menuPho, interior];
const initialSnaps = [
  { src: herbs, text: "Fresh herbs. Every time.", alt: "Fresh herbs and broth" },
  { src: menuPho, text: "Slow-simmered. Never rushed.", alt: "Bowl of phở" },
  { src: interior, text: "Irving's table since 2008.", alt: "Restaurant interior" },
];

export const FoodSnaps = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [snaps, setSnaps] = useState(initialSnaps);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("food_snaps")
      .select("slot,overlay_text,alt,image_path,sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (cancelled || !data || data.length === 0) return;
        setSnaps(
          data.map((row, i) => {
            const slotIdx = (row.slot ?? i + 1) - 1;
            const fallback = fallbacks[slotIdx] ?? fallbacks[i] ?? fallbacks[0];
            const src = row.image_path
              ? supabase.storage.from("pho-empire-images").getPublicUrl(row.image_path).data.publicUrl
              : fallback;
            return { src: src || fallback, text: row.overlay_text, alt: row.alt };
          })
        );
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const setupAnimations = () => {
      gsap.utils.toArray<HTMLElement>(".foodsnap-text").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 100%" },
          }
        );
      });
    };

    let ctx = gsap.context(setupAnimations, rootRef);

    const handleReset = () => {
      ctx.revert();
      setTimeout(() => {
        ctx = gsap.context(setupAnimations, rootRef);
      }, 150);
    };
    window.addEventListener("animations:reset", handleReset);

    return () => {
      ctx.revert();
      window.removeEventListener("animations:reset", handleReset);
    };
  }, []);

  return (
    <div ref={rootRef}>
      {snaps.map((s, i) => (
        <section
          key={i}
          data-bg="#1A0A05"
          className="relative h-[70vh] md:h-screen w-full overflow-hidden bg-[#1A0A05]"
        >
          <img
            src={s.src}
            alt={s.alt}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
            style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.82))" }}
          />
          <div className="absolute inset-0 flex items-end">
            <p
              className="foodsnap-text font-serif italic text-white text-[28px] md:text-[48px] leading-tight"
              style={{ padding: "3rem" }}
            >
              {s.text}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
};
