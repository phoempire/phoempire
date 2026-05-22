import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import menuPho from "@/assets/menu-pho.jpg";
import menuBun from "@/assets/menu-bun.jpg";
import menuBanhMi from "@/assets/menu-banhmi.jpg";
import menuGoiCuon from "@/assets/menu-goicuon.jpg";
import menuCom from "@/assets/menu-com.jpg";
import { supabase } from "@/integrations/supabase/client";

gsap.registerPlugin(ScrollTrigger);

const entrances = [
  { x: -60, y: 50, rotation: -5, scale: 0.75 },
  { x: 0, y: 80, rotation: 3, scale: 0.78 },
  { x: 60, y: 40, rotation: 5, scale: 0.75 },
  { x: -40, y: 70, rotation: -3, scale: 0.78 },
  { x: 40, y: 60, rotation: 4, scale: 0.75 },
];

type Tile = {
  src: string;
  alt: string;
  caption: string;
  className: string;
  rotate?: string;
};

const fallbackImages = [menuPho, menuBun, menuBanhMi, menuGoiCuon, menuCom];
const initialTiles: Tile[] = [
  {
    src: menuPho,
    alt: "Phở Empire — steaming bowl with eye-of-round, flank, tendon and meatballs",
    caption: "Phở Empire",
    className:
      "md:col-start-1 md:col-span-4 md:row-start-1 md:row-span-6 aspect-[4/5]",
    rotate: "-rotate-2",
  },
  {
    src: menuBun,
    alt: "Bún Đặc Biệt — vermicelli combo with grilled meats and egg roll",
    caption: "Bún Đặc Biệt",
    className:
      "md:col-start-5 md:col-span-4 md:row-start-2 md:row-span-4 aspect-[4/3]",
  },
  {
    src: menuBanhMi,
    alt: "Bánh Mì — crispy French bread with grilled pork and pickled vegetables",
    caption: "Bánh Mì",
    className:
      "md:col-start-9 md:col-span-4 md:row-start-1 md:row-span-6 aspect-[4/5]",
    rotate: "rotate-2",
  },
  {
    src: menuGoiCuon,
    alt: "Gỏi Cuốn — fresh spring rolls with shrimp and peanut sauce",
    caption: "Gỏi Cuốn",
    className:
      "md:col-start-3 md:col-span-4 md:row-start-7 md:row-span-5 aspect-[4/3]",
  },
  {
    src: menuCom,
    alt: "Cơm Empire — combo steamed rice with grilled pork chop, chicken and fried egg",
    caption: "Cơm Empire",
    className:
      "md:col-start-8 md:col-span-4 md:row-start-7 md:row-span-5 aspect-[4/3]",
    rotate: "-rotate-1",
  },
];

export const Gallery = () => {
  const headRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<Tile[]>(initialTiles);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("gallery_images")
      .select("slot,src_path,alt,caption,grid_class,rotate_class")
      .order("slot", { ascending: true })
      .then(({ data }) => {
        if (cancelled || !data || data.length === 0) return;
        setTiles(
          data.map((row, i) => {
            const slotIdx = (row.slot ?? i + 1) - 1;
            const fallback = fallbackImages[slotIdx] ?? fallbackImages[i] ?? fallbackImages[0];
            let src = fallback;
            if (row.src_path) {
              if (row.src_path.startsWith("http")) src = row.src_path;
              else {
                const url = supabase.storage.from("pho-empire-images").getPublicUrl(row.src_path).data.publicUrl;
                src = url || fallback;
              }
            }
            return {
              src,
              alt: row.alt,
              caption: row.caption,
              className: row.grid_class,
              rotate: row.rotate_class ?? undefined,
            };
          })
        );
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const el = headRef.current;
    if (!el) return;

    const setupAnimations = () => {
      gsap.set(el, { y: 60, opacity: 0, scale: 0.95 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.0,
            ease: "back.out(1.6)",
          });
        },
      });
    };

    let ctx = gsap.context(setupAnimations);

    const handleReset = () => {
      ctx.revert();
      setTimeout(() => {
        ctx = gsap.context(setupAnimations);
      }, 150);
    };
    window.addEventListener("animations:reset", handleReset);

    return () => {
      ctx.revert();
      window.removeEventListener("animations:reset", handleReset);
    };
  }, []);

  return (
    <section
      id="gallery"
      data-bg="#1A0A05"
      className="overflow-hidden text-primary-foreground"
      style={{ position: "relative", zIndex: 2 }}
    >
      <div className="container py-24 md:py-32">
        <div
          ref={headRef}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-gold">
            From our kitchen
          </span>
          <h2 className="mt-4 text-balance text-4xl text-primary-foreground md:text-5xl lg:text-6xl">
            A taste, <em className="text-accent">in pictures.</em>
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 md:auto-rows-[60px] md:grid-cols-12">
          {tiles.map((t, i) => (
            <GalleryTile key={t.src} tile={t} index={i} total={tiles.length} />
          ))}
        </div>
      </div>
    </section>
  );
};

const GalleryTile = ({ tile, index, total }: { tile: Tile; index: number; total: number }) => {
  const figureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;

    const setupAnimations = () => {
      const e = entrances[index % entrances.length];
      gsap.set(el, { x: e.x, y: e.y, rotation: e.rotation, scale: e.scale, opacity: 0 });
      const caption = el.querySelector("figcaption");
      if (caption) {
        gsap.set(caption, { y: 14, opacity: 0 });
      }
      const img = el.querySelector("img") as HTMLImageElement | null;
      const waitForImage = () =>
        new Promise<void>((resolve) => {
          if (!img || img.complete) return resolve();
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          waitForImage().then(() => {
            gsap.to(el, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: "back.out(2.0)",
              delay: index * 0.1,
            });
            if (caption) {
              gsap.to(caption, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                delay: index * 0.1 + 0.55,
              });
            }
          });
        },
      });
    };

    let ctx = gsap.context(setupAnimations);

    const handleReset = () => {
      ctx.revert();
      setTimeout(() => {
        ctx = gsap.context(setupAnimations);
      }, 150);
    };
    window.addEventListener("animations:reset", handleReset);

    return () => {
      ctx.revert();
      window.removeEventListener("animations:reset", handleReset);
    };
  }, [index]);

  return (
    <figure
      ref={figureRef}
      className={`group relative ${tile.className}`}
      style={{ zIndex: total - index }}
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-sm shadow-card transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:shadow-warm ${tile.rotate ?? ""}`}
      >
        <img
          src={tile.src}
          alt={tile.alt}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <figcaption
        className={`relative z-10 mt-3 text-center font-serif text-base text-primary-foreground/70 ${tile.rotate ?? ""}`}
      >
        {tile.caption}
      </figcaption>
    </figure>
  );
};
