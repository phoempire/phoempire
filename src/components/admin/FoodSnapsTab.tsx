import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

type Snap = {
  id: string;
  slot: number;
  image_path: string | null;
  overlay_text: string;
  alt: string;
  sort_order: number;
};

export default function FoodSnapsTab() {
  const [rows, setRows] = useState<Snap[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("food_snaps").select("*").order("sort_order");
      if (error) toast.error(error.message);
      else setRows(data as Snap[]);
    })();
  }, []);

  const update = (id: string, patch: Partial<Snap>) =>
    setRows((r) => r?.map((x) => (x.id === id ? { ...x, ...patch } : x)) ?? r);

  const save = async (row: Snap) => {
    setSavingId(row.id);
    const { error } = await supabase.from("food_snaps")
      .update({ overlay_text: row.overlay_text, alt: row.alt }).eq("id", row.id);
    setSavingId(null);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const onImage = (row: Snap) => async (path: string) => {
    const { error } = await supabase.from("food_snaps").update({ image_path: path }).eq("id", row.id);
    if (error) throw error;
    update(row.id, { image_path: path });
  };

  if (!rows) return <div className="space-y-4 max-w-4xl">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <p className="text-sm text-muted-foreground">These are the 3 full-screen photos visitors see while scrolling.</p>
      {rows.map((row, i) => (
        <Card key={row.id} className="p-5 space-y-4">
          <h3 className="font-medium">Photo {i + 1} of {rows.length}</h3>
          <ImageUploader value={row.image_path} folder="food-snaps" alt={row.alt} onUploaded={onImage(row)} />
          <div className="space-y-1">
            <Label>Text shown over the photo</Label>
            <Input value={row.overlay_text} onChange={(e) => update(row.id, { overlay_text: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Alt text (for accessibility)</Label>
            <Input value={row.alt} onChange={(e) => update(row.id, { alt: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => save(row)} disabled={savingId === row.id}>
              {savingId === row.id ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}