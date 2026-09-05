"use client";

import { BrandCard } from "./brand-card";
import type { AdminBrand } from "@/types/api";

interface BrandGridProps {
  brands: AdminBrand[];
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
