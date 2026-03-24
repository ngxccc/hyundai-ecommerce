import { Link } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";
import type { Product, ApiResponse } from "@/shared/types/common";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/ui/card";

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${siteConfig.url}/api/products`, {
      next: { revalidate: 3600 }, // Dùng ISR thay vì no-store để tối ưu hiệu năng
    });

    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    const result = (await res.json()) as ApiResponse<Product[]>;
    return result.data;
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return [];
  }
};

const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export async function ProductsSection() {
  const t = await getTranslations("HomePage.products");
  const products = await fetchProducts();

  if (!products.length) return null;

  return (
    <section className="bg-background pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 text-center md:text-left">
          <h2 className="font-display text-foreground text-4xl font-extrabold tracking-tighter md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-2 font-sans text-sm tracking-widest uppercase">
            {t("subtitle")}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:border-primary/50 flex h-full flex-col gap-4 overflow-hidden py-0 transition-all hover:shadow-xl"
            >
              {/* Vùng Ảnh */}
              <CardHeader className="relative aspect-4/3 w-full p-0">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <Badge className="absolute top-4 left-4 z-10 rounded-sm bg-black/70 px-3 py-1 text-white backdrop-blur-md hover:bg-black/70">
                  Model: {product.model}
                </Badge>
              </CardHeader>

              {/* Vùng Nội dung */}
              <CardContent className="flex grow flex-col gap-2">
                <h3 className="font-display line-clamp-2 text-2xl leading-tight font-bold">
                  {product.name}
                </h3>

                {/* Specs List */}
                <div className="flex flex-wrap gap-2">
                  {product.specs.map((spec) => (
                    <Badge
                      variant="secondary"
                      key={`${product.id}-${spec}`}
                      className="rounded-sm text-[13px] font-semibold"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              {/* Vùng Giá & Nút (Đẩy xuống đáy) */}
              <CardFooter className="bg-muted/20 mt-auto flex items-center justify-between border-t p-6">
                <span className="text-primary text-xl font-bold">
                  {priceFormatter.format(product.price)}
                </span>

                <Button
                  asChild
                  size="lg"
                  className="font-bold tracking-wider uppercase"
                >
                  <Link href={`/products/${product.id}`}>
                    {t("buy_now_cta")}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
