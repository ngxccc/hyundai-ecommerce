import { promoService } from "@/shared/services/promo.service";
import { PromoCarousel } from "./PromoCarousel";

export async function PromotionsSection() {
  const promos = await promoService.getPromos();

  if (!promos?.length) return null;

  return (
    <section className="bg-background pt-14" aria-labelledby="promo-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PromoCarousel promos={promos} />
      </div>
    </section>
  );
}
