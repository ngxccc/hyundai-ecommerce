import { Link } from "@/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { ApiResponse, PromoCampaign } from "@/shared/types/common";
import { siteConfig } from "@/shared/config/site";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";

const THEME_STYLES: Record<
  string,
  { bg: string; text: string; decoration: string }
> = {
  primary: {
    bg: "from-primary to-primary/80 text-primary-foreground",
    text: "text-primary-foreground",
    decoration: "bg-primary-foreground/10",
  },
  secondary: {
    bg: "from-secondary to-secondary/80 text-secondary-foreground",
    text: "text-secondary-foreground",
    decoration: "bg-secondary-foreground/10",
  },
};

async function getActivePromos(): Promise<PromoCampaign[] | null> {
  try {
    const res = await fetch(`${siteConfig.url}/api/promotions`, {
      next: { revalidate: 3600 }, // Cập nhật cache mỗi 1 tiếng
    });

    if (!res.ok) return null;
    const result = (await res.json()) as ApiResponse<PromoCampaign[]>;
    return result.data;
  } catch (error) {
    console.error("Failed to fetch promo:", error);
    return null;
  }
}

export async function PromotionsSection() {
  const promos = await getActivePromos();

  if (!promos?.length) return null;

  return (
    <section className="py-2" aria-labelledby="promo-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {promos.map((promo) => {
              const theme =
                THEME_STYLES[promo.themeColor] ?? THEME_STYLES.primary;

              return (
                <CarouselItem key={promo.id}>
                  <div
                    className={`relative flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-linear-to-r p-8 md:flex-row md:p-12 ${theme?.bg}`}
                  >
                    {/* Background blob */}
                    <div
                      className={`pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full blur-3xl ${theme?.decoration}`}
                      aria-hidden="true"
                    />

                    {/* 📦 Cột Trái */}
                    <div className="relative z-10 text-center md:text-left">
                      <Badge
                        variant="outline"
                        className={`mb-4 border-current px-4 py-1 text-sm uppercase ${theme?.text}`}
                      >
                        {promo.badge}
                      </Badge>
                      <h2 className="font-display mb-4 text-4xl leading-12 font-black md:text-5xl md:leading-16">
                        {promo.title}
                        <br />
                        {promo.subtitle}
                      </h2>
                      <p
                        className={`max-w-md font-sans text-base opacity-90 md:text-lg ${theme?.text}`}
                      >
                        {promo.description}
                      </p>
                    </div>

                    {/* 🎯 Cột Phải */}
                    <div className="relative z-10 mt-8 flex flex-col items-center md:mt-0 md:items-end">
                      <div className="font-display text-destructive mb-4 text-7xl leading-none font-black tracking-tighter md:text-8xl">
                        {promo.discount}
                      </div>
                      <Button
                        asChild
                        variant="secondary"
                        className="font-display rounded-lg px-8 py-4 text-sm font-bold tracking-widest uppercase shadow-lg md:px-10 md:py-6"
                      >
                        <Link href={promo.ctaLink}>{promo.ctaText}</Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Nút điều hướng (Chỉ hiện trên màn hình lớn) */}
          <div className="hidden md:block">
            <CarouselPrevious className="absolute top-1/2 -left-12" />
            <CarouselNext className="absolute top-1/2 -right-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
