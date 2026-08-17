import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { OrderDialog } from "@/components/site/OrderDialog";
import { supabase } from "@/integrations/supabase/client";
import { FadeImage } from "@/components/site/FadeImage";

const initial = {
  name: "Beef Rib ",
  description:
    "A towering braised short rib, slow-simmered until the meat slides off the bone, served over fresh rice noodles in our signature beef broth. Finished with Thai basil, scallions, and a squeeze of lime.",
  availability: "Available while supplies last - ask your server for tonight's count.",
  price: "$18.95",
};

export const LimitedEdition = () => {
  const left = useReveal<HTMLDivElement>();
  const right = useReveal<HTMLDivElement>();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [availability, setAvailability] = useState(initial.availability);
  const [price, setPrice] = useState(initial.price);
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("limited_available,limited_name,limited_description,limited_availability,limited_price,limited_image_path")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setAvailable(data.limited_available !== false);
        if (data.limited_name) {
          // Keep the em "Phở" suffix in the JSX - strip it from the prefix if present.
          const stripped = data.limited_name.replace(/\s*Phở\s*$/i, "");
          setName(stripped ? stripped + " " : data.limited_name + " ");
        }
        if (data.limited_description) setDescription(data.limited_description);
        if (data.limited_availability) setAvailability(data.limited_availability);
        if (data.limited_price) setPrice(data.limited_price);
        if (data.limited_image_path) {
          const url = supabase.storage.from("pho-empire-images").getPublicUrl(data.limited_image_path).data.publicUrl;
          if (url) setImgSrc(url);
        }
      });
    return () => { cancelled = true; };
  }, []);

  if (available !== true) return null;

  return (
    <section id="limited" data-bg="#1A0A05" className="bg-[#1A0A05] text-primary-foreground overflow-hidden">
      <div className="container grid gap-12 py-24 md:grid-cols-2 md:items-center md:gap-16 md:py-32">
        <div
          ref={left.ref}
          className={`reveal reveal-left relative overflow-hidden rounded-sm shadow-warm ${left.visible ? "is-visible" : ""}`}
        >
          <FadeImage
            src={imgSrc}
            alt="Limited edition beef rib phở with a giant braised short rib bone, fresh herbs, lime, and bean sprouts"
            loading="lazy"
            width={1536}
            height={1024}
            placeholderClassName="bg-[#2A1208]"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div
          ref={right.ref}
          className={`reveal reveal-right ${right.visible ? "is-visible" : ""}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-8 bg-gold/70" />
            Limited Edition
          </span>
          <h2 className="mt-4 text-balance text-4xl md:text-5xl lg:text-6xl">
            {name}<em className="text-accent">Phở</em>.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-primary-foreground/80 md:text-lg">
            {description}
          </p>
          <p className="mt-4 italic text-primary-foreground/60">
            {availability}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-primary-foreground/60">
                Chef's price
              </div>
              <div className="mt-1 font-serif text-3xl text-gold">{price}</div>
            </div>
            <OrderDialog
              trigger={
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-8 transition-transform hover:-translate-y-0.5"
                >
                  Reserve a Bowl
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};
