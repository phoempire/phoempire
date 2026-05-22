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
  story_image_path: string | null;
  story_body: string;
  story_tagline: string;
  story_pullquote: string;
};

export default function StoryTab() {
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("story_image_path,story_body,story_tagline,story_pullquote")
        .eq("id", 1).maybeSingle();
      if (error) toast.error(error.message);
      if (data) setForm(data as Form);
    })();
  }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase.from("site_content").update(form).eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Story saved");
  };

  const onImage = async (path: string) => {
    const { error } = await supabase.from("site_content").update({ story_image_path: path }).eq("id", 1);
    if (error) throw error;
    setForm((f) => (f ? { ...f, story_image_path: path } : f));
  };

  if (!form) return <div className="space-y-4 max-w-3xl">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-10 max-w-3xl">
      <section className="space-y-3">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Restaurant Interior Photo</h3>
        <ImageUploader value={form.story_image_path} folder="story" alt="Story" onUploaded={onImage} />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Story Text</h3>
        <div className="space-y-1"><Label>Story Body</Label>
          <Textarea rows={6} value={form.story_body ?? ""} onChange={(e) => setForm({ ...form, story_body: e.target.value })} /></div>
        <div className="space-y-1"><Label>Story Tagline</Label>
          <Input value={form.story_tagline ?? ""} onChange={(e) => setForm({ ...form, story_tagline: e.target.value })} /></div>
        <div className="space-y-1"><Label>Pull Quote</Label>
          <Input value={form.story_pullquote ?? ""} onChange={(e) => setForm({ ...form, story_pullquote: e.target.value })} /></div>
      </section>

      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Story Changes"}</Button>
    </div>
  );
}