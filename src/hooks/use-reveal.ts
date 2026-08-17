import { useCallback, useEffect, useRef, useState } from "react";

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
) {
  const elRef = useRef<T | null>(null);
  const obsRef = useRef<IntersectionObserver | null>(null);
  const [visible, setVisible] = useState(false);

  const observeEl = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    obsRef.current?.disconnect();
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(e.target);
        }
      });
    }, options);
    obs.observe(el);
    obsRef.current = obs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ref = useCallback((node: T | null) => {
    elRef.current = node;
    if (node) observeEl();
    else obsRef.current?.disconnect();
  }, [observeEl]);

  useEffect(() => {
    const handleReset = () => {
      obsRef.current?.disconnect();
      setVisible(false);
      setTimeout(() => observeEl(), 100);
    };
    window.addEventListener("animations:reset", handleReset);
    return () => {
      obsRef.current?.disconnect();
      window.removeEventListener("animations:reset", handleReset);
    };
  }, [observeEl]);

  // Safety net: if the element is already within the viewport (e.g. the page
  // loaded with a #hash and jumped past the observer's first callback), reveal it.
  useEffect(() => {
    if (visible) return;
    let raf = 0;
    const check = () => {
      const el = elRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        obsRef.current?.disconnect();
        setVisible(true);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    const timers = [
      window.setTimeout(check, 150),
      window.setTimeout(check, 600),
      window.setTimeout(check, 1500),
    ];
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [visible]);

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
