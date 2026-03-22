import {
  Header,
  HeroSection,
  CategoriesSection,
  PromotionsSection,
  ProductsSection,
  NewsSection,
  TrustSignalsSection,
  Footer,
} from "@/features/home/components";

export default function Home() {
  return (
    <div className="selection:bg-primary/20 min-h-screen">
      <Header />
      <main className="pt-20">
        <HeroSection />
        <CategoriesSection />
        <PromotionsSection />
        <ProductsSection />
        <NewsSection />
        <TrustSignalsSection />
      </main>
      <Footer />
    </div>
  );
}
