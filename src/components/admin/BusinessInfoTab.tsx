import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Form = {
  phone: string;
  email: string;
  address: string;
  hours: string;
  contact_headline: string;
  contact_body: string;
};

export default function BusinessInfoTab() {
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("phone,email,address,hours,contact_headline,contact_body")
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
    if (error) toast.error(error.message); else toast.success("Business info saved");
  };

  if (!form) return <div className="space-y-4 max-w-2xl">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="space-y-1"><Label>Phone</Label>
        <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      <div className="space-y-1"><Label>Email</Label>
        <Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div className="space-y-1"><Label>Address</Label>
        <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      <div className="space-y-1"><Label>Hours</Label>
        <Input value={form.hours ?? ""} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></div>
      <div className="space-y-1"><Label>Contact Page Headline</Label>
        <Input value={form.contact_headline ?? ""} onChange={(e) => setForm({ ...form, contact_headline: e.target.value })} /></div>
      <div className="space-y-1"><Label>Contact Page Body</Label>
        <Textarea rows={4} value={form.contact_body ?? ""} onChange={(e) => setForm({ ...form, contact_body: e.target.value })} /></div>
      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Business Info"}</Button>
    </div>
  );
}