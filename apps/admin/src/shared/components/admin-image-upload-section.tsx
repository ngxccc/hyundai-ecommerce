"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Image as ImageIcon, Link as LinkIcon, Plus, X } from "lucide-react";
import { useDropzone, type Accept } from "react-dropzone";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { Input } from "@nhatnang/ui/components/ui/input";

export type AdminImageItem = string | File;

export interface AdminImageUploadSectionProps {
  title: ReactNode;
  images: AdminImageItem[];
  setImages: React.Dispatch<React.SetStateAction<AdminImageItem[]>>;
  urlPlaceholder: string;
  addUrlLabel: ReactNode;
  dragDropLabel: ReactNode;
  clickToSelectLabel: ReactNode;
  limitReachedMessage?: ReactNode;
  maxImages?: number;
  enableFileUpload?: boolean;
  resolveFile?: (file: File) => Promise<string | null>;
  accept?: Accept;
  cardClassName?: string;
}

const defaultAccept: Accept = { "image/*": [".jpeg", ".png", ".webp", ".jpg"] };

const PreviewImage = ({ item }: { item: AdminImageItem }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item instanceof File) {
      const url = URL.createObjectURL(item);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setObjectUrl(url);

      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [item]);

  const previewUrl = item instanceof File ? objectUrl : item;

  if (!previewUrl) {
    return null;
  }

  return previewUrl.includes("cloudinary.com") ? (
    <CldImage
      src={previewUrl}
      alt="Preview"
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
      className="h-full w-full object-cover"
    />
  ) : (
    <Image
      src={previewUrl}
      alt="Preview"
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
      className="h-full w-full object-cover"
    />
  );
};

export const AdminImageUploadSection = ({
  title,
  images,
  setImages,
  urlPlaceholder,
  addUrlLabel,
  dragDropLabel,
  clickToSelectLabel,
  limitReachedMessage,
  maxImages,
  enableFileUpload = true,
  resolveFile,
  accept = defaultAccept,
  cardClassName,
}: AdminImageUploadSectionProps) => {
  const [externalUrl, setExternalUrl] = useState("");

  const remainingCapacity = useMemo(() => {
    if (typeof maxImages !== "number") {
      return null;
    }

    return Math.max(maxImages - images.length, 0);
  }, [images.length, maxImages]);

  const isAtLimit = remainingCapacity === 0;
  const canUploadFiles = enableFileUpload && !isAtLimit;

  const clampNextItems = useCallback(
    (nextItems: AdminImageItem[]) => {
      if (typeof maxImages !== "number") {
        return nextItems;
      }

      return nextItems.slice(0, maxImages);
    },
    [maxImages],
  );

  const appendImages = useCallback(
    (items: AdminImageItem[]) => {
      if (items.length === 0) {
        return;
      }

      setImages((current) => clampNextItems([...current, ...items]));
    },
    [clampNextItems, setImages],
  );

  const handleAddExternalUrl = useCallback(() => {
    const trimmedUrl = externalUrl.trim();

    if (!trimmedUrl || isAtLimit) {
      return;
    }

    appendImages([trimmedUrl]);
    setExternalUrl("");
  }, [appendImages, externalUrl, isAtLimit]);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!canUploadFiles) {
        return;
      }

      const allowedFiles =
        typeof remainingCapacity === "number"
          ? acceptedFiles.slice(0, remainingCapacity)
          : acceptedFiles;

      if (allowedFiles.length === 0) {
        return;
      }

      if (!resolveFile) {
        appendImages(allowedFiles);
        return;
      }

      const resolvedImages: AdminImageItem[] = [];

      for (const file of allowedFiles) {
        const uploadedUrl = await resolveFile(file);
        if (uploadedUrl) {
          resolvedImages.push(uploadedUrl);
        }
      }

      appendImages(resolvedImages);
    },
    [appendImages, canUploadFiles, remainingCapacity, resolveFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      void handleDrop(acceptedFiles);
    },
    accept,
    maxSize: 10 * 1024 * 1024,
    disabled: !canUploadFiles,
    ...(typeof remainingCapacity === "number"
      ? { maxFiles: remainingCapacity }
      : {}),
  });

  const showLimitMessage =
    typeof maxImages === "number" && Boolean(limitReachedMessage);

  return (
    <Card className={cardClassName ?? "gap-4 py-4 shadow-sm"}>
      <CardHeader className="border-b px-4 pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <ImageIcon className="text-primary h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        {enableFileUpload ? (
          <div
            {...getRootProps()}
            aria-disabled={isAtLimit}
            className={`border-border flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isAtLimit
                ? "bg-muted/10 cursor-not-allowed opacity-70"
                : isDragActive
                  ? "bg-primary/10 border-primary cursor-pointer"
                  : "bg-muted/20 hover:bg-muted/50 cursor-pointer"
            }`}
          >
            <input {...getInputProps()} disabled={isAtLimit} />
            <ImageIcon className="text-muted-foreground mb-2 h-10 w-10 opacity-50" />
            <p className="text-foreground font-medium">
              {isDragActive ? "Drop the files here" : dragDropLabel}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {clickToSelectLabel}
            </p>
            {showLimitMessage && isAtLimit ? (
              <p className="text-muted-foreground mt-3 text-sm">
                {limitReachedMessage}
              </p>
            ) : null}
          </div>
        ) : showLimitMessage && isAtLimit ? (
          <p className="text-muted-foreground text-sm">{limitReachedMessage}</p>
        ) : null}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              placeholder={urlPlaceholder}
              className="pl-9"
              disabled={isAtLimit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddExternalUrl();
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddExternalUrl}
            variant="secondary"
            disabled={isAtLimit || !externalUrl.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            {addUrlLabel}
          </Button>
        </div>

        {images.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => {
              const keyStr =
                image instanceof File ? `${image.name}-${image.size}` : image;

              return (
                <div
                  key={`${index}-${keyStr}`}
                  className="group border-border relative aspect-square overflow-hidden rounded-md border"
                >
                  <PreviewImage item={image} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() =>
                      setImages((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
