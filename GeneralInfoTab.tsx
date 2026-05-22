import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Form = {
  hero_tagline: string;
  story_body: string;
  story_tagline: string;
  story_pullquote: string;
  phone: string;
  address: string;
  email: string;
  hours: string;
};

const FIELDS: { key: keyof Form; label: string; multiline?: boolean }[] = [
  { key: "hero_tagline", label: "Hero Tagline", multiline: true },
  { key: "story_body", label: "Story Body", multiline: true },
  { key: "story_tagline", label: "Story Tagline" },
  { key: "story_pullquote", label: "Pull Quote" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "email", label: "Email" },
  { key: "hours", label: "Hours" },
];

export default function GeneralInfoTab() {
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("hero_tagline,story_body,story_tagline,story_pullquote,phone,address,email,hours")
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

  if (!form) {
    return (
      <div className="space-y-4">
        {FIELDS.map((f) => (
          <Skeleton key={f.key} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label>{f.label}</Label>
          {f.multiline ? (
            <Textarea
              rows={4}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          ) : (
            <Input
              value={form[f.key] ?? ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}
      <Button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}