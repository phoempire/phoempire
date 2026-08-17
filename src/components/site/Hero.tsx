import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { FadeImage } from "@/components/site/FadeImage";
import { OrderDialog } from "@/components/site/OrderDialog";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/site/Wordmark";

gsap.registerPlugin(ScrollTrigger);

const initialStoryLines = [
  "Pho, bánh mì, vermicelli & more.",
  "Made fresh, made to order.",
  "Dine in, takeout, or order online.",
];
const initialTagline = "A family-owned Vietnamese kitchen in Irving, TX.";

const initialPhone = "(972) 594-7259";
const initialHours = "11:00 am – 9:00 pm";
const phoneToHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [storyLines, setStoryLines] = useState<string[]>(initialStoryLines);
  const [tagline, setTagline] = useState<string>(initialTagline);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [phone, setPhone] = useState(initialPhone);
  const [hours, setHours] = useState(initialHours);

  useEffect(() => {
    const t = setTimeout(() => setImgLoaded(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("hero_story_line_1,hero_story_line_2,hero_story_line_3,hero_tagline,hero_image_path")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.hero_story_line_1 && data.hero_story_line_2 && data.hero_story_line_3) {
          setStoryLines([data.hero_story_line_1, data.hero_story_line_2, data.hero_story_line_3]);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        }
        if (data.hero_tagline) setTagline(data.hero_tagline);
        if (data.hero_image_path) {
          const url = supabase.storage.from("pho-empire-images").getPublicUrl(data.hero_image_path).data.publicUrl;
          if (url) setImgSrc(url);
        }
      });
    supabase
      .from("site_content")
      .select("phone,hours")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.phone) setPhone(data.phone);
        if (data.hours) {
          // Strip leading day text like "Sunday – Saturday ·" or "Open daily ·"
          const timeOnly = data.hours
            .replace(/^open[^·\-—\n]*[·\-—\n]\s*/i, "")
            .replace(/^[A-Za-z]+\s*[–\-—]\s*[A-Za-z]+\s*[·\-—\n]\s*/i, "")
            .replace(/^[A-Za-z]+\s*[·\-—\n]\s*/i, "")
            .trim();
          setHours(timeOnly);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReduceMotion(true);
      return;
    }
    const ctx = gsap.context(() => {
      const section = sectionRef.current!;
      const total = section.offsetHeight;

      gsap.fromTo(imgRef.current, {
        scale: 1.04,
      }, {
        scale: 1.11,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });

      gsap.to(headlineRef.current, {
        opacity: 0,
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "8% top",
          end: "15% top",
          scrub: 1,
        },
      });

      const phaseStart = total * 0.10;
      const phaseEnd = total * 0.62;
      const phaseLength = phaseEnd - phaseStart;
      const slotSize = phaseLength / storyLines.length;

      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        const isLast = i === storyLines.length - 1;
        const slotStart = phaseStart + i * slotSize;

        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: `top+=${slotStart} top`,
              end: `top+=${slotStart + slotSize * 0.2} top`,
              scrub: true,
            },
          }
        );

        if (!isLast) {
          gsap.to(el, {
            opacity: 0,
            y: -20,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: `top+=${slotStart + slotSize * 0.8} top`,
              end: `top+=${slotStart + slotSize} top`,
              scrub: true,
            },
          });
        }
      });

      gsap.to(imgWrapRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "58% top",
          end: "66% top",
          scrub: 1,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      data-bg="#1A0A05"
      className="relative h-[520vh] w-full [overflow-x:clip] bg-[#1A0A05]"
    >
      {/* Sticky image - pinned for the full section height (520vh) */}
      <div
        ref={imgWrapRef}
        className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#1A0A05]"
        style={{ zIndex: 0 }}
      >
        <FadeImage
          imgRef={imgRef}
          src={imgSrc}
          alt="Steaming bowl of Vietnamese phở with rare beef, rice noodles, and fresh herbs"
          placeholderClassName="bg-[#2A1208]"
          className="absolute inset-0 h-full w-full scale-[1.04] object-cover object-center"
          style={{ transformOrigin: "center center" }}
          width={1920}
          height={1080}
          onImageLoad={() => setImgLoaded(true)}
          loading="eager"
          // @ts-ignore
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-70" />
        {/* Phase 2: story lines - pinned with the image */}
        <div className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none ${reduceMotion ? "flex-col gap-6" : ""}`}>
          {storyLines.map((text, i) => (
            <div
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              style={reduceMotion ? { opacity: 1 } : { position: "absolute", opacity: 0 }}
              className="font-serif italic text-white text-[36px] md:text-[64px] leading-tight text-center max-w-4xl px-6"
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Phase 1: headline - absolute over first 100vh */}
      <div
        className="absolute inset-x-0 top-0 h-[100dvh] z-10 flex max-w-full flex-col items-center justify-center overflow-hidden px-6 text-center text-primary-foreground pointer-events-none transition-opacity duration-500"
        style={{ opacity: imgLoaded ? 1 : 0 }}
      >
        <div ref={headlineRef} className="pointer-events-auto flex w-full max-w-full flex-col items-center">
          <span
            className="mb-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-gold animate-fade-up"
            style={{ animationDuration: "0.6s" }}
          >
            <span className="h-px w-8 bg-gold/70" />
            <span>Fresh</span>
            <span className="inline-block h-1 w-1 rounded-full bg-gold animate-pulse-dot" aria-hidden />
            <span>Healthy</span>
            <span
              className="inline-block h-1 w-1 rounded-full bg-gold animate-pulse-dot"
              style={{ animationDelay: "0.6s" }}
              aria-hidden
            />
            <span>Vietnamese</span>
            <span className="h-px w-8 bg-gold/70" />
          </span>

          <h1
            className="w-full max-w-4xl text-balance leading-[1.05] animate-fade-up text-primary-foreground"
            style={{ animationDuration: "0.6s", animationDelay: "0.2s" }}
          >
            <Wordmark className="max-w-full text-3xl min-[420px]:text-4xl sm:text-6xl md:text-7xl lg:text-8xl" />
            <span className="mt-3 block font-display tracking-[0.08em] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary-foreground">
              NOODLE &amp; GRILL
            </span>
          </h1>

          <p
            className="mt-6 max-w-xl text-balance text-base text-primary-foreground/80 md:text-lg animate-fade-up"
            style={{ animationDuration: "0.6s", animationDelay: "0.4s" }}
          >
            {tagline}
          </p>

          <div
            className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up"
            style={{ animationDuration: "0.6s", animationDelay: "0.6s" }}
          >
            <OrderDialog
              trigger={
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-8 text-base"
                >
                  Order Online
                </Button>
              }
            />
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-primary-foreground/40 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <a href="#menu">View the Menu</a>
            </Button>
          </div>
        </div>

        <div
          className="absolute bottom-20 left-1/2 text-[10px] uppercase tracking-[0.35em] text-primary-foreground animate-scroll-blink"
          style={{ transform: "translateX(-50%)" }}
          aria-hidden
        >
          Scroll ↓
        </div>

        <div className="pointer-events-auto absolute bottom-8 left-0 right-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.22em] text-primary-foreground/55">
          <a href={phoneToHref(phone)} className="hover:text-primary-foreground/90 transition-colors whitespace-nowrap">
            {phone}
          </a>
          <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-primary-foreground/40" aria-hidden />
          <span className="whitespace-nowrap">{hours}</span>
        </div>
      </div>
    </section>
  );
};