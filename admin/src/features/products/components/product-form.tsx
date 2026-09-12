"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { translatedZodResolver } from "@/shared/lib/validation-resolver";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
} from "../actions/product.actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formatNumberInput } from "@/shared/lib/utils";
import type { AdminProduct, AdminCategory, AdminBrand } from "@/types/api";
import {
  type CreateProductInput,
  createProductSchema,
} from "@/shared/validators";

import {
  ProductGeneralInfo,
  FacetedSpecs,
  SpecSheetEditor,
  ProductCategorySection,
  ProductDescriptionSection,
} from "./form-sections";
import { AdminImageUploadSection } from "@/shared/components/admin-image-upload-section";

export const ProductForm = ({
  initialData,
  categories,
  brands,
  breadcrumbs,
}: {
  initialData?: AdminProduct;
  categories: AdminCategory[];
  brands: AdminBrand[];
  breadcrumbs?: React.ReactNode;
}) => {
  const t = useTranslations("adminProductForm");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const [images, setImages] = useState<(string | File)[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : [],
  );

  const emptyFormValues = {
    slug: "",
    price: "",
    translations: [
      {
        locale: "vi",
        name: "",
        shortDescription: "",
        description: undefined,
        seoTitle: "",
        seoDescription: "",
      },
      {
        locale: "en",
        name: "",
        shortDescription: "",
        description: undefined,
        seoTitle: "",
        seoDescription: "",
      },
    ],
    images: [],
    brandId: "",
    categoryId: "",
    productType: "generator",
    powerKva: "",
    powerKw: "",
    standbyPowerKva: "",
    standbyPowerKw: "",
    phase: null,
    voltage: "",
    frequency: 50,
    fuelType: null,
    canopyType: null,
    startMethod: null,
    engineBrand: "",
    alternatorBrand: "",
    upsTopology: null,
    upsBatteryType: null,
    specSheet: [],
    isQuoteOnly: false,
    isActive: true,
    totalStockCache: 0,
    specs: {},
  } satisfies CreateProductInput;

  const form = useForm<CreateProductInput>({
    resolver: translatedZodResolver(createProductSchema, t),
    defaultValues: {
      slug: initialData?.slug ?? "",
      price: initialData?.price
        ? formatNumberInput(String(Number(initialData.price)))
        : "",
      translations: [
        {
          locale: "vi",
          name:
            initialData?.translations?.find((t) => t.locale === "vi")?.name ??
            initialData?.name ??
            "",
          shortDescription:
            initialData?.translations?.find((t) => t.locale === "vi")
              ?.shortDescription ??
            initialData?.shortDescription ??
            "",
          description:
            initialData?.translations?.find((t) => t.locale === "vi")
              ?.description ??
            initialData?.description ??
            undefined,
          seoTitle:
            initialData?.translations?.find((t) => t.locale === "vi")
              ?.seoTitle ??
            initialData?.seoTitle ??
            "",
          seoDescription:
            initialData?.translations?.find((t) => t.locale === "vi")
              ?.seoDescription ??
            initialData?.seoDescription ??
            "",
        },
        {
          locale: "en",
          name:
            initialData?.translations?.find((t) => t.locale === "en")?.name ??
            "",
          shortDescription:
            initialData?.translations?.find((t) => t.locale === "en")
              ?.shortDescription ?? "",
          description:
            initialData?.translations?.find((t) => t.locale === "en")
              ?.description ?? undefined,
          seoTitle:
            initialData?.translations?.find((t) => t.locale === "en")
              ?.seoTitle ?? "",
          seoDescription:
            initialData?.translations?.find((t) => t.locale === "en")
              ?.seoDescription ?? "",
        },
      ],
      images: initialData?.images ?? [],
      brandId: initialData?.brandId ?? "",
      categoryId: initialData?.categoryId ?? "",
      productType: initialData?.productType ?? "generator",
      powerKva: initialData?.powerKva ?? "",
      powerKw: initialData?.powerKw ?? "",
      standbyPowerKva: initialData?.standbyPowerKva ?? "",
      standbyPowerKw: initialData?.standbyPowerKw ?? "",
      phase: initialData?.phase ?? null,
      voltage: initialData?.voltage ?? "",
      frequency: initialData?.frequency ?? 50,
      fuelType: initialData?.fuelType ?? null,
      canopyType: initialData?.canopyType ?? null,
      startMethod: initialData?.startMethod ?? null,
      engineBrand: initialData?.engineBrand ?? "",
      alternatorBrand: initialData?.alternatorBrand ?? "",
      upsTopology: initialData?.upsTopology ?? null,
      upsBatteryType: initialData?.upsBatteryType ?? null,
      specSheet: initialData?.specSheet ?? [],
      specs: initialData?.specs ?? {},
      totalStockCache: initialData?.totalStockCache ?? 0,
      isQuoteOnly: initialData?.isQuoteOnly ?? false,
      isActive: initialData?.isActive ?? true,
    },
  });
  useEffect(() => {
    const stringImages = images.map((img) =>
      typeof img === "string" ? img : img.name,
    );
    form.setValue("images", stringImages, {
      shouldValidate: form.formState.isSubmitted,
      shouldDirty: true,
    });
  }, [images, form]);

  const onSubmit = (data: CreateProductInput) => {
    startTransition(async () => {
      const existingImageUrls: string[] = [];
      const imagesToUpload: File[] = [];

      for (const item of images) {
        if (item instanceof File) {
          imagesToUpload.push(item);
        } else if (typeof item === "string" && item.trim().length > 0) {
          existingImageUrls.push(item.trim());
        }
      }

      const payload = {
        ...data,
        price: data.price ? data.price.replace(/\./g, "") : "",
        images: existingImageUrls,
        isQuoteOnly: Boolean(data.isQuoteOnly),
      };

      const finalFormData = new FormData();
      finalFormData.append("payload", JSON.stringify(payload));
      for (const item of imagesToUpload) {
        finalFormData.append("images", item);
      }

      const result = isEditing
        ? await updateProductAction(initialData.id, finalFormData)
        : await createProductAction(finalFormData);

      if (result.success) {
        toast.success(
          isEditing ? t("messages.successUpdate") : t("messages.successCreate"),
        );

        if (!isEditing) {
          form.reset(emptyFormValues);
          setImages([]);
        }
      } else {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            const message = errors[0];
            if (message) {
              form.setError(field as keyof CreateProductInput, {
                type: "server",
                message,
              });
            }
          });
        }
        toast.error(result.error ?? t("messages.error"));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-background/80 sticky top-15 z-30 mb-2 flex w-full items-center justify-between rounded-none py-2 backdrop-blur-md sm:top-20 sm:pt-1 sm:pb-2">
          <div className="hidden flex-1 sm:block">{breadcrumbs}</div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-fit">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/products")}
            >
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("buttons.submitting") : t("buttons.submit")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            <ProductGeneralInfo form={form} />
            <ProductDescriptionSection form={form} />
            <FacetedSpecs form={form} />
            <SpecSheetEditor form={form} />
          </div>
          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <AdminImageUploadSection
                title={t("fields.images")}
                images={images}
                setImages={setImages}
                urlPlaceholder={t("fields.imagesPlaceholder")}
                addUrlLabel={t("buttons.addUrl")}
                dragDropLabel={t("fields.dragDropImage")}
                clickToSelectLabel={t("fields.orClickToSelect")}
              />
              {form.formState.errors.images && (
                <p className="text-destructive mt-1.5 px-1 text-sm">
                  {form.formState.errors.images.message}
                </p>
              )}
            </div>
            <ProductCategorySection
              form={form}
              categories={categories}
              brands={brands}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};
