import herbs from "@/assets/herbs.jpg";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PDFDocument } from "pdf-lib";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
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
    title: "Khai Vị — Appetizers",
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
    title: "Phở Bò — Beef Noodle Soup",
    subtitle:
      "Fresh rice noodles in beef broth with green onion, cilantro, and onion. Served with bean sprouts, jalapeño, lime, and basil. Regular 10.99 · Large 12.49 · X-Large 13.79",
    items: [
      { name: "Phở Empire", vn: "PE", price: "11.55 / 12.95 / 13.95", desc: "Eye-of-round, beef flank, crunchy fat, soft tendon, tripe, and meatballs." },
      { name: "Eye-of-round, flank, fat, tendon & tripe", vn: "Phở Tái Nạm Gầu Gân Sách" },
      { name: "Eye-of-round & chewy beef flank", vn: "Phở Tái Nạm" },
      { name: "Beef Stew with Noodle Soup", vn: "Phở Bò Kho", price: "12.95" },
    ],
  },
  {
    id: "pho-ga",
    title: "Phở Gà — Chicken Noodle Soup",
    subtitle: "Hearty chicken broth with your choice of cut. Regular 10.99 · Large 12.49 · X-Large 13.79",
    items: [
      { name: "Empire Chicken Phở", vn: "Phở Gà Empire", price: "11.55 / 12.95 / 13.95", desc: "Shredded breast, thigh, vegetables, and quail eggs." },
      { name: "Classic Chicken Noodle Soup", vn: "Phở Gà Truyền Thống" },
      { name: "Chicken Breast Noodle Soup", vn: "Phở Gà Thịt Trắng" },
      { name: "Tofu Phở in Chicken Broth", vn: "Phở Đậu Hủ Với Súp Gà" },
    ],
  },
  {
    id: "com",
    title: "Cơm — Rice",
    items: [
      { name: "Cơm Empire", vn: "Combo Steamed Rice", price: "16.99", desc: "Shredded pork skin, grilled pork chop, grilled pork, grilled chicken, pork cake, and fried egg." },
      { name: "Roasted Cornish Hen on Golden Rice", vn: "Cơm Gà Xối Mỡ", price: "13.95" },
      { name: "Dancing Cupid Beef on Steamed Rice", vn: "Cơm Bò Lúc Lắc", price: "13.99" },
      { name: "Grilled Salmon on Steamed Rice", vn: "Cơm Cá Hồi Nướng", price: "16.99" },
      { name: "Pineapple Fried Rice — beef, chicken, or shrimp", vn: "Cơm Chiên Thơm", price: "13.45" },
    ],
  },
  {
    id: "bun",
    title: "Bún — Vermicelli",
    subtitle: "Most bowls 12.95",
    items: [
      { name: "Vermicelli Combo", vn: "Bún Đặc Biệt", price: "16.99", desc: "Shredded pork skin, BBQ pork, charbroiled chicken, charbroiled shrimp, and egg roll." },
      { name: "Charbroiled Shrimp & BBQ Pork", vn: "Bún Tôm Thịt Nướng" },
      { name: "Shredded Pork Skin & Egg Rolls", vn: "Bún Bì Chả Giò" },
      { name: "Beef & Onion Sautéed", vn: "Bún Bò Xào Củ Hành" },
    ],
  },
  {
    id: "banh-hoi",
    title: "Bánh Hỏi — Woven Fine Vermicelli",
    subtitle: "$15.85 · Extra rice paper +$1.99",
    items: [
      { name: "With Grilled Meatball", vn: "Bánh Hỏi Nem Nướng" },
      { name: "Shrimp Paste & Grilled Meatball", vn: "Bánh Hỏi Chạo Tôm Nem Nướng" },
      { name: "Grilled Pork & Grilled Meatball", vn: "Bánh Hỏi Thịt Nướng Nem Nướng" },
      { name: "Grilled Chicken", vn: "Bánh Hỏi Gà Nướng" },
    ],
  },
  {
    id: "chay",
    title: "Vegetarian — Chay",
    subtitle: "Most dishes 12.95 – 13.49",
    items: [
      { name: "Vegetarian Rice Noodle Soup", vn: "Hủ Tiếu Chay" },
      { name: "Tofu Sautéed with Vegetables on Rice", vn: "Cơm Tàu Hủ Xào Rau" },
      { name: "Fried Tofu Vermicelli Bowl", vn: "Bún Đậu Hủ Chiên" },
      { name: "Crispy Egg Noodle with Tofu & Veg", vn: "Mì Xào Dòn Chay", price: "13.49" },
    ],
  },
  {
    id: "chef",
    title: "Chef's Special",
    subtitle: "Most dishes 12.99 – 13.99",
    items: [
      { name: "Spicy Huế Beef Noodle Soup", vn: "Bún Bò Huế", desc: "Lemongrass-flavored, beef shank, pork ham, and herbs." },
      { name: "Crystal Noodle Soup", vn: "Hủ Tiếu Mỹ Tho" },
      { name: "Pan-fried Flat Noodle", vn: "Phở Áp Chảo", price: "13.99" },
      { name: "Wonton Soup", vn: "Hoành Thánh Súp", price: "10.99" },
      { name: "Wet Cake — Special", vn: "Bánh Ướt Đặc Biệt" },
    ],
  },
  {
    id: "banh-mi",
    title: "Bánh Mì — French Bread",
    subtitle: "All sandwiches $5.99",
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
    subtitle: "All $7.99",
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
      { name: "Boba Coffee", vn: "Iced milk coffee with boba", price: "4.50" },
      { name: "Boba Tea — Thai, Green, Taro, Mango, Passion Fruit & more", price: "4.99" },
      { name: "Combination Bean Pudding", vn: "Chè Đặc Biệt", price: "5.99" },
      { name: "Young Coconut Juice", vn: "Nước Dừa", price: "4.50" },
    ],
  },
];

export const Menu = () => {
  const head = useReveal<HTMLDivElement>();
  const list = useReveal<HTMLDivElement>();
  const banner = useReveal<HTMLDivElement>();
  const [pdfRows, setPdfRows] = useState<{ id: string; name: string; file_path: string }[]>([]);
  const [merging, setMerging] = useState(false);
  const [activePdf, setActivePdf] = useState<{ name: string; url: string; downloadName?: string } | null>(null);
  const [sections, setSections] = useState<Section[]>(initialSections);

  useEffect(() => {
    supabase
      .from("menu_pdfs")
      .select("id,name,file_path")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setPdfRows((data ?? []).filter((p) => p.file_path && p.file_path.length > 0));
      });
  }, []);

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

  const pdfPublicUrl = (path: string) =>
    supabase.storage.from("menu-pdfs").getPublicUrl(path).data.publicUrl;

  const handleViewFullMenu = async () => {
    setMerging(true);
    try {
      const { data } = await supabase
        .from("menu_pdfs")
        .select("id,name,file_path")
        .order("sort_order", { ascending: true });
      const rows = (data ?? []).filter((p) => p.file_path && p.file_path.length > 0);
      const merged = await PDFDocument.create();
      for (const row of rows) {
        const url = pdfPublicUrl(row.file_path);
        const buf = await fetch(url).then((r) => r.arrayBuffer());
        const src = await PDFDocument.load(buf);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const objUrl = URL.createObjectURL(blob);
      setActivePdf({
        name: "Complete Menu — All Sections",
        url: objUrl,
        downloadName: "Pho_Empire_Full_Menu.pdf",
      });
    } finally {
      setMerging(false);
    }
  };

  const closePdf = () => {
    if (activePdf?.url.startsWith("blob:")) URL.revokeObjectURL(activePdf.url);
    setActivePdf(null);
  };

  return (
    <>
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
            twist — lots of tasty tidbits and wonderful dishes to try.
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
          Menu items and prices sourced from phoempire.com — please call to
          confirm current pricing.
        </p>

        {pdfRows.length > 0 && (
          <div className="mt-16 mx-auto max-w-3xl">
            <h3 className="text-center font-serif text-2xl md:text-3xl">
              Download Full Menu <em className="text-accent">PDFs</em>
            </h3>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <button
                type="button"
                onClick={handleViewFullMenu}
                disabled={merging}
                className="group inline-flex items-center justify-between gap-3 rounded-sm bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-smooth hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-left"
              >
                <span className="truncate">{merging ? "Preparing..." : "Complete Menu — All Sections"}</span>
                <Download className="h-4 w-4 shrink-0" />
              </button>
              {pdfRows.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePdf({ name: p.name, url: pdfPublicUrl(p.file_path) })}
                  className="group inline-flex items-center justify-between gap-3 rounded-sm border border-foreground/20 bg-background/40 px-4 py-3 text-sm font-medium text-foreground transition-smooth hover:border-accent hover:text-accent text-left"
                >
                  <span className="truncate">{p.name}</span>
                  <Download className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

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
    <Dialog open={!!activePdf} onOpenChange={(o) => !o && closePdf()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-5 py-3 border-b flex-row items-center justify-between gap-4">
          <DialogTitle className="font-serif text-lg">{activePdf?.name}</DialogTitle>
          {activePdf && (
            <a
              href={activePdf.url}
              {...(activePdf.downloadName
                ? { download: activePdf.downloadName }
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="inline-flex items-center gap-2 rounded-sm border border-foreground/15 px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-smooth mr-6"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          )}
        </DialogHeader>
        {activePdf && (
          <iframe src={activePdf.url} title={activePdf.name} className="w-full flex-1 bg-muted" />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};