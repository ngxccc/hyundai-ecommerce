import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { categoryService } from "@/services";

export async function CategoriesSection() {
  const [t, locale] = await Promise.all([
    getTranslations("HomePage"),
    getLocale(),
  ]);

  const categories = await categoryService.getCategories(locale);

  if (!categories.length) return null;

  return (
    <section className="bg-background pt-14">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:px-8">
        <div className="mb-8 border-b pb-4">
          <h2 className="font-display text-foreground text-4xl font-extrabold tracking-tighter md:text-5xl">
            {t("categories.title")}
          </h2>
          <p className="text-muted-foreground mt-2 font-sans text-lg">
            {t("categories.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              href={`/products/category/${cat.slug}`}
              key={cat.id}
              className="group focus-visible:ring-primary relative flex h-[160px] flex-col justify-end overflow-hidden rounded-xl bg-zinc-900 p-5 shadow-xs transition-all duration-300 outline-none hover:shadow-lg focus-visible:ring-2 md:h-[180px]"
            >
              {cat.image && cat.image !== "" ? (
                <Image
                  alt={cat.description ?? cat.name}
                  src={cat.image}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900 to-zinc-800" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="relative z-10 flex items-end justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-white md:text-xl">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="mt-1 line-clamp-1 font-sans text-xs text-white/75 md:text-sm">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 rounded-full bg-white/20 p-2 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="size-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
