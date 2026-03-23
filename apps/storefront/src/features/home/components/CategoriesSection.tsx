import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getBaseUrl } from "@/shared/lib/utils";
import type { CategoriesResponse, Category } from "@/shared/types/common";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

const CATEGORY_UI_MAP = {
  industrial: {
    span: "md:col-span-8",
    gradient: "from-primary/90",
    size: "text-3xl",
  },
  household: {
    span: "md:col-span-4",
    gradient: "from-black/70",
    size: "text-2xl",
  },
  ups: {
    span: "md:col-span-4",
    gradient: "from-black/70",
    size: "text-2xl",
  },
  hpgreen: {
    span: "md:col-span-8",
    gradient: "from-tertiary/90",
    size: "text-3xl",
  },
} as const satisfies Record<
  string,
  { span: string; gradient: string; size: string }
>;

const DEFAULT_UI = {
  span: "md:col-span-4",
  gradient: "from-black/70",
  size: "text-2xl",
};

type CategoryKey = keyof typeof CATEGORY_UI_MAP;

function isCategoryKey(value: string): value is CategoryKey {
  return value in CATEGORY_UI_MAP;
}

function isCategoryResponse(value: unknown): value is CategoriesResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  );
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${getBaseUrl()}/api/categories`, {
    // Next 15+ mặc định là no-store, nếu data ít đổi thì set force-cache hoặc ISR
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }

  const json: unknown = await res.json();
  if (!isCategoryResponse(json) || !json.status) {
    throw new Error("Invalid categories response");
  }

  return json.data;
};

export async function CategoriesSection() {
  const t = await getTranslations("HomePage");

  const categories = await fetchCategories();

  return (
    <section className="bg-background py-14">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="font-display text-foreground text-4xl font-extrabold tracking-tighter md:text-5xl">
              {t("categories.title")}
            </h2>
            <p className="text-muted-foreground mt-4 font-sans text-lg">
              {t("categories.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid auto-rows-[300px] grid-cols-1 gap-4 md:auto-rows-[360px] md:grid-cols-12 md:gap-6">
          {categories.map((cat) => {
            const ui = isCategoryKey(cat.slug)
              ? CATEGORY_UI_MAP[cat.slug]
              : DEFAULT_UI;

            return (
              <Link
                href={`/categories/${cat.id}`}
                key={cat.id}
                className={`${ui.span} group focus-visible:ring-primary relative overflow-hidden rounded-2xl shadow-sm transition-all duration-500 outline-none hover:shadow-xl focus-visible:ring-2`}
              >
                <Image
                  alt={cat.description}
                  src={cat.imageUrl}
                  fill
                  sizes={
                    ui.span.includes("col-span-8")
                      ? "(max-width: 768px) 100vw, 66vw"
                      : "(max-width: 768px) 100vw, 33vw"
                  }
                  className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                />

                <div
                  className={`absolute inset-0 bg-linear-to-t ${ui.gradient} flex flex-col justify-end p-6 transition-opacity duration-500 md:p-10`}
                >
                  <div className="flex items-end justify-between gap-4">
                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                      <h3
                        className={`font-display ${ui.size} mb-2 font-bold tracking-tight text-white drop-shadow-md`}
                      >
                        {cat.name}
                      </h3>
                      <p className="line-clamp-2 font-sans text-white/80 md:text-lg">
                        {cat.description}
                      </p>
                    </div>

                    <div className="shrink-0 translate-y-4 transform rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight className="size-5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
