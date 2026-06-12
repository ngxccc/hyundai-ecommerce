"use client";

import { useTranslations } from "next-intl";
import { Edit } from "lucide-react";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { Link } from "@/i18n/routing";
import type { TBrand } from "@nhatnang/database/schemas";

import { DeleteBrandButton } from "./delete-brand-button";

export const BrandCard = ({ brand }: { brand: TBrand }) => {
  const t = useTranslations("AdminBrands.card");

  const status = brand.isActive ? "active" : "inactive";
  const image = brand.logo?.length ? brand.logo : "https://placehold.co/400x300/png?text=No+Image";



  return (
    <Card className="group relative flex flex-col gap-0 p-3 shadow-sm">
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant="secondary"
          className={`border-transparent font-medium ${
            status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {t(`status.${status}`)}
        </Badge>
      </div>

      <div className="bg-muted relative mb-4 aspect-4/3 overflow-hidden rounded-lg">
        {image.includes("cloudinary.com") ? (
          <CldImage
            src={image}
            alt={brand.name}
            width={400}
            height={300}
            className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 dark:mix-blend-normal"
          />
        ) : (
          <Image
            src={image}
            alt={brand.name}
            width={400}
            height={300}
            className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 dark:mix-blend-normal"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          {brand.slug}
        </p>
        <h3 className="text-primary mb-1 line-clamp-2 text-base font-semibold">
          {brand.name}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
          {brand.descriptionVi ?? brand.descriptionEn ?? "No description"}
        </p>

        <div className="mt-auto flex items-end justify-end">
          <div className="flex gap-1 transition-opacity opacity-40 sm:group-hover:opacity-100">
            <Link href={`/brands/${brand.id}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 transition-colors"
                title={t("actions.edit")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteBrandButton
              brandId={brand.id}
              brandName={brand.name}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
