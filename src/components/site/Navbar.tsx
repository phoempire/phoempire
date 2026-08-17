import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STATS_REPLAY_EVENT } from "@/components/site/Stats";
import { OrderDialog } from "@/components/site/OrderDialog";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/site/Wordmark";

const links = [
  { href: "#gallery", id: "gallery", label: "Our Story" },
  { href: "#reviews-section", id: "reviews-section", label: "Reviews" },
  { href: "#menu", id: "menu", label: "Menu" },
  { href: "#limited", id: "limited", label: "Limited Edition" },
  { href: "#visit", id: "visit", label: "Visit" },
  { href: "#contact", id: "contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [limitedAvailable, setLimitedAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("limited_available")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setLimitedAvailable(data?.limited_available !== false);
      });
    return () => { cancelled = true; };
  }, []);

  const visibleLinks = links.filter((l) => l.id !== "limited" || limitedAvailable === true);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const first = document.getElementById(links[0].id);
      if (first) {
        const firstTop = first.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY + window.innerHeight * 0.55 < firstTop) {
          setActive("");
        }
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-t-[3px] border-gold transition-smooth",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <nav className="container flex h-16 items-center justify-between md:h-20">
        <a
          href="#top"
          onClick={() => {
            window.dispatchEvent(new CustomEvent(STATS_REPLAY_EVENT));
            window.dispatchEvent(new CustomEvent("animations:reset"));
          }}
          className="flex items-center gap-2 leading-none"
          style={{ color: scrolled ? "#7a1a1a" : undefined }}
        >
          <Wordmark
            className={cn("text-lg md:text-xl", scrolled ? "" : "text-primary-foreground")}
            ringColor={scrolled ? "#ffffff" : "#7a1a1a"}
          />
        </a>
        <ul
          className={cn(
            "hidden items-center gap-8 text-sm font-medium md:flex",
            scrolled ? "text-foreground" : "text-primary-foreground"
          )}
        >
          {visibleLinks.map((l) => {
            const isActive = active === l.id;
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={
                    l.id === "reviews-section"
                      ? () =>
                          window.dispatchEvent(
                            new CustomEvent(STATS_REPLAY_EVENT)
                          )
                      : undefined
                  }
                  className={cn(
                    "relative transition-smooth hover:text-accent",
                    "after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-gold",
                    "after:transition-all after:duration-300",
                    isActive ? "text-accent after:w-full" : "after:w-0 hover:after:w-full"
                  )}
                >
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>
        <OrderDialog
          trigger={
            <Button
              variant="default"
              className="bg-accent text-accent-foreground hover:bg-accent/90 animate-soft-pulse"
            >
              Order Online
            </Button>
          }
        />
      </nav>
    </header>
  );
};
