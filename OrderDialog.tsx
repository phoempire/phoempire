import { useEffect, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import pickupLogo from "@/assets/logos/pickup.png";
import uberEatsLogo from "@/assets/logos/ubereats.png";
import doorDashLogo from "@/assets/logos/doordash.png";
import grubhubLogo from "@/assets/logos/grubhub.png";
import { platforms, formatCountApprox } from "@/data/ratings";

const deliverySub = (key: "ubereats" | "doordash" | "grubhub") => {
  const p = platforms[key];
  return `${p.rating.toFixed(1)} ★ · ${formatCountApprox(p.count)} ratings · delivery`;
};

const options: {
  label: string;
  href: string;
  sub: string;
  logo: string;
}[] = [
  {
    label: "Order on phoempire.com",
    sub: "Direct pickup ordering · powered by Clover",
    href: "https://www.clover.com/online-ordering/phoempire",
    logo: pickupLogo,
  },
  {
    label: "Uber Eats",
    sub: deliverySub("ubereats"),
    href: platforms.ubereats.href,
    logo: uberEatsLogo,
  },
  {
    label: "DoorDash",
    sub: deliverySub("doordash"),
    href: platforms.doordash.href,
    logo: doorDashLogo,
  },
  {
    label: "Grubhub",
    sub: deliverySub("grubhub"),
    href: platforms.grubhub.href,
    logo: grubhubLogo,
  },
];

type OrderDialogProps = {
  trigger: ReactNode;
};

export const OrderDialog = ({ trigger }: OrderDialogProps) => {
  useEffect(() => {
    // Preload logo images so they're ready before the dialog opens
    options.forEach((opt) => {
      const img = new Image();
      img.src = opt.logo;
    });
  }, []);
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Order from <em className="text-accent">Phở Empire</em>
          </DialogTitle>
          <DialogDescription>
            Choose where you'd like to order — direct pickup or your favorite
            delivery app.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2">
          {options.map((opt) => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-sm border border-border px-4 py-3 transition-smooth hover:border-accent hover:bg-accent/5"
            >
              <img
                src={opt.logo}
                alt=""
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width={64}
                height={64}
                className="h-11 w-11 shrink-0 object-contain"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground group-hover:text-accent transition-smooth">
                  {opt.label}
                </div>
                <div className="text-xs text-muted-foreground">{opt.sub}</div>
              </div>
              <span className="text-accent" aria-hidden>
                →
              </span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};