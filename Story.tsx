import interior from "@/assets/interior.jpg";
import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { supabase } from "@/integrations/supabase/client";

const initialBody =
  "Phở Empire started with one simple belief — that great phở takes time, care, and a family recipe worth sharing. We've been serving Irving, Texas, and every bowl we serve comes from the same recipe we make at home.";
const initialTagline = "Come hungry. Leave like family.";
const initialPullquote = "Every bowl starts with 12 hours of patience.";

export const Story = () => {
  const left = useReveal<HTMLDivElement>();
  const right = useReveal<HTMLDivElement>();
  const quote = useReveal<HTMLDivElement>();
  const [body, setBody] = useState(initialBody);
  const [tagline, setTagline] = useState(initialTagline);
  const [pullquote, setPullquote] = useState(initialPullquote);
  const [imgSrc, setImgSrc] = useState(interior);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("story_body,story_tagline,story_pullquote,story_image_path")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.story_body) setBody(data.story_body);
        if (data.story_tagline) setTagline(data.story_tagline);
        if (data.story_pullquote) setPullquote(data.story_pullquote);
        if (data.story_image_path) {
          const url = supabase.storage.from("pho-empire-images").getPublicUrl(data.story_image_path).data.publicUrl;
          if (url) setImgSrc(url);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      id="story"
      data-bg="#FDF6ED"
      className="relative overflow-hidden scroll-mt-20"
      style={{ backgroundColor: "#FDF6ED", zIndex: 1 }}
    >
      {/* Faint Vietnamese-inspired geometric watermark */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full text-[#1A0A05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="story-pattern"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.06"
            >
              <circle cx="60" cy="60" r="40" />
              <circle cx="60" cy="60" r="22" />
              <path d="M60 12 L108 60 L60 108 L12 60 Z" />
              <path d="M0 60 L120 60 M60 0 L60 120" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#story-pattern)" />
      </svg>

      <div className="container relative grid gap-16 py-24 md:grid-cols-2 md:items-center md:py-32">
        <div
          ref={left.ref}
          className={`reveal reveal-left overflow-hidden rounded-sm shadow-warm ${left.visible ? "is-visible" : ""}`}
        >
          <img
            src={imgSrc}
            alt="Warm, homey interior of Phở Empire restaurant"
            loading="lazy"
            width={1024}
            height={1280}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>

        <div
          ref={right.ref}
          className={`reveal reveal-right ${right.visible ? "is-visible" : ""}`}
        >
          {/* gold rule + bowl icon */}
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-gold" />
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-5 w-5 text-gold"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* simple bowl with steam */}
              <path d="M3 12h18a9 9 0 0 1-18 0Z" />
              <path d="M8 7c0-1 1-1.5 1.5-2.5M12 7c0-1 1-1.5 1.5-2.5M16 7c0-1 1-1.5 1.5-2.5" />
            </svg>
          </div>

          <span className="mt-4 inline-block text-xs uppercase tracking-[0.4em] text-gold">
            Our Story
          </span>
          <h2 className="mt-4 text-balance font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
            How <em className="text-accent">phở</em> should taste.
          </h2>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/75 md:text-lg">
            <p>{body}</p>
            <p className="font-medium text-foreground">{tagline}</p>
          </div>
        </div>
      </div>

      {/* Pull quote */}
      <div
        ref={quote.ref}
        className={`reveal container relative pb-24 md:pb-32 ${quote.visible ? "is-visible" : ""}`}
        style={{ transitionDelay: "0.2s" }}
      >
        <figure className="mx-auto max-w-3xl border-t border-foreground/10 pt-12 text-center">
          <blockquote className="font-serif text-2xl italic leading-snug text-foreground md:text-3xl lg:text-4xl">
            <span className="mr-2 text-gold">“</span>
            {pullquote}
            <span className="ml-2 text-gold">”</span>
          </blockquote>
          <figcaption className="mt-6 text-xs uppercase tracking-[0.4em] text-foreground/50">
            — The Phở Empire kitchen
          </figcaption>
        </figure>
      </div>
    </section>
  );
};
