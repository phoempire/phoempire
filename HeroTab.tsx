import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

type Form = {
  hero_image_path: string | null;
  hero_story_line_1: string;
  hero_story_line_2: string;
  hero_story_line_3: string;
  hero_tagline: string;
};

export default function HeroTab() {
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("hero_image_path,hero_story_line_1,hero_story_line_2,hero_story_line_3,hero_tagline")
      .eq("id", 1)
      .maybeSingle();
    if (error) toast.error(error.message);
    if (data) setForm(data as Form);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase.from("site_content").update(form).eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Hero saved");
  };

  const onImage = async (path: string) => {
    const { error } = await supabase.from("site_content").update({ hero_image_path: path }).eq("id", 1);
    if (error) throw error;
    setForm((f) => (f ? { ...f, hero_image_path: path } : f));
  };

  if (!form) return <div className="space-y-4 max-w-3xl">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-10 max-w-3xl">
      <section className="space-y-3">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Main Hero Photo (the bowl of pho)</h3>
        <ImageUploader
          value={form.hero_image_path}
          folder="hero"
          alt="Hero"
          onUploaded={onImage}
          aspectRatio={16 / 9}
          aspect="aspect-video"
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Scroll Story Lines</h3>
        <p className="text-xs text-muted-foreground -mt-1">Appear one by one as visitor scrolls.</p>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Line 1</Label>
            <Input value={form.hero_story_line_1 ?? ""} onChange={(e) => setForm({ ...form, hero_story_line_1: e.target.value })} /></div>
          <div className="space-y-1"><Label>Line 2</Label>
            <Input value={form.hero_story_line_2 ?? ""} onChange={(e) => setForm({ ...form, hero_story_line_2: e.target.value })} /></div>
          <div className="space-y-1"><Label>Line 3</Label>
            <Input value={form.hero_story_line_3 ?? ""} onChange={(e) => setForm({ ...form, hero_story_line_3: e.target.value })} /></div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Hero Text</h3>
        <div className="space-y-1"><Label>Hero Tagline</Label>
          <Textarea rows={3} value={form.hero_tagline ?? ""} onChange={(e) => setForm({ ...form, hero_tagline: e.target.value })} /></div>
      </section>

      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Hero Changes"}</Button>
    </div>
  );
}