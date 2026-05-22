import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Rating = {
  id: string;
  platform_key: string;
  name: string;
  rating: number;
  count: number;
  sort_order: number;
};

export default function RatingsTab() {
  const [rows, setRows] = useState<Rating[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("id,platform_key,name,rating,count,sort_order")
        .order("sort_order");
      if (error) toast.error(error.message);
      else setRows(data as Rating[]);
    })();
  }, []);

  const update = (id: string, patch: Partial<Rating>) => {
    setRows((r) => r?.map((x) => (x.id === id ? { ...x, ...patch } : x)) ?? r);
  };

  const save = async (row: Rating) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("ratings")
      .update({ rating: Number(row.rating), count: Number(row.count) })
      .eq("id", row.id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else toast.success(`${row.name} saved`);
  };

  if (!rows) return <div className="space-y-3">{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="space-y-3 max-w-3xl">
      {rows.map((r) => (
        <Card key={r.id} className="p-4 grid grid-cols-1 md:grid-cols-[1fr_140px_140px_100px] gap-3 items-end">
          <div>
            <Label className="text-xs text-muted-foreground">Platform</Label>
            <div className="font-medium mt-1">{r.name}</div>
          </div>
          <div>
            <Label className="text-xs">Star Rating</Label>
            <Input
              type="number"
              step="0.1"
              value={r.rating}
              onChange={(e) => update(r.id, { rating: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="text-xs">Review Count</Label>
            <Input
              type="number"
              value={r.count}
              onChange={(e) => update(r.id, { count: parseInt(e.target.value) || 0 })}
            />
          </div>
          <Button onClick={() => save(r)} disabled={savingId === r.id}>
            {savingId === r.id ? "…" : "Save"}
          </Button>
        </Card>
      ))}
    </div>
  );
}