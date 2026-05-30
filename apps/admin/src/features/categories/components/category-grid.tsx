"use client";

import { CategoryCard } from "./category-card";
import type { TCategory } from "@nhatnang/database/schemas";

interface CategoryGridProps {
  categories: TCategory[];
}

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
};
