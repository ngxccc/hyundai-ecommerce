import { Link } from "@/i18n/routing";
import { getBaseUrl } from "@/shared/lib/utils";
import type { ProductsResponse, Product } from "@/shared/types/common";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

function isProductListResponse(value: unknown): value is ProductsResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  );
}

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${getBaseUrl()}/api/products`, {
    // Next 15+ mặc định là no-store, nếu data ít đổi thì set force-cache hoặc ISR
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  const json: unknown = await res.json();
  if (!isProductListResponse(json) || !json.status) {
    throw new Error("Invalid products response");
  }

  return json.data;
};

export async function ProductsSection() {
  const t = await getTranslations("HomePage");

  const products = await fetchProducts();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16">
          <h2 className="font-display text-on-surface text-4xl font-extrabold tracking-tighter">
            {t("products.title")}
          </h2>
          <p className="font-label text-primary/60 mt-2 tracking-widest uppercase">
            {t("products.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="group flex h-full flex-col">
              <div className="bg-surface-container-low relative mb-6 aspect-square overflow-hidden rounded-xl">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="font-label bg-surface-container-highest absolute top-4 left-4 z-10 px-3 py-1 text-[10px] font-bold uppercase">
                  Model: {product.model}
                </div>
              </div>

              <div className="flex grow flex-col px-2">
                <h3 className="font-display text-on-surface mb-2 text-xl font-bold">
                  {product.name}
                </h3>

                <div className="mb-6 flex gap-3">
                  {product.specs.map((spec) => (
                    <span
                      key={`${product.id}-${spec}`}
                      className="font-label bg-surface-container-high px-2 py-1 text-[11px] font-semibold uppercase"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="border-outline-variant/15 bg-surface-container-low mt-auto flex h-16 items-center justify-between pt-6">
                  <span className="font-label text-primary text-lg font-bold">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </span>

                  <Link
                    href={`/products/${product.id}`}
                    className="bg-primary font-display rounded px-4 py-2 text-[10px] font-bold text-white uppercase transition-opacity hover:opacity-90"
                  >
                    {t("products.buy_now_cta")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
