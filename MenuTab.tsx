import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

type Section = { id: string; section_key: string; title: string; subtitle: string | null; sort_order: number };
type Item = { id: string; section_key: string; name: string; vn: string | null; price: string | null; description: string | null; sort_order: number };

export default function MenuTab() {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Record<string, Partial<Item>>>({});
  const [herbsPath, setHerbsPath] = useState<string | null>(null);

  const load = async () => {
    const [s, i, c] = await Promise.all([
      supabase.from("menu_sections").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("site_content").select("menu_herbs_image_path").eq("id", 1).maybeSingle(),
    ]);
    if (s.error) toast.error(s.error.message);
    if (i.error) toast.error(i.error.message);
    setSections((s.data ?? []) as Section[]);
    setItems((i.data ?? []) as Item[]);
    setHerbsPath((c.data?.menu_herbs_image_path as string | null) ?? null);
  };

  useEffect(() => {
    load();
  }, []);

  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const saveItem = async (item: Item) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ name: item.name, vn: item.vn, price: item.price, description: item.description })
      .eq("id", item.id);
    if (error) toast.error(error.message);
    else toast.success("Item saved");
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((arr) => arr.filter((x) => x.id !== id));
    toast.success("Item deleted");
  };

  const addItem = async (section_key: string) => {
    const draft = newItem[section_key] ?? {};
    if (!draft.name) return toast.error("Name required");
    const sort_order = (items.filter((x) => x.section_key === section_key).length || 0) + 1;
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        section_key,
        name: draft.name,
        vn: draft.vn ?? null,
        price: draft.price ?? null,
        description: draft.description ?? null,
        sort_order,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setItems((arr) => [...arr, data as Item]);
    setNewItem((n) => ({ ...n, [section_key]: {} }));
    toast.success("Item added");
  };

  const addSection = async () => {
    const title = prompt("Section title?");
    if (!title) return;
    const key = prompt("Short key (lowercase, no spaces)?", title.toLowerCase().replace(/\s+/g, "-"));
    if (!key) return;
    const sort_order = (sections?.length ?? 0) + 1;
    const { data, error } = await supabase
      .from("menu_sections")
      .insert({ section_key: key, title, subtitle: null, sort_order })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setSections((s) => [...(s ?? []), data as Section]);
    toast.success("Section added");
  };

  const deleteSection = async (s: Section) => {
    if (!confirm(`Delete section "${s.title}" and all its items?`)) return;
    await supabase.from("menu_items").delete().eq("section_key", s.section_key);
    const { error } = await supabase.from("menu_sections").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    setSections((arr) => arr?.filter((x) => x.id !== s.id) ?? null);
    setItems((arr) => arr.filter((x) => x.section_key !== s.section_key));
    toast.success("Section deleted");
  };

  if (!sections) return <Skeleton className="h-96 w-full" />;

  const onHerbs = async (path: string) => {
    const { error } = await supabase.from("site_content").update({ menu_herbs_image_path: path }).eq("id", 1);
    if (error) throw error;
    setHerbsPath(path);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex justify-end">
        <Button onClick={addSection} variant="outline" size="sm">
          <Plus className="h-4 w-4" /> Add Section
        </Button>
      </div>
      <Accordion type="multiple" className="space-y-2">
        {sections.map((s) => {
          const sItems = items.filter((i) => i.section_key === s.section_key);
          const draft = newItem[s.section_key] ?? {};
          return (
            <AccordionItem key={s.id} value={s.id} className="border rounded-md px-4">
              <AccordionTrigger className="text-left">
                <span className="font-medium">{s.title}</span>
                <span className="ml-auto mr-2 text-xs text-muted-foreground">{sItems.length} items</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {sItems.map((it) => (
                    <Card key={it.id} className="p-3 grid grid-cols-12 gap-2 items-center">
                      <Input className="col-span-3" placeholder="Name" value={it.name}
                        onChange={(e) => updateItem(it.id, { name: e.target.value })}
                        onBlur={() => saveItem(it)} />
                      <Input className="col-span-2" placeholder="VN" value={it.vn ?? ""}
                        onChange={(e) => updateItem(it.id, { vn: e.target.value })}
                        onBlur={() => saveItem(it)} />
                      <Input className="col-span-2" placeholder="Price" value={it.price ?? ""}
                        onChange={(e) => updateItem(it.id, { price: e.target.value })}
                        onBlur={() => saveItem(it)} />
                      <Input className="col-span-4" placeholder="Description" value={it.description ?? ""}
                        onChange={(e) => updateItem(it.id, { description: e.target.value })}
                        onBlur={() => saveItem(it)} />
                      <Button variant="ghost" size="icon" className="col-span-1" onClick={() => deleteItem(it.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}

                  <Card className="p-3 grid grid-cols-12 gap-2 items-center bg-muted/30">
                    <Input className="col-span-3" placeholder="New name" value={draft.name ?? ""}
                      onChange={(e) => setNewItem((n) => ({ ...n, [s.section_key]: { ...draft, name: e.target.value } }))} />
                    <Input className="col-span-2" placeholder="VN" value={draft.vn ?? ""}
                      onChange={(e) => setNewItem((n) => ({ ...n, [s.section_key]: { ...draft, vn: e.target.value } }))} />
                    <Input className="col-span-2" placeholder="Price" value={draft.price ?? ""}
                      onChange={(e) => setNewItem((n) => ({ ...n, [s.section_key]: { ...draft, price: e.target.value } }))} />
                    <Input className="col-span-4" placeholder="Description" value={draft.description ?? ""}
                      onChange={(e) => setNewItem((n) => ({ ...n, [s.section_key]: { ...draft, description: e.target.value } }))} />
                    <Button size="icon" className="col-span-1" onClick={() => addItem(s.section_key)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Card>

                  <div className="flex justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => deleteSection(s)} className="text-destructive">
                      <Trash2 className="h-4 w-4" /> Delete section
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <section className="space-y-3 pt-8 border-t">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Menu Herbs Banner</h3>
        <p className="text-xs text-muted-foreground -mt-1">Herbs photo shown at the bottom of the menu.</p>
        <ImageUploader value={herbsPath} folder="menu" alt="Menu herbs" onUploaded={onHerbs} />
      </section>
    </div>
  );
}