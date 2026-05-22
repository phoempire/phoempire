import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scrolls through the page and interpolates document.body backgroundColor
 * based on each section's data-bg attribute. Apple-style scrub transition.
 */
export const ScrollBg = () => {
  useEffect(() => {
    const resolveColor = (color: string) => {
      const probe = document.createElement("span");
      probe.style.color = color;
      probe.style.display = "none";
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved || color;
    };

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-bg]")
    );
    if (!sections.length) return;

    const initial = resolveColor(sections[0].dataset.bg!);
    gsap.set(document.body, { backgroundColor: initial });

    const tweens: gsap.core.Tween[] = [];

    sections.forEach((section, i) => {
      const next = sections[i + 1];
      if (!next) return;
      const fromColor = resolveColor(section.dataset.bg!);
      const toColor = resolveColor(next.dataset.bg!);
      if (fromColor === toColor) return;

      const tween = gsap.fromTo(
        document.body,
        { backgroundColor: fromColor },
        {
          backgroundColor: toColor,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: next,
            start: next.dataset.bgStart || "top 80%",
            end: next.dataset.bgEnd || "top 55%",
            scrub: 0.7,
          },
        }
      );
      tweens.push(tween);
    });

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, []);

  return null;
};
