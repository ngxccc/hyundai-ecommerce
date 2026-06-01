import React, { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, X, Link as LinkIcon, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import { useDropzone } from "react-dropzone";
import { CldImage } from "next-cloudinary";
import Image from "next/image";

interface ProductImagesSectionProps {
  images: (string | File)[];
  setImages: React.Dispatch<React.SetStateAction<(string | File)[]>>;
}

const PreviewImage = ({ item }: { item: string | File }) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    let url = "";
    if (item instanceof File) {
      url = URL.createObjectURL(item);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(item);
    }
  }, [item]);

  if (!previewUrl) return null;

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

export const ProductImagesSection = ({
  images,
  setImages,
}: ProductImagesSectionProps) => {
  const t = useTranslations("AdminProductForm");
  const [externalUrl, setExternalUrl] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setImages((prev) => [...prev, ...acceptedFiles]);
    },
    [setImages],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".webp", ".jpg"] },
    maxSize: 10485760, // 10MB
  });

  const handleAddExternalUrl = () => {
    if (externalUrl.trim()) {
      setImages((prev) => [...prev, externalUrl.trim()]);
      setExternalUrl("");
    }
  };

  return (
    <Card className="py-4 shadow-sm">
      <CardHeader className="border-b px-4 pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <ImageIcon className="text-primary h-5 w-5" />
          {t("fields.images")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pt-4">
        {/* URL Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExternalUrl();
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddExternalUrl}
            variant="secondary"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("buttons.addUrl")}
          </Button>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "bg-primary/10 border-primary"
              : "bg-muted/20 hover:bg-muted/50"
          }`}
        >
          <input {...getInputProps()} />
          <ImageIcon className="text-muted-foreground mb-2 h-10 w-10 opacity-50" />
          <p className="text-foreground font-medium">
            {isDragActive ? "Drop the files here" : t("fields.dragDropImage")}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("fields.orClickToSelect")}
          </p>
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => {
              // Unique key: if string, use it. If file, use name+size
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
                    onClick={() =>
                      setImages((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
