import herbs from "@/assets/herbs.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useReveal } from "@/hooks/use-reveal";
import { OrderDialog } from "@/components/site/OrderDialog";

type Item = { name: string; vn?: string; price?: string; desc?: string };
type Section = { id: string; title: string; subtitle?: string; items: Item[] };

const initialSections: Section[] = [
  {
    id: "khai-vi",
    title: "Khai Vị - Appetizers",
    items: [
      { name: "Combo Appetizers", vn: "Spring roll, egg roll, breaded shrimp & calamari", price: "15.99" },
      { name: "Egg Rolls (2)", vn: "Chả Giò", price: "4.25" },
      { name: "Fresh Spring Rolls", vn: "Gỏi Cuốn", price: "4.25" },
      { name: "Shrimp Paste Spring Rolls (2)", vn: "Chạo Tôm Cuốn", price: "4.99" },
      { name: "Beef Jerky Papaya Salad", vn: "Gỏi Đu Đủ Khô Bò", price: "5.25" },
    ],
  },
  {
    id: "pho-bo",
    title: "Phở Bò - Beef Noodle Soup",
    subtitle:
      "Fresh rice noodles in beef broth with green onion, cilantro, and onion. Served with bean sprouts, jalapeño, lime, and basil. Regular 11.78 · Large 13.28 · X-Large 15.26",
    items: [
      { name: "Phở Empire", vn: "PE", price: "11.55 / 12.95 / 13.95", desc: "Eye-of-round, beef flank, crunchy fat, soft tendon, tripe, and meatballs." },
      { name: "Eye-of-round, flank, fat, tendon & tripe", vn: "Phở Tái Nạm Gầu Gân Sách" },
      { name: "Eye-of-round & chewy beef flank", vn: "Phở Tái Nạm" },
      { name: "Beef Stew with Noodle Soup", vn: "Phở Bò Kho", price: "13.95" },
    ],
  },
  {
    id: "pho-ga",
    title: "Phở Gà - Chicken Noodle Soup",
    subtitle: "Hearty chicken broth with your choice of cut. Regular 11.78 · Large 13.28 · X-Large 15.26",
    items: [
      { name: "Empire Chicken Phở", vn: "Phở Gà Empire", price: "11.55 / 12.95 / 13.95", desc: "Shredded breast, thigh, vegetables, and quail eggs." },
      { name: "Classic Chicken Noodle Soup", vn: "Phở Gà Truyền Thống" },
      { name: "Chicken Breast Noodle Soup", vn: "Phở Gà Thịt Trắng" },
      { name: "Tofu Phở in Chicken Broth", vn: "Phở Đậu Hủ Với Súp Gà" },
    ],
  },
  {
    id: "com",
    title: "Cơm - Rice",
    items: [
      { name: "Cơm Empire", vn: "Combo Steamed Rice", price: "17.99", desc: "Shredded pork skin, grilled pork chop, grilled pork, grilled chicken, pork cake, and fried egg." },
      { name: "Roasted Cornish Hen on Golden Rice", vn: "Cơm Gà Xối Mỡ", price: "14.45" },
      { name: "Dancing Cupid Beef on Steamed Rice", vn: "Cơm Bò Lúc Lắc", price: "16.99" },
      { name: "Grilled Salmon on Steamed Rice", vn: "Cơm Cá Hồi Nướng", price: "17.99" },
      { name: "Pineapple Fried Rice - beef, chicken, or shrimp", vn: "Cơm Chiên Thơm", price: "14.45" },
    ],
  },
  {
    id: "bun",
    title: "Bún - Vermicelli",
    subtitle: "Most bowls 13.95",
    items: [
      { name: "Vermicelli Combo", vn: "Bún Đặc Biệt", price: "17.99", desc: "Shredded pork skin, BBQ pork, charbroiled chicken, charbroiled shrimp, and egg roll." },
      { name: "Charbroiled Shrimp & BBQ Pork", vn: "Bún Tôm Thịt Nướng" },
      { name: "Shredded Pork Skin & Egg Rolls", vn: "Bún Bì Chả Giò" },
      { name: "Beef & Onion Sautéed", vn: "Bún Bò Xào Củ Hành" },
    ],
  },
  {
    id: "banh-hoi",
    title: "Bánh Hỏi - Woven Fine Vermicelli",
    subtitle: "$16.85 · Extra rice paper +$1.99",
    items: [
      { name: "With Grilled Meatball", vn: "Bánh Hỏi Nem Nướng" },
      { name: "Shrimp Paste & Grilled Meatball", vn: "Bánh Hỏi Chạo Tôm Nem Nướng" },
      { name: "Grilled Pork & Grilled Meatball", vn: "Bánh Hỏi Thịt Nướng Nem Nướng" },
      { name: "Grilled Chicken", vn: "Bánh Hỏi Gà Nướng" },
    ],
  },
  {
    id: "chay",
    title: "Vegetarian - Chay",
    subtitle: "Most dishes 13.95 – 14.49",
    items: [
      { name: "Vegetarian Rice Noodle Soup", vn: "Hủ Tiếu Chay" },
      { name: "Tofu Sautéed with Vegetables on Rice", vn: "Cơm Tàu Hủ Xào Rau" },
      { name: "Fried Tofu Vermicelli Bowl", vn: "Bún Đậu Hủ Chiên" },
      { name: "Crispy Egg Noodle with Tofu & Veg", vn: "Mì Xào Dòn Chay", price: "14.49" },
    ],
  },
  {
    id: "chef",
    title: "Chef's Special",
    subtitle: "Most dishes 13.99 – 14.99",
    items: [
      { name: "Spicy Huế Beef Noodle Soup", vn: "Bún Bò Huế", desc: "Lemongrass-flavored, beef shank, pork ham, and herbs." },
      { name: "Crystal Noodle Soup", vn: "Hủ Tiếu Mỹ Tho" },
      { name: "Pan-fried Flat Noodle", vn: "Phở Áp Chảo", price: "14.99" },
      { name: "Wonton Soup", vn: "Hoành Thánh Súp", price: "11.99" },
    ],
  },
  {
    id: "banh-mi",
    title: "Bánh Mì - French Bread",
    subtitle: "All sandwiches $6.99",
    items: [
      { name: "Grilled Pork", vn: "Bánh Mì Thịt Nướng" },
      { name: "Grilled Chicken", vn: "Bánh Mì Gà Nướng" },
      { name: "Grilled Beef", vn: "Bánh Mì Bò Nướng" },
      { name: "Sunny-Side Egg", vn: "Bánh Mì Trứng Ốp La" },
      { name: "Vietnamese Ham", vn: "Bánh Mì Chả Lụa" },
      { name: "Fried Tofu", vn: "Bánh Mì Đậu Hủ" },
    ],
  },
  {
    id: "kid",
    title: "Kid's Meal",
    subtitle: "All $8.99",
    items: [
      { name: "Noodle Soup with Brisket", vn: "Phở Tái Chín" },
      { name: "Steamed Rice with BBQ Pork or Grilled Chicken", vn: "Cơm Thịt Nướng" },
      { name: "Fried Seafood Rice", vn: "Cơm Đồ Biển Chiên" },
    ],
  },
  {
    id: "drinks",
    title: "Drinks & Desserts",
    items: [
      { name: "Empire Coffee", vn: "Drip coffee, condensed milk, whipped cream, boba & wafer", price: "5.99" },
      { name: "Boba Coffee", vn: "Iced milk coffee with boba", price: "4.99" },
      { name: "Boba Tea - Thai, Green, Taro, Mango, Passion Fruit & more", price: "4.99" },
      { name: "Combination Bean Pudding", vn: "Chè Đặc Biệt", price: "5.99" },
      { name: "Young Coconut Juice", vn: "Nước Dừa", price: "4.50" },
    ],
  },
];

export const Menu = () => {
  const head = useReveal<HTMLDivElement>();
  const list = useReveal<HTMLDivElement>();
  const banner = useReveal<HTMLDivElement>();
  const [sections, setSections] = useState<Section[]>(initialSections);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: secData }, { data: itemData }] = await Promise.all([
        supabase.from("menu_sections").select("section_key,title,subtitle,sort_order").order("sort_order", { ascending: true }),
        supabase.from("menu_items").select("section_key,name,vn,price,description,sort_order").order("sort_order", { ascending: true }),
      ]);
      if (cancelled || !secData || secData.length === 0) return;
      const itemsByKey = new Map<string, Item[]>();
      (itemData ?? []).forEach((it) => {
        const arr = itemsByKey.get(it.section_key) ?? [];
        arr.push({ name: it.name, vn: it.vn ?? undefined, price: it.price ?? undefined, desc: it.description ?? undefined });
        itemsByKey.set(it.section_key, arr);
      });
      setSections(
        secData.map((s) => ({
          id: s.section_key,
          title: s.title,
          subtitle: s.subtitle ?? undefined,
          items: itemsByKey.get(s.section_key) ?? [],
        }))
      );
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="menu" data-bg="#FDF6ED" className="text-foreground overflow-hidden" style={{ backgroundColor: "#FDF6ED" }}>
      <div className="container py-24 md:py-32">
        <div
          ref={head.ref}
          className={`mx-auto max-w-2xl text-center reveal ${head.visible ? "is-visible" : ""}`}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-accent">The Menu</span>
          <h2 className="mt-4 text-balance text-4xl md:text-5xl lg:text-6xl">
            Taste of <em className="text-accent">Vietnam</em>.
          </h2>
          <p className="mt-5 text-foreground/70 italic">
            A mixture of modern culinary ideas and traditional dishes with a
            twist - lots of tasty tidbits and wonderful dishes to try.
          </p>
        </div>

        <div
          ref={list.ref}
          className={`reveal ${list.visible ? "is-visible" : ""}`}
          style={{ transitionDelay: "0.15s" }}
        >
        <Accordion
          type="multiple"
          className="mx-auto mt-16 max-w-3xl"
        >
          {sections.map((s) => (
            <AccordionItem
              key={s.id}
              value={s.id}
              className="border-foreground/15 transition-colors hover:bg-foreground/[0.02]"
            >
              <AccordionTrigger className="font-serif text-xl text-foreground hover:text-accent hover:no-underline md:text-2xl">
                {s.title}
              </AccordionTrigger>
              <AccordionContent>
                {s.subtitle && (
                  <p className="mb-5 text-sm italic text-foreground/60">
                    {s.subtitle}
                  </p>
                )}
                <ul className="divide-y divide-foreground/10">
                  {s.items.map((it, i) => (
                    <li key={i} className="flex items-baseline gap-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-serif text-base text-foreground">
                            {it.name}
                          </span>
                          {it.vn && (
                            <span className="text-sm italic text-foreground/60">
                              {it.vn}
                            </span>
                          )}
                        </div>
                        {it.desc && (
                          <p className="mt-1 text-sm text-foreground/70">
                            {it.desc}
                          </p>
                        )}
                      </div>
                      {it.price && (
                        <span className="shrink-0 font-serif text-base text-accent">
                          ${it.price}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </div>

        <p className="mt-6 text-center text-xs italic text-foreground/50">
          Menu items and prices are subject to change and availability, and may
          not always be up to date. Please call to confirm.
        </p>

        <div
          ref={banner.ref}
          className={`mt-16 overflow-hidden rounded-sm shadow-card reveal reveal-scale ${banner.visible ? "is-visible" : ""}`}
        >
          <img
            src={herbs}
            alt="Fresh Vietnamese herbs, lime, bean sprouts, and jalapeño"
            loading="lazy"
            width={1280}
            height={1024}
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <OrderDialog
            trigger={
              <button
                type="button"
                className="inline-flex h-11 items-center rounded-sm bg-accent px-6 text-sm font-medium text-accent-foreground transition-smooth hover:bg-accent/90"
              >
                Order Online
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
};