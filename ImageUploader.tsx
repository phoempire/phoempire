import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const BUCKET = "pho-empire-images";

export function publicUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

type Props = {
  value?: string | null;
  alt?: string;
  folder: string;
  onUploaded: (path: string) => void | Promise<void>;
  aspect?: string;
  /** Numeric aspect ratio for cropping (width/height). Defaults to 4/3. */
  aspectRatio?: number;
  /** If false, skip the crop dialog and upload the file as-is. Defaults to true. */
  enableCrop?: boolean;
};

async function getCroppedBlob(imageSrc: string, area: Area, mime = "image/jpeg"): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  const w = Math.max(1, Math.round(area.width));
  const h = Math.max(1, Math.round(area.height));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // Fill background (in case the crop extends beyond the image when zoomed out)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  // Compute the intersection between the requested crop and the actual image,
  // then draw it at the matching offset inside the output canvas.
  const sx = Math.max(0, area.x);
  const sy = Math.max(0, area.y);
  const sx2 = Math.min(img.naturalWidth, area.x + area.width);
  const sy2 = Math.min(img.naturalHeight, area.y + area.height);
  const sw = Math.max(0, sx2 - sx);
  const sh = Math.max(0, sy2 - sy);
  if (sw > 0 && sh > 0) {
    const scaleX = w / area.width;
    const scaleY = h / area.height;
    const dx = (sx - area.x) * scaleX;
    const dy = (sy - area.y) * scaleY;
    const dw = sw * scaleX;
    const dh = sh * scaleY;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), mime, 0.92)
  );
}

export default function ImageUploader({
  value,
  alt,
  folder,
  onUploaded,
  aspect = "aspect-[4/3]",
  aspectRatio = 4 / 3,
  enableCrop = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const lastValueRef = useRef<string | null | undefined>(value);
  const skipNextTrackRef = useRef(false);

  // Track value changes so we can offer Undo after a replace.
  useEffect(() => {
    if (lastValueRef.current !== value) {
      if (skipNextTrackRef.current) {
        skipNextTrackRef.current = false;
      } else if (lastValueRef.current) {
        setPrevValue(lastValueRef.current);
      }
      lastValueRef.current = value;
    }
  }, [value]);

  // Crop dialog state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [origName, setOrigName] = useState<string>("upload.jpg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [croppedAreaPct, setCroppedAreaPct] = useState<Area | null>(null);

  const onCropComplete = useCallback((areaPct: Area, areaPx: Area) => {
    setCroppedArea(areaPx);
    setCroppedAreaPct(areaPct);
  }, []);

  const uploadBlob = async (blob: Blob, name: string) => {
    const safeName = name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${folder}/${Date.now()}-${safeName}`;
    const up = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" });
    if (up.error) throw up.error;
    await onUploaded(path);
  };

  const handleFile = async (file: File) => {
    if (!enableCrop) {
      setUploading(true);
      try {
        await uploadBlob(file, file.name);
        toast.success("Image uploaded");
      } catch (e: any) {
        toast.error(e.message ?? "Upload failed");
      } finally {
        setUploading(false);
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setOrigName(file.name);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleEditCurrent = async () => {
    if (!value) return;
    try {
      const url = publicUrl(value);
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setOrigName(value.split("/").pop() ?? "image.jpg");
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(blob);
    } catch (e: any) {
      toast.error(e.message ?? "Could not load image for editing");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard || !(navigator.clipboard as any).read) {
        toast.error("Clipboard read not supported. Try Ctrl/Cmd+V on this card instead.");
        return;
      }
      const items: any[] = await (navigator.clipboard as any).read();
      for (const item of items) {
        const types: string[] = item.types ?? [];
        const type = types.find((t) => t.startsWith("image/"));
        if (type) {
          const blob: Blob = await item.getType(type);
          const ext = type.split("/")[1] || "png";
          await handleFile(new File([blob], `pasted.${ext}`, { type }));
          return;
        }
      }
      toast.error("No image found in clipboard. Copy an image first.");
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      if (/denied|permission|not allowed/i.test(msg)) {
        toast.error("Clipboard permission denied. Allow clipboard access or press Ctrl/Cmd+V instead.");
      } else {
        toast.error(`Clipboard read failed: ${msg}`);
      }
    }
  };

  const confirmCrop = async () => {
    if (!cropSrc || !croppedArea || !croppedAreaPct) return;
    setUploading(true);
    try {
      // Reconstruct unclamped pixel rect from the percentage area so that
      // zoom-out (where the crop extends beyond the image) preserves padding.
      const tmp = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = cropSrc;
      });
      const realArea: Area = {
        x: (croppedAreaPct.x / 100) * tmp.naturalWidth,
        y: (croppedAreaPct.y / 100) * tmp.naturalHeight,
        width: (croppedAreaPct.width / 100) * tmp.naturalWidth,
        height: (croppedAreaPct.height / 100) * tmp.naturalHeight,
      };
      const blob = await getCroppedBlob(cropSrc, realArea, "image/jpeg");
      const base = origName.replace(/\.[^.]+$/, "") || "image";
      await uploadBlob(blob, `${base}.jpg`);
      toast.success("Image uploaded");
      setCropSrc(null);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      <div className={`${aspect} w-48 bg-muted rounded overflow-hidden flex items-center justify-center shrink-0`}>
        {value ? (
          <img src={publicUrl(value)} alt={alt ?? ""} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">No image</span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          {value && (
            <Button variant="outline" size="sm" disabled={uploading} onClick={handleEditCurrent}>
              Edit Image
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? "Uploading…" : value ? "Replace from Files" : "Upload from Files"}
          </Button>
          <Button variant="outline" size="sm" disabled={uploading} onClick={handlePasteFromClipboard}>
            Paste from Clipboard
          </Button>
          {prevValue && prevValue !== value && (
            <Button
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={async () => {
                const target = prevValue;
                setPrevValue(null);
                skipNextTrackRef.current = true;
                try {
                  await onUploaded(target);
                  toast.success("Reverted to previous image");
                } catch (e: any) {
                  skipNextTrackRef.current = false;
                  toast.error(e.message ?? "Undo failed");
                }
              }}
            >
              Undo
            </Button>
          )}
        </div>
        {value && <p className="text-[11px] text-muted-foreground break-all">{value}</p>}
      </div>

      <Dialog open={!!cropSrc} onOpenChange={(o) => !o && !uploading && setCropSrc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adjust crop</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[420px] bg-muted rounded overflow-hidden">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                minZoom={1}
                maxZoom={4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Zoom</label>
            <Slider min={1} max={4} step={0.01} value={[zoom]} onValueChange={(v) => setZoom(v[0])} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCropSrc(null)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={confirmCrop} disabled={uploading || !croppedArea}>
              {uploading ? "Uploading…" : "Save crop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
