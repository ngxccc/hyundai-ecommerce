import { useCallback, useRef, useState } from "react";
import { ReactCrop, type Crop, type PixelCrop } from "react-image-crop";
import { Crop as CropIcon, Loader2, Trash2 } from "lucide-react";
import { type Editor } from "@tiptap/react";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@nhatnang/ui/components/ui/dialog";

export interface CropExistingImageProps {
  editor: Editor;
  dictionary?: ((key: string) => string) | undefined;
}

export const CropExistingImage = ({
  editor,
  dictionary: t = (k: string) => k,
}: CropExistingImageProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Lấy ảnh hiện tại đang được chọn
  const imageAttrs = editor.getAttributes("image");
  const currentSrc = (imageAttrs?.["src"] as string) || "";

  function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setCroppedImageUrl(croppedImageUrl);
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY,
      );
    }

    return canvas.toDataURL("image/png", 1.0);
  }

  const handleCropSave = useCallback(() => {
    if (isCropping) return;
    if (!croppedImageUrl || !editor || editor.isDestroyed) return;

    setIsCropping(true);
    try {
      // Vì không dùng uploadOptions, ta thay thế trực tiếp URL gốc bằng cropped base64/blob
      // (Hoặc nếu có logic upload sau này thì thay đổi ở đây)
      editor
        .chain()
        .focus()
        .updateAttributes("image", { src: croppedImageUrl })
        .run();

      setDialogOpen(false);
      setCrop(undefined);
      setCroppedImageUrl("");
    } catch (error) {
      console.error("Error updating cropped image", error);
    } finally {
      setIsCropping(false);
    }
  }, [croppedImageUrl, editor, isCropping]);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        title={t("editor.imageUpload.crop")}
        onClick={() => setDialogOpen(true)}
      >
        <CropIcon className="h-4 w-4" />
      </Button>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open: boolean) => {
          setDialogOpen(open);
          if (!open) {
            setCrop(undefined);
            setCroppedImageUrl("");
          }
        }}
      >
        <DialogContent>
          <DialogTitle>{t("editor.imageUpload.crop")}</DialogTitle>
          <DialogDescription className="sr-only">
            Crop existing image
          </DialogDescription>

          {currentSrc ? (
            <div className="flex items-center justify-center overflow-hidden py-4 text-center">
              <ReactCrop
                crop={crop ?? { unit: "%", width: 50, height: 50, x: 25, y: 25 }}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => onCropComplete(c)}
              >
                <img
                  ref={imgRef}
                  src={currentSrc}
                  alt="To be cropped"
                  crossOrigin="anonymous"
                  style={{
                    maxHeight: "60vh",
                    maxWidth: "100%",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </ReactCrop>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isCropping}
              onClick={() => {
                setDialogOpen(false);
                setCrop(undefined);
                setCroppedImageUrl("");
              }}
            >
              {t("editor.imageUpload.cancel")}
              <Trash2 className="ml-1 h-4 w-4" />
            </Button>

            <Button
              type="button"
              className="w-fit"
              disabled={isCropping || !crop}
              onClick={handleCropSave}
            >
              {isCropping ? (
                <>
                  {t("editor.imageUpload.uploading")}
                  <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  {t("editor.imageUpload.crop")}
                  <CropIcon className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
