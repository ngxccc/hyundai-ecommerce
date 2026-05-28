import { useCallback, useRef, useState } from "react";
import { ReactCrop, type Crop, type PixelCrop } from "react-image-crop";
import { Trash2, Loader2, Crop as CropIcon } from "lucide-react";
import { toast } from "sonner";
import { type Editor } from "@tiptap/react";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@nhatnang/ui/components/ui/dialog";
import {
  dataURLtoFile,
  readImageAsBase64,
  validateFiles,
} from "@nhatnang/ui/lib/file-utils";

interface ImageUploadOptions {
  upload?: (file: File) => Promise<string>;
  acceptMimes?: string[];
  maxSize?: number;
  multiple?: boolean;
  resourceImage?: "upload" | "link" | "both";
  defaultInline?: boolean;
  enableAlt?: boolean;
  onError?: (error: {
    type: "size" | "type" | "upload";
    message: string;
    file?: File;
  }) => void;
}

type ResolvedImageUploadOptions = Omit<
  ImageUploadOptions,
  | "acceptMimes"
  | "maxSize"
  | "multiple"
  | "resourceImage"
  | "defaultInline"
  | "enableAlt"
> &
  Required<
    Pick<
      ImageUploadOptions,
      | "acceptMimes"
      | "maxSize"
      | "multiple"
      | "resourceImage"
      | "defaultInline"
      | "enableAlt"
    >
  >;

export interface ImageCropperProps {
  editor: Editor | null;
  imageInline: boolean;
  onClose: () => void;
  disabled?: boolean;
  alt: string;
  uploadOptions: ResolvedImageUploadOptions;
  dictionary?: (key: string) => string;
}

export const ImageCropper = ({
  editor,
  imageInline,
  onClose,
  disabled,
  alt,
  uploadOptions,
  dictionary: t = (k: string) => k,
}: ImageCropperProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [urlUpload, setUrlUpload] = useState<{
    src: string;
    file: File | null;
  }>({
    src: "",
    file: null,
  });

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

  const onCrop = useCallback(async () => {
    if (isCropping) return;
    if (!croppedImageUrl || !editor || editor.isDestroyed) return;

    setIsCropping(true);
    try {
      const fileName = urlUpload.file?.name ?? "image.png";
      const fileCrop = dataURLtoFile(croppedImageUrl, fileName);

      let src = "";
      if (uploadOptions.upload) {
        src = await uploadOptions.upload(fileCrop);
      } else {
        const base64 = await readImageAsBase64(fileCrop);
        src = base64.src;
      }

      editor
        .chain()
        .focus()
        .setImageInline({ src, inline: imageInline, alt })
        .run();

      setDialogOpen(false);
      setCrop(undefined);
      setCroppedImageUrl("");

      setUrlUpload({
        src: "",
        file: null,
      });

      resetFileInput();
      onClose();
    } catch (error) {
      console.error("Error cropping image", error);
    } finally {
      setIsCropping(false);
    }
  }, [
    alt,
    croppedImageUrl,
    editor,
    imageInline,
    isCropping,
    onClose,
    uploadOptions,
    urlUpload.file?.name,
  ]);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    fileInput.current?.click();
  }

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!editor || editor.isDestroyed || !files || files.length === 0) {
      event.currentTarget.value = "";
      return;
    }

    const validFiles = validateFiles(files, {
      acceptMimes: uploadOptions.acceptMimes,
      maxSize: uploadOptions.maxSize,
      t,
      toast,
      ...(uploadOptions.onError ? { onError: uploadOptions.onError } : {}),
    });

    if (validFiles.length <= 0) {
      event.currentTarget.value = "";
      return;
    }

    const file = validFiles[0];
    if (!file) {
      event.currentTarget.value = "";
      return;
    }
    const base64 = await readImageAsBase64(file);

    setDialogOpen(true);
    setUrlUpload({
      src: base64.src,
      file,
    });
  };

  const resetFileInput = () => {
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  return (
    <>
      <Button
        className="flex-1"
        disabled={disabled}
        onClick={handleClick}
        size="sm"
      >
        {t("editor.image.dialog.tab.uploadCrop")}
      </Button>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open: boolean) => {
          setDialogOpen(open);
          if (!open) {
            setCrop(undefined);
            setCroppedImageUrl("");
            setUrlUpload({ src: "", file: null });
            resetFileInput();
          }
        }}
      >
        <DialogContent>
          <DialogTitle>{t("editor.image.dialog.tab.uploadCrop")}</DialogTitle>
          <DialogDescription className="sr-only">
            Upload and crop image
          </DialogDescription>

          <div>
            {urlUpload.src && (
              <ReactCrop
                className="w-full"
                crop={
                  crop ?? { unit: "%", width: 50, height: 50, x: 25, y: 25 }
                }
                onChange={(c) => setCrop(c)}
                onComplete={(c) => onCropComplete(c)}
              >
                <img alt={alt} ref={imgRef} src={urlUpload.src} />
              </ReactCrop>
            )}
          </div>

          <DialogFooter>
            <Button
              disabled={isCropping}
              onClick={() => {
                setDialogOpen(false);
                setUrlUpload({
                  src: "",
                  file: null,
                });
                resetFileInput();
              }}
            >
              {t("editor.imageUpload.cancel")}

              <Trash2 className="ml-1 h-4 w-4" />
            </Button>

            <Button
              className="w-fit"
              disabled={isCropping || !crop}
              onClick={onCrop}
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

      <input
        accept={
          uploadOptions.acceptMimes.length > 0
            ? uploadOptions.acceptMimes.join(",")
            : "image/*"
        }
        multiple={false} // TODO No sense unless doing queue processing
        onChange={handleFile}
        ref={fileInput}
        style={{ display: "none" }}
        type="file"
      />
    </>
  );
}
