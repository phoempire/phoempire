import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { platforms, formatCountApprox, fetchRatingsFromDB } from "@/data/ratings";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "./Wordmark";

const initialAddress = "3591 N Belt Line Rd · Irving, TX 75062";
const initialPhone = "(972) 594-7259";
const initialPhoneHref = "tel:+19725947259";
const initialEmail = "phoempire@yahoo.com";
const initialEmailHref = "mailto:phoempire@yahoo.com";
const initialHours = "Open daily · 11:00 am – 9:00 pm";

const phoneToHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export const Footer = () => {
  const [address, setAddress] = useState(initialAddress);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneHref, setPhoneHref] = useState(initialPhoneHref);
  const [email, setEmail] = useState(initialEmail);
  const [emailHref, setEmailHref] = useState(initialEmailHref);
  const [hours, setHours] = useState(initialHours);
  const [googleRating, setGoogleRating] = useState(platforms.google.rating);
  const [googleCount, setGoogleCount] = useState(platforms.google.count);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("address,phone,email,hours")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.address) setAddress(data.address.replace(/\n/g, " · "));
        if (data.phone) {
          setPhone(data.phone);
          setPhoneHref(phoneToHref(data.phone));
        }
        if (data.email) {
          setEmail(data.email);
          setEmailHref(`mailto:${data.email}`);
        }
        if (data.hours) {
          setHours(/^open/i.test(data.hours) ? data.hours : `Open daily · ${data.hours}`);
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
    <footer
      data-bg="#0D0503"
      className="bg-[#0D0503] text-primary-foreground/70"
    >
      <div className="container flex flex-col items-center gap-8 py-14 md:flex-row md:items-start md:justify-between">
        <div className="text-center md:text-left">
          <Wordmark className="text-2xl text-primary-foreground" />
          <p className="mt-2 text-sm text-primary-foreground/50">
            {address}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/50">
            <a
              href={phoneHref}
              className="hover:text-accent transition-smooth"
            >
              {phone}
            </a>
            {" · "}
            <a
              href={emailHref}
              className="hover:text-accent transition-smooth"
            >
              {email}
            </a>
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <a href="#story" className="hover:text-accent transition-smooth">
            Our Story
          </a>
          <a href="#reviews" className="hover:text-accent transition-smooth">
            Reviews
          </a>
          <a href="#menu" className="hover:text-accent transition-smooth">
            Menu
          </a>
          <a href="#visit" className="hover:text-accent transition-smooth">
            Visit
          </a>
          <a href="#contact" className="hover:text-accent transition-smooth">
            Contact
          </a>
        </nav>

        <a
            href="https://www.google.com/maps/search/?api=1&query=Pho+Empire+Irving+TX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-sm border border-gold/40 px-4 py-3 text-left transition-smooth hover:border-gold hover:bg-gold/5"
          >
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <div className="text-xs leading-tight">
              <div className="font-medium text-primary-foreground">
                {googleRating.toFixed(1)} on Google
              </div>
              <div className="text-primary-foreground/50">
                {formatCountApprox(googleCount)} ratings
              </div>
            </div>
        </a>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs uppercase tracking-widest text-primary-foreground/40 md:flex-row">
          <span>© {new Date().getFullYear()} Phở Empire</span>
          <span>{hours}</span>
        </div>
      </div>
    </footer>
  );
};
