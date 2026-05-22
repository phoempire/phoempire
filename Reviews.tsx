import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { platformList, formatCountApprox, fetchRatingsFromDB, type Platform } from "@/data/ratings";

const reviews = [
  {
    quote:
      "The broth is unlike anything I've had outside of Vietnam. We come every Sunday — it's our family tradition now.",
    name: "Linh T.",
    location: "Irving, TX",
  },
  {
    quote:
      "Fast, friendly, and the phở is incredible. My kids ask for Phở Empire by name.",
    name: "Maria R.",
    location: "Irving, TX",
  },
  {
    quote:
      "Best phở in the DFW area, hands down. The beef brisket bowl is a must.",
    name: "James K.",
    location: "Irving, TX",
  },
];

export const Reviews = () => {
  const head = useReveal<HTMLDivElement>();
  const [list, setList] = useState<Platform[]>(platformList);

  useEffect(() => {
    let cancelled = false;
    fetchRatingsFromDB().then((data) => {
      if (!cancelled && data && data.length > 0) setList(data);
    });
    return () => { cancelled = true; };
  }, []);

  const totalReviews = list.reduce((sum, p) => sum + p.count, 0);
  const totalRoundedDown = Math.floor(totalReviews / 100) * 100;

  return (
    <section
      id="reviews"
      data-bg="#1A0A05"
      className="bg-[#1A0A05] text-primary-foreground overflow-hidden"
    >
      <div className="container pt-8 pb-24 md:pt-12 md:pb-32">
        <div
          ref={head.ref}
          className={`mx-auto max-w-2xl text-center reveal ${head.visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-gold">
            Loved in Irving
          </span>
          <h2 className="mt-4 text-balance font-serif text-4xl text-primary-foreground md:text-5xl lg:text-6xl">
            Words from <em className="text-accent">our regulars</em>.
          </h2>
        </div>

        <div className="mx-auto mt-16 mb-12 flex max-w-5xl flex-wrap items-center justify-center gap-3 md:gap-4">
          {list.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-4 py-2 text-sm transition-smooth hover:border-gold hover:bg-gold/5"
            >
              <span className="font-medium text-gold">{p.name}</span>
              <Star className="h-3.5 w-3.5 fill-current text-gold" />
              <span className="text-primary-foreground/80">{p.rating.toFixed(1)}</span>
              <span className="text-primary-foreground/50 text-xs">
                · {formatCountApprox(p.count)}
              </span>
            </a>
          ))}
        </div>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 md:gap-8">
          {reviews.map((r, i) => (
            <ReviewCard key={r.name} review={r} index={i} />
          ))}
        </div>

        <div className="mt-12 text-center text-sm tracking-wide text-gold">
          {totalRoundedDown.toLocaleString()}+ total reviews from real customers
        </div>
      </div>
    </section>
  );
};

const ReviewCard = ({
  review,
  index,
}: {
  review: (typeof reviews)[number];
  index: number;
}) => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal group relative flex h-full flex-col rounded-sm border border-gold/40 bg-primary/20 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-gold hover:shadow-warm ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 0.15}s` }}
    >
      <div className="flex gap-1 text-gold" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-6 flex-1 font-serif text-lg italic leading-relaxed text-primary-foreground/90">
        “{review.quote}”
      </blockquote>
      <figcaption className="mt-8 border-t border-primary-foreground/10 pt-4 text-sm">
        <div className="font-medium text-primary-foreground">{review.name}</div>
        <div className="text-primary-foreground/50 text-xs uppercase tracking-[0.3em] mt-1">
          {review.location}
        </div>
      </figcaption>
    </div>
  );
};
