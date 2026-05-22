import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/integrations/supabase/client";

gsap.registerPlugin(ScrollTrigger);

const initialStats = [
  { value: 4.8, suffix: " ★", label: "Uber Eats rating", decimals: 1 },
  { value: 4.4, suffix: " ★", label: "Google rating", decimals: 1 },
  { value: 25, suffix: "+", label: "Years in Irving", decimals: 0 },
];

export const STATS_REPLAY_EVENT = "stats:replay";

export const Stats = () => {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("ratings")
      .select("platform_key,rating,name")
      .in("platform_key", ["ubereats", "google"])
      .then(({ data }) => {
        if (cancelled || !data) return;
        const ue = data.find((r) => r.platform_key === "ubereats");
        const g = data.find((r) => r.platform_key === "google");
        setStats((prev) => prev.map((s, i) => {
          if (i === 0 && ue) return { ...s, value: Number(ue.rating), label: `${ue.name} rating` };
          if (i === 1 && g) return { ...s, value: Number(g.rating), label: `${g.name} rating` };
          return s;
        }));
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      id="reviews-section"
      data-bg="#1A0A05"
      className="scroll-mt-20 bg-[#1A0A05] text-primary-foreground"
    >
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-3 md:gap-8 text-center">
          {stats.map((s, i) => (
            <StatBlock key={i} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatBlock = ({
  value,
  suffix,
  label,
  decimals,
  index,
}: {
  value: number;
  suffix: string;
  label: string;
  decimals: number;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const pendingTriggerRef = useRef<ScrollTrigger | null>(null);

  const playAnimation = useCallback(() => {
    tweenRef.current?.kill();
    setDisplay("0");
    const counter = { v: 0 };
    tweenRef.current = gsap.to(counter, {
      v: value,
      duration: 1.5,
      ease: "power2.out",
      delay: index * 0.15,
      onUpdate: () => setDisplay(counter.v.toFixed(decimals)),
    });
  }, [value, decimals, index]);

  const scheduleAnimation = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    tweenRef.current?.kill();
    setDisplay("0");
    pendingTriggerRef.current?.kill();
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
    if (inView) {
      playAnimation();
    } else {
      pendingTriggerRef.current = ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: playAnimation,
      });
    }
  }, [playAnimation]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    scheduleAnimation();

    const handleReplay = () => {
      setTimeout(scheduleAnimation, 300);
    };
    window.addEventListener(STATS_REPLAY_EVENT, handleReplay);

    return () => {
      pendingTriggerRef.current?.kill();
      tweenRef.current?.kill();
      window.removeEventListener(STATS_REPLAY_EVENT, handleReplay);
    };
  }, [playAnimation, scheduleAnimation]);

  return (
    <div ref={ref}>
      <div
        className="font-serif"
        style={{ color: "#D4A017", fontSize: "52px", lineHeight: 1 }}
      >
        {display}
        {suffix}
      </div>
      <div
        className="mt-2 uppercase text-primary-foreground/50"
        style={{ fontSize: "11px", letterSpacing: "0.3em" }}
      >
        {label}
      </div>
    </div>
  );
};