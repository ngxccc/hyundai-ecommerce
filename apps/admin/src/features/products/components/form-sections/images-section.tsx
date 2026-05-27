import React from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FormControl, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

interface ProductImagesSectionProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ProductImagesSection = ({ images, setImages }: ProductImagesSectionProps) => {
  const t = useTranslations("AdminProductForm");

  return (
    <Card className="py-4 shadow-sm">
      <CardHeader className="border-b pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <ImageIcon className="text-primary h-5 w-5" />
          {t("fields.images")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-border bg-muted/20 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors">
            <ImageIcon className="text-muted-foreground mb-2 h-10 w-10 opacity-50" />
            <p className="text-foreground font-medium">
              {t("fields.dragDropImage")}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("fields.orClickToSelect")}
            </p>
          </div>
          <div>
            <label className="text-muted-foreground mb-2 block text-sm font-medium">
              {t("fields.orEnterUrl")}
            </label>
            <div className="flex flex-col gap-3">
              {images.map((image, index) => (
                <div key={`${index}-${image}`} className="flex items-start gap-2">
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        value={image}
                        onChange={(event) => {
                          const nextImage = event.target.value;
                          setImages((current) =>
                            current.map((currentImage, currentIndex) =>
                              currentIndex === index ? nextImage : currentImage,
                            ),
                          );
                        }}
                        placeholder={t("fields.imagesPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      setImages((current) =>
                        current.length > 1
                          ? current.filter((_, currentIndex) => currentIndex !== index)
                          : [""],
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => setImages((current) => [...current, ""])}
                className="flex w-full items-center gap-2"
              >
                <Plus className="h-4 w-4" /> {t("fields.addImage")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
