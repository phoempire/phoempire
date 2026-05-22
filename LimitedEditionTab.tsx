import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

type Form = {
  limited_image_path: string | null;
  limited_name: string;
  limited_description: string;
  limited_availability: string;
  limited_price: string;
  limited_available: boolean;
};

export default function LimitedEditionTab() {
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("limited_image_path,limited_name,limited_description,limited_availability,limited_price,limited_available")
        .eq("id", 1)
        .maybeSingle();
      if (error) toast.error(error.message);
      if (data) setForm(data as Form);
    })();
  }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase.from("site_content").update(form).eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  if (!form) return <div className="space-y-4 max-w-2xl">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;

  const onImage = async (path: string) => {
    const { error } = await supabase.from("site_content").update({ limited_image_path: path }).eq("id", 1);
    if (error) throw error;
    setForm((f) => (f ? { ...f, limited_image_path: path } : f));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="space-y-3">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Limited Edition Dish Photo</h3>
        <ImageUploader value={form.limited_image_path} folder="limited" alt="Limited dish" onUploaded={onImage} />
      </section>
      <div className="space-y-2">
        <Label>Dish Name</Label>
        <Input value={form.limited_name ?? ""} onChange={(e) => setForm({ ...form, limited_name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={4} value={form.limited_description ?? ""} onChange={(e) => setForm({ ...form, limited_description: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Availability Note</Label>
        <Input value={form.limited_availability ?? ""} onChange={(e) => setForm({ ...form, limited_availability: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Price</Label>
        <Input type="number" step="0.01" value={form.limited_price ?? ""} onChange={(e) => setForm({ ...form, limited_price: e.target.value })} />
      </div>
      <div className="flex items-center justify-between border rounded-md p-4">
        <Label htmlFor="avail">Currently available on menu</Label>
        <Switch id="avail" checked={form.limited_available} onCheckedChange={(v) => setForm({ ...form, limited_available: v })} />
      </div>
      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
    </div>
  );
}