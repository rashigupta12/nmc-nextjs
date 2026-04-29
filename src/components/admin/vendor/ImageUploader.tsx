// components/admin/vendor/ImageUploader.tsx
/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  cropDimensions?: { width: number; height: number };
}

type UploadState = "idle" | "signing" | "uploading" | "done" | "error";

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageUploader({
  value,
  onChange,
  folder = "admin-content",
  label,
  className,
  cropDimensions,
}: ImageUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>("");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const aspect = cropDimensions ? cropDimensions.width / cropDimensions.height : undefined;

  // ─── Upload to Cloudinary ───────────────────────────────────────────────────
  const uploadFile = useCallback(
    async (file: File) => {
      setState("signing");
      setProgress(0);
      setErrMsg(null);

      try {
        const signRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });
        if (!signRes.ok) throw new Error("Failed to get upload signature");
        const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await signRes.json();

        setState("uploading");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", signedFolder);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              onChange(data.secure_url);
              setState("done");
              resolve();
            } else {
              reject(new Error("Cloudinary upload failed"));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(formData);
        });
      } catch (err: any) {
        setErrMsg(err.message ?? "Upload failed");
        setState("error");
      }
    },
    [folder, onChange]
  );

  // ─── Get cropped blob from canvas ──────────────────────────────────────────
  const getCroppedBlob = useCallback(
    (image: HTMLImageElement, cropArea: Crop, mimeType: string, fileName: string): Promise<File> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Output at requested cropDimensions if provided, else use cropped pixel size
        const outputWidth = cropDimensions?.width ?? Math.round(cropArea.width * scaleX);
        const outputHeight = cropDimensions?.height ?? Math.round(cropArea.height * scaleY);

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No canvas context"));

        ctx.drawImage(
          image,
          cropArea.x * scaleX,
          cropArea.y * scaleY,
          cropArea.width * scaleX,
          cropArea.height * scaleY,
          0,
          0,
          outputWidth,
          outputHeight
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas toBlob failed"));
            resolve(new File([blob], fileName, { type: mimeType }));
          },
          mimeType,
          0.95
        );
      });
    },
    [cropDimensions]
  );

  // ─── File selected → open crop modal (or upload directly if no cropDimensions) ─
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!cropDimensions) {
      // No cropping needed — upload straight away
      uploadFile(file);
      return;
    }

    // Show crop modal
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setRawFile(file);
      setCrop(undefined); // will be set on image load
      setCompletedCrop(undefined);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // ─── Image loaded inside modal → initialise centered crop ──────────────────
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const initialCrop = aspect
      ? centerAspectCrop(width, height, aspect)
      : centerCrop({ unit: "%", width: 90, height: 90 }, width, height);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop as Crop);
  };

  // ─── Confirm crop ───────────────────────────────────────────────────────────
  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop || !rawFile) return;

    // Convert % crop to px if needed
    const img = imgRef.current;
    let pxCrop: Crop = completedCrop;

    if (completedCrop.unit === "%") {
      pxCrop = {
        unit: "px",
        x: (completedCrop.x / 100) * img.width,
        y: (completedCrop.y / 100) * img.height,
        width: (completedCrop.width / 100) * img.width,
        height: (completedCrop.height / 100) * img.height,
      };
    }

    try {
      const croppedFile = await getCroppedBlob(img, pxCrop, rawFile.type, rawFile.name);
      setCropModalOpen(false);
      setRawImageSrc("");
      await uploadFile(croppedFile);
    } catch (err: any) {
      setErrMsg(err.message ?? "Crop failed");
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setRawImageSrc("");
    setRawFile(null);
  };

  const clear = () => {
    onChange("");
    setState("idle");
    setErrMsg(null);
    setProgress(0);
  };

  const isLoading = state === "signing" || state === "uploading";

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {label && <Label className="text-sm font-medium">{label}</Label>}

        {value && (
          <div className="flex items-center gap-3 p-2 border rounded-lg bg-muted/30">
            <img src={value} alt="Current" className="w-12 h-12 object-cover rounded border" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{value.split("/").pop()}</p>
            </div>
            <button
              type="button"
              onClick={clear}
              disabled={isLoading}
              className="p-1 hover:bg-destructive/10 rounded"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {state === "signing" ? "Preparing..." : `${progress}%`}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </>
            )}
          </Button>
          {value && !isLoading && <span className="text-xs text-green-600">✓ Uploaded</span>}
          {cropDimensions && !isLoading && !value && (
            <span className="text-xs text-muted-foreground">
              {cropDimensions.width}×{cropDimensions.height}px
            </span>
          )}
        </div>

        {errMsg && <p className="text-xs text-red-600">{errMsg}</p>}
      </div>

      {/* ─── Crop Modal ──────────────────────────────────────────────────────── */}
      <Dialog open={cropModalOpen} onOpenChange={(open) => !open && handleCropCancel()}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>
              Crop Image
              {cropDimensions && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({cropDimensions.width} × {cropDimensions.height}px)
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center max-h-[60vh] overflow-auto rounded-md bg-muted/20 p-2">
            {rawImageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                minWidth={10}
                minHeight={10}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={rawImageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ maxHeight: "55vh", maxWidth: "100%", objectFit: "contain" }}
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCropCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCropConfirm} disabled={!completedCrop}>
              Crop & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}