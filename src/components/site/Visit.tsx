import { Clock, MapPin, Phone, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { OrderDialog } from "@/components/site/OrderDialog";
import { platforms, formatCountApprox, fetchRatingsFromDB } from "@/data/ratings";
import { supabase } from "@/integrations/supabase/client";

const initialAddressTitle = "3591 N. Belt Line Rd";
const initialAddressSub = "Irving, TX 75062";
const initialPhone = "(972) 594-7259";
const initialPhoneHref = "tel:+19725947259";
const initialHoursSub = "11:00 am – 9:00 pm";

const phoneToHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export const Visit = () => {
  const left = useReveal<HTMLDivElement>();
  const right = useReveal<HTMLDivElement>();
  const [addressTitle, setAddressTitle] = useState(initialAddressTitle);
  const [addressSub, setAddressSub] = useState(initialAddressSub);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneHref, setPhoneHref] = useState(initialPhoneHref);
  const [hoursSub, setHoursSub] = useState(initialHoursSub);
  const [googleRating, setGoogleRating] = useState(platforms.google.rating);
  const [googleCount, setGoogleCount] = useState(platforms.google.count);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("address,phone,hours")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.address) {
          const parts = data.address.split(/\n|,\s*/);
          setAddressTitle(parts[0] ?? data.address);
          setAddressSub(parts.slice(1).join(", ") || initialAddressSub);
        }
        if (data.phone) {
          setPhone(data.phone);
          setPhoneHref(phoneToHref(data.phone));
        }
        if (data.hours) {
          setHoursSub(
            data.hours
              .replace(/sunday\s*[–-]\s*saturday\s*·?\s*/i, "")
              .replace(/^open daily\s*·?\s*/i, "")
              .trim()
          );
        }
      });
    fetchRatingsFromDB().then((rows) => {
      if (cancelled || !rows) return;
      const g = rows.find((r) => r.key === "google");
      if (g) {
        setGoogleRating(g.rating);
        setGoogleCount(g.count);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="visit" data-bg="#F5EBD8" className="overflow-hidden">
      <div className="container grid gap-12 py-24 md:grid-cols-5 md:gap-16 md:py-32">
        <div
          ref={left.ref}
          className={`md:col-span-2 reveal reveal-left ${left.visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-accent">Visit Us</span>
          <h2 className="mt-4 text-balance text-4xl md:text-5xl lg:text-6xl">
            Come <em className="text-accent">sit</em> with us.
          </h2>
          <p className="mt-6 text-muted-foreground italic">
            We're on N. Belt Line Rd in Irving - open seven days a week for
            lunch, dinner, takeout, and catering.
          </p>

          <div className="mt-10 space-y-6">
            {[
              {
                key: "address",
                icon: MapPin,
                title: addressTitle,
                sub: addressSub,
              },
              {
                key: "phone",
                icon: Phone,
                title: (
                  <a
                    href={phoneHref}
                    className="font-medium hover:text-accent transition-smooth"
                  >
                    {phone}
                  </a>
                ),
                sub: "Reservations · takeout · catering",
              },
              {
                key: "hours",
                icon: Clock,
                title: "Open daily",
                sub: hoursSub,
              },
              {
                key: "reviews",
                icon: Star,
                title: (
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Pho+Empire+Irving+TX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-accent transition-smooth"
                  >
                    Read our Google Reviews →
                  </a>
                ),
                sub: `${googleRating.toFixed(1)} ★ on Google · ${formatCountApprox(googleCount)} ratings`,
              },
            ].map(({ key, icon: Icon, title, sub }, i) => (
              <div
                key={key}
                className={`flex gap-4 reveal ${left.visible ? "is-visible" : ""}`}
                style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
              >
                <Icon className="mt-1 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <div className="font-medium">{title}</div>
                  <div className="text-sm text-muted-foreground">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div id="order" className="mt-10 flex flex-wrap gap-3">
            <OrderDialog
              trigger={
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-6 transition-transform hover:-translate-y-0.5">
                  Order for Pickup
                </Button>
              }
            />
            <Button asChild variant="outline" className="h-11 px-6 transition-transform hover:-translate-y-0.5">
              <a href={phoneHref}>Call {phone}</a>
            </Button>
          </div>
        </div>

        <div
          ref={right.ref}
          className={`md:col-span-3 reveal reveal-right ${right.visible ? "is-visible" : ""}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <iframe
            title="Phở Empire - 3591 N Belt Line Rd, Irving, TX"
            src="https://www.google.com/maps?q=3591+N+Belt+Line+Rd,+Irving,+TX+75062&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full min-h-[420px] w-full rounded-sm border-0 shadow-card"
          />
        </div>
      </div>
    </section>
  );
};
