"use client";

import { useTranslations } from "next-intl";

export function ProductsSection() {
  const t = useTranslations("HomePage");

  const products = [
    {
      key: "product1" as const,
      specs: ["250kVA", "Dầu diesel"],
    },
    {
      key: "product2" as const,
      specs: ["7.5kW", "Xăng"],
    },
    {
      key: "product3" as const,
      specs: ["3kVA", "Chuyển đổi kép trực tuyến"],
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16">
          <h2 className="font-headline text-on-surface text-4xl font-extrabold tracking-tighter">
            {t("products.title")}
          </h2>
          <p className="font-label text-primary/60 mt-2 tracking-widest uppercase">
            {t("products.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {products.map((product) => (
            <div key={product.key} className="group flex h-full flex-col">
              <div className="bg-surface-container-low relative mb-6 aspect-square overflow-hidden rounded-xl">
                <div className="font-label bg-surface-container-highest absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase">
                  Model: {t(`products.${product.key}.model`)}
                </div>
              </div>
              <div className="flex grow flex-col px-2">
                <h3 className="font-headline text-on-surface mb-2 text-xl font-bold">
                  {t(`products.${product.key}.name`)}
                </h3>
                <div className="mb-6 flex gap-3">
                  {product.specs.map((spec, i) => (
                    <span
                      key={i}
                      className="font-label bg-surface-container-high px-2 py-1 text-[11px] font-semibold uppercase"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="border-outline-variant/15 mt-auto flex h-16 items-center justify-between border-t pt-6">
                  <span className="font-label text-primary text-lg font-bold">
                    {t(`products.${product.key}.price`)}
                  </span>
                  <button className="bg-primary font-headline rounded px-4 py-2 text-[10px] font-bold text-white uppercase">
                    {t(`products.${product.key}.cta`)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
