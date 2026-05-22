import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useReveal } from "@/hooks/use-reveal";
import { supabase } from "@/integrations/supabase/client";

const initialHeadlinePrefix = "Catering, parties, ";
const initialHeadlineEm = "questions.";
const fullInitialHeadline = `${initialHeadlinePrefix}${initialHeadlineEm}`;
const initialBody =
  "Reach us for reservations, menu questions, or catering — call ";
const initialPhone = "(972) 594-7259";
const initialPhoneHref = "tel:+19725947259";
const initialEmail = "phoempire@yahoo.com";
const initialEmailHref = "mailto:phoempire@yahoo.com";

const phoneToHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export const Contact = () => {
  const [loading, setLoading] = useState(false);
  const left = useReveal<HTMLDivElement>();
  const right = useReveal<HTMLFormElement>();
  const [headline, setHeadline] = useState<{ prefix: string; em: string } | string>({
    prefix: initialHeadlinePrefix,
    em: initialHeadlineEm,
  });
  const [body, setBody] = useState(initialBody);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneHref, setPhoneHref] = useState(initialPhoneHref);
  const [email, setEmail] = useState(initialEmail);
  const [emailHref, setEmailHref] = useState(initialEmailHref);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("contact_headline,contact_body,phone,email")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.contact_headline && data.contact_headline !== fullInitialHeadline) {
          setHeadline(data.contact_headline);
        }
        if (data.contact_body) setBody(data.contact_body);
        if (data.phone) {
          setPhone(data.phone);
          setPhoneHref(phoneToHref(data.phone));
        }
        if (data.email) {
          setEmail(data.email);
          setEmailHref(`mailto:${data.email}`);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Cảm ơn! We'll be in touch shortly.");
    }, 700);
  };

  return (
    <section id="contact" data-bg="#1A0A05" className="bg-[#1A0A05] text-primary-foreground overflow-hidden">
      <div className="container grid gap-12 py-24 md:grid-cols-2 md:py-32">
        <div
          ref={left.ref}
          className={`reveal reveal-left ${left.visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-gold">Say Hello</span>
          <h2 className="mt-4 text-balance text-4xl text-primary-foreground md:text-5xl lg:text-6xl">
            {typeof headline === "string" ? (
              headline
            ) : (
              <>
                {headline.prefix}
                <em className="text-accent">{headline.em}</em>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-md text-primary-foreground/70">
            {body}{" "}
            <a href={phoneHref} className="text-primary-foreground hover:text-accent">
              {phone}
            </a>{" "}
            or email{" "}
            <a
              href={emailHref}
              className="text-primary-foreground hover:text-accent"
            >
              {email}
            </a>
            .
          </p>
        </div>

        <form
          ref={right.ref}
          onSubmit={onSubmit}
          className={`space-y-5 rounded-sm bg-background p-8 shadow-card md:p-10 reveal reveal-right ${right.visible ? "is-visible" : ""}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required placeholder="Your name" className="text-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@example.com" className="text-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="party">Party / Occasion</Label>
            <Input id="party" placeholder="Dinner for 8 · Friday 7pm" className="text-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" required rows={4} placeholder="Tell us anything we should know" className="text-foreground" />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {loading ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </section>
  );
};