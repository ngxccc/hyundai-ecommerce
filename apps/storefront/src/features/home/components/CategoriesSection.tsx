"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function CategoriesSection() {
  const t = useTranslations("HomePage");

  const categories = [
    {
      key: "industrial" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCPkcYjIBimva_BQCq-alfWskfU2-oLC1nfgG6K7131nTYUl8ap-_rpvf5VMzuFhIPay1KbuEWIc-X-FHfmyTA39LVZTvZqv-ABNvwjl20RznJHlSK8a_fPx9BXENN1OojbEq8NyYfhF53vcBCPbEnjG8nIvak-rF5AxCx29v7zAY1SNgWveKSN8cHkhUQk7uwAFyWQUj8k3rHclALDgmx3CAJcFPElHyHzOoX-zRRRr6O-MO7U1JUk0jwQzXX7cTvjlXK3zUvXoiYn",
      span: "md:col-span-8",
      gradient: "from-primary/90",
      size: "text-3xl",
    },
    {
      key: "household" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBcgepRit8EJYYcrmsaLxVPjbtdQt6InD7FMMxYxisYXtVds7jIQEgp5KnHlo4KhbGszEfLci33v5-Gq89qpr9FEwuqOG4QTKyO-3lqgSzP1yRgMnEt7XYSKJymM3RmZZwv8zFF99udq1YA4DZbuOAnHSlnWUWqygbjNz-Z3B2VoUhmjoifzK29TDmSQpJ-C1wVmS_Z1AC-9toV9tZw5xdYy3ywWD1JCTkiUoid_ow5rMxzaQCImwUjY8svC-a-VNoVDW0o_PdZrdXr",
      span: "md:col-span-4",
      gradient: "from-black/70",
      size: "text-2xl",
    },
    {
      key: "ups" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDRYugbYlKawKmaUXEpToa9fvl_DuSQYSq2xhtKdwR991tNVYe34YLjEkG6pATbxsyURg2XBjBrsFlyOvEHwkgh0OL4jMHETohKTd9pNY1cdg1EWHY15AO8AyoET4tYVtEypSobqekjG3womVzUB8HjoaoSFn1DZ6IfIcj128Vz9oSabdCuNUqv3AlvgLHb-pbZ4i41msLAP9wFxFNcFX1_Opniv1JS1i1kilWcMB2fVhKoC22PDaoXS6IUhI3lMXi2DJhdQa_eRXVN",
      span: "md:col-span-4",
      gradient: "from-black/70",
      size: "text-2xl",
    },
    {
      key: "hpgreen" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDqvjI8hfIGHjiNc6QTD6_ArLQ0tbxgPTPZLEQJBqakStYHqPZBJpLnwiNv-fKnmawpFXAgGCZbyzzp9fcxKWFmqukYTUVLlZlx3_eXIu5HxOBztiIS69gkbn2gW3_un_qE_pNX5XOf2deY5ArHPauicZvyCCzyu2WmgZ61SAfy5vYTxX0pVIuvvBvBF2lxzp4BAazI4UB8ZWZvdp44CztemkGSUyHwBS0mG99sUcrvOEYcd4EQl8MWA0gn_4t9MIq35WQB6OfNWMjJ",
      span: "md:col-span-8",
      gradient: "from-tertiary/90",
      size: "text-3xl",
    },
  ];

  return (
    <section className="bg-surface-container-low py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <h2 className="font-headline text-on-surface text-4xl font-extrabold tracking-tighter">
              {t("categories.title")}
            </h2>
            <p className="font-label text-primary/60 mt-2 tracking-widest uppercase">
              {t("categories.subtitle")}
            </p>
          </div>
        </div>
        <div className="grid h-175 grid-cols-1 gap-6 md:grid-cols-12">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className={`${cat.span} group bg-surface-container-lowest relative overflow-hidden rounded-xl shadow-sm transition-transform duration-500 hover:-translate-y-1`}
            >
              <Image
                alt={t(`categories.${cat.key}.name`)}
                src={cat.image}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes={cat.size}
              />
              <div
                className={`absolute inset-0 bg-linear-to-t ${cat.gradient} flex flex-col justify-end to-transparent p-10`}
              >
                <h3
                  className={`font-headline ${cat.size} mb-2 font-bold text-white`}
                >
                  {t(`categories.${cat.key}.name`)}
                </h3>
                <p className="font-body max-w-md text-white/80">
                  {t(`categories.${cat.key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
