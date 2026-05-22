import { useEffect, useRef, useState } from "react";

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let obs: IntersectionObserver;
    const observe = () => {
      obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(e.target);
          }
        });
      }, options);
      obs.observe(el);
    };
    observe();

    const handleReset = () => {
      obs?.disconnect();
      setVisible(false);
      // re-observe after state flush so reveal classes are re-applied from hidden state
      setTimeout(() => {
        observe();
      }, 100);
    };
    window.addEventListener("animations:reset", handleReset);

    return () => {
      obs?.disconnect();
      window.removeEventListener("animations:reset", handleReset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, visible } as const;
}

export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // distance of element center from viewport center
      const center = rect.top + rect.height / 2 - vh / 2;
      setOffset(-center * speed);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return { ref, offset } as const;
}
