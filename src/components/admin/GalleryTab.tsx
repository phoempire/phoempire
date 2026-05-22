import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

type GImage = {
  id: string;
  slot: number;
  src_path: string;
  alt: string;
  caption: string;
};

export default function GalleryTab() {
  const [rows, setRows] = useState<GImage[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("id,slot,src_path,alt,caption")
      .order("slot");
    if (error) toast.error(error.message);
    else setRows(data as GImage[]);
  };

  useEffect(() => {
    load();
  }, []);

  const updateRow = (id: string, patch: Partial<GImage>) =>
    setRows((r) => r?.map((x) => (x.id === id ? { ...x, ...patch } : x)) ?? r);

  const saveRow = async (row: GImage) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("gallery_images")
      .update({ caption: row.caption, alt: row.alt })
      .eq("id", row.id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const onImage = (row: GImage) => async (path: string) => {
    const { error } = await supabase
      .from("gallery_images")
      .update({ src_path: path })
      .eq("id", row.id);
    if (error) throw error;
    updateRow(row.id, { src_path: path });
  };

  if (!rows) return <div className="space-y-4 max-w-4xl">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <p className="text-sm text-muted-foreground">The 5 food photos shown in the mosaic gallery.</p>
      {rows.map((row, i) => (
        <Card key={row.id} className="p-5 space-y-4">
          <h3 className="font-medium">Food Snap {i + 1}</h3>
          <ImageUploader
            value={row.src_path}
            folder="gallery"
            alt={row.alt}
            onUploaded={onImage(row)}
            aspectRatio={row.slot === 1 || row.slot === 3 ? 4 / 5 : 4 / 3}
            aspect={row.slot === 1 || row.slot === 3 ? "aspect-[4/5]" : "aspect-[4/3]"}
          />
          <div className="space-y-1">
            <Label>Caption</Label>
            <Input value={row.caption ?? ""} onChange={(e) => updateRow(row.id, { caption: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Alt text</Label>
            <Input value={row.alt ?? ""} onChange={(e) => updateRow(row.id, { alt: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveRow(row)} disabled={savingId === row.id}>
              {savingId === row.id ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}