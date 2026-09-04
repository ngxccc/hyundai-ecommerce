"use client";

import { ProductCard } from "./product-card";
import type { ProductGridList } from "../product-form-types";

interface ProductGridProps {
  products: ProductGridList;
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
