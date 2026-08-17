// Single source of truth for review platform ratings & counts.
// Update numbers here and they propagate everywhere on the site.
import { supabase } from "@/integrations/supabase/client";

export type PlatformKey =
  | "google"
  | "yelp"
  | "tripadvisor"
  | "ubereats"
  | "doordash"
  | "grubhub"
  | "beli";

export type Platform = {
  key: PlatformKey;
  name: string;
  rating: number;
  count: number;
  href: string;
};

export const platforms: Record<PlatformKey, Platform> = {
  google: {
    key: "google",
    name: "Google",
    rating: 4.4,
    count: 1252,
    href: "https://www.google.com/maps/search/?api=1&query=Pho+Empire+Irving+TX",
  },
  yelp: {
    key: "yelp",
    name: "Yelp",
    rating: 3.9,
    count: 621,
    href: "https://www.yelp.com/biz/pho-empire-irving",
  },
  tripadvisor: {
    key: "tripadvisor",
    name: "TripAdvisor",
    rating: 4.1,
    count: 49,
    href: "https://www.tripadvisor.com/Restaurant_Review-g56032-d786775-Reviews-Pho_Empire-Irving_Texas.html",
  },
  ubereats: {
    key: "ubereats",
    name: "Uber Eats",
    rating: 4.7,
    count: 1000,
    href: "https://www.ubereats.com/store/pho-empire-irving/MVWD2k0nV7yY8gKNz69gWQ",
  },
  doordash: {
    key: "doordash",
    name: "DoorDash",
    rating: 4.7,
    count: 1000,
    href: "https://www.doordash.com/store/pho-empire-irving-28013554/",
  },
  grubhub: {
    key: "grubhub",
    name: "Grubhub",
    rating: 4.4,
    count: 188,
    href: "https://www.grubhub.com/restaurant/pho-empire-3591-n-belt-line-rd-irving/5912584",
  },
  beli: {
    key: "beli",
    name: "Beli",
    rating: 8.6,
    count: 40,
    href: "https://app.beliapp.com/search?q=Pho%20Empire%20Irving",
  },
};

export const platformList: Platform[] = [
  platforms.google,
  platforms.yelp,
  platforms.tripadvisor,
  platforms.ubereats,
  platforms.doordash,
  platforms.grubhub,
  platforms.beli,
];

// Helpers
// Round DOWN: nearest 100 when >= 500, otherwise nearest 10.
export const roundDownCount = (n: number) => {
  const step = n >= 500 ? 100 : 10;
  return Math.floor(n / step) * step;
};

// Format like "1.2k+", "600+", "180+".
export const formatCountApprox = (n: number) => {
  const rounded = roundDownCount(n);
  if (rounded >= 1000) {
    const k = rounded / 1000;
    // 1 decimal, but trim trailing .0 -> "1k+" instead of "1.0k+"
    const str = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1);
    return `${str}k+`;
  }
  return `${rounded}+`;
};

// Optional live fetch from Supabase. Returns Platform[] in the same shape as platformList.
export const fetchRatingsFromDB = async (): Promise<Platform[] | null> => {
  const { data, error } = await supabase
    .from("ratings")
    .select("platform_key,name,rating,count,href,sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return data.map((r) => ({
    key: r.platform_key as PlatformKey,
    name: r.name,
    rating: Number(r.rating),
    count: Number(r.count),
    href: r.href,
  }));
};
