"use client";

import { useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
} from "../actions/product.actions";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Form } from "@nhatnang/ui/components/ui/form";
import { formatNumberInput } from "@nhatnang/shared/lib/utils";
import {
  type TProduct,
  type TCategory,
  type TBrand,
} from "@nhatnang/database/schemas";
import {
  createProductSchema,
  type TCreateProductInput,
} from "@nhatnang/database/validators";

import {
  ProductGeneralInfo,
  ProductTechnicalSpecs,
  ProductImagesSection,
  ProductCategorySection,
  ProductDescriptionSection,
} from "./form-sections";

export const ProductForm = ({
  initialData,
  categories,
  brands,
  breadcrumbs,
}: {
  initialData?: TProduct;
  categories: TCategory[];
  brands: TBrand[];
  breadcrumbs?: React.ReactNode;
}) => {
  const t = useTranslations("AdminProductForm");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const [images, setImages] = useState<string[]>(
    initialData?.images?.length ? initialData.images : [""],
  );
  const emptyFormValues = {
    name: "",
    slug: "",
    price: "",
    description: undefined,
    shortDescription: "",
    images: [],
    brandId: null,
    categoryId: null,
    isQuoteOnly: false,
    specs: {},
  } satisfies TCreateProductInput;

  const form = useForm<TCreateProductInput>({
    resolver: zodResolver(
      createProductSchema(t),
    ) as Resolver<TCreateProductInput>,
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      price: initialData?.price
        ? formatNumberInput(String(Number(initialData.price)))
        : "",
      description: initialData?.description ?? undefined,
      shortDescription: initialData?.shortDescription ?? "",
      images: initialData?.images ?? [],
      brandId: initialData?.brandId ?? null,
      categoryId: initialData?.categoryId ?? null,
      isQuoteOnly: initialData?.isQuoteOnly ?? false,
      specs: initialData?.specs ?? {},
    },
  });

  const onSubmit = (data: TCreateProductInput) => {
    startTransition(async () => {
      const payload = {
        ...data,
        price: data.price ? data.price.replace(/\./g, "") : "",
        images: images.filter((image) => image.trim().length > 0),
        isQuoteOnly: data.isQuoteOnly ?? false,
      };
      const result = isEditing
        ? await updateProductAction(initialData.id, payload)
        : await createProductAction(payload);

      if (result.success) {
        toast.success(
          isEditing ? t("messages.successUpdate") : t("messages.successCreate"),
        );

        if (!isEditing) {
          form.reset(emptyFormValues);
          setImages([""]);
        }
      } else {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            const message = errors?.[0];
            if (message) {
              form.setError(field as keyof TCreateProductInput, {
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
            <ProductTechnicalSpecs form={form} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ProductImagesSection images={images} setImages={setImages} />
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
