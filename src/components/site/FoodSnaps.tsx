import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/integrations/supabase/client";
import { FadeImage } from "@/components/site/FadeImage";

gsap.registerPlugin(ScrollTrigger);

const initialSnaps = [
  { src: "", text: "Fresh herbs. Every time.", alt: "Fresh herbs and broth" },
  { src: "", text: "Made fresh, made to order.", alt: "Bowl of phở" },
  { src: "", text: "Family-owned since 2001.", alt: "Restaurant interior" },
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
            const src = row.image_path
              ? supabase.storage.from("pho-empire-images").getPublicUrl(row.image_path).data.publicUrl
              : "";
            return { src: src || "", text: row.overlay_text, alt: row.alt };
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
          <FadeImage
            src={s.src}
            alt={s.alt}
            placeholderClassName="bg-[#2A1208]"
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
