"use client";

import { BrandCard } from "./brand-card";
import type { TBrand } from "@nhatnang/database/schemas";

interface BrandGridProps {
  brands: TBrand[];
}

export const BrandGrid = ({ brands }: BrandGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
};
