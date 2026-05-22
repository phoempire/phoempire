import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2, Upload, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BUCKET = "menu-pdfs";

type Pdf = {
  id: string;
  name: string;
  file_path: string;
  file_name: string;
  sort_order: number;
  uploaded_at: string;
};

function pdfUrl(path?: string | null) {
  if (!path) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export default function MenuPdfsTab() {
  const [rows, setRows] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_pdfs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data as Pdf[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: "application/pdf",
    });
    if (up.error) {
      setUploading(false);
      return toast.error(up.error.message);
    }
    const nextOrder = (rows[rows.length - 1]?.sort_order ?? 0) + 1;
    const displayName = file.name.replace(/\.pdf$/i, "");
    const ins = await supabase
      .from("menu_pdfs")
      .insert({
        name: displayName,
        file_path: path,
        file_name: file.name,
        sort_order: nextOrder,
      });
    setUploading(false);
    if (ins.error) return toast.error(ins.error.message);
    toast.success("PDF uploaded");
    load();
  };

  const updateRow = async (id: string, patch: Partial<Pdf>) => {
    const { error } = await supabase.from("menu_pdfs").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
  };

  const renameRow = async (id: string, name: string) => {
    await updateRow(id, { name });
    toast.success("Saved");
  };

  const deleteRow = async (row: Pdf) => {
    if (row.file_path) {
      await supabase.storage.from(BUCKET).remove([row.file_path]);
    }
    const { error } = await supabase.from("menu_pdfs").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const a = rows[index];
    const b = rows[target];
    const next = [...rows];
    next[index] = { ...b, sort_order: a.sort_order };
    next[target] = { ...a, sort_order: b.sort_order };
    setRows(next.sort((x, y) => x.sort_order - y.sort_order));
    await Promise.all([
      supabase.from("menu_pdfs").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("menu_pdfs").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg">Menu PDFs</h3>
          <p className="text-sm text-muted-foreground">
            Upload printable menu PDFs. They appear on the public site as download buttons.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = "";
          }}
        />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Upload PDF"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No PDFs yet. Upload your first one above.</p>
      ) : (
        <div className="border rounded-md divide-y">
          {rows.map((row, i) => (
            <div key={row.id} className="flex items-center gap-3 p-3">
              <div className="flex flex-col">
                <button
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <Input
                  defaultValue={row.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== row.name) renameRow(row.id, v);
                  }}
                  className="font-medium"
                />
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                  <span>{row.file_name || "— no file —"}</span>
                  <span>{new Date(row.uploaded_at).toLocaleDateString()}</span>
                  {row.file_path && (
                    <a
                      href={pdfUrl(row.file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this PDF?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes "{row.name}" from the site and deletes the file. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteRow(row)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}