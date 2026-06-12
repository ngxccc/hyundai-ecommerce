"use client";

import { CategoryCard } from "./category-card";
import type { TCategory } from "@nhatnang/database/schemas";

interface CategoryGridProps {
  categories: TCategory[];
  allCategories?: TCategory[];
}

export const CategoryGrid = ({ categories, allCategories = [] }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => {
        const parentName = category.parentId 
          ? allCategories.find((c) => c.id === category.parentId)?.nameVi 
          : undefined;
          
        return (
          <CategoryCard 
            key={category.id} 
            category={category} 
            parentName={parentName} 
          />
        );
      })}
    </div>
  );
};
