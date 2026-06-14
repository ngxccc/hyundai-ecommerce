import type { CategoryService, TCategoryWithChildren } from "../interfaces";
import { categories, type TCategory } from "../../schemas";
import { type IDatabase } from "../../client";
import { eq } from "drizzle-orm";
import type { TCreateCategoryInput, TUpdateCategoryInput } from "../../validators";
import { handleServiceError } from "../../utils";

export class DbCategoryService implements CategoryService {
  constructor(private readonly db: IDatabase) {}

  async getAll(): Promise<TCategory[]> {
    return this.db.query.categories.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getById(id: string): Promise<TCategory | undefined> {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return category;
  }

  async create(input: TCreateCategoryInput): Promise<TCategory> {
    try {
      const [newCategory] = await this.db
        .insert(categories)
        .values(input)
        .returning();
      if (!newCategory) {
        throw new Error("errors.createCategoryFailed");
      }
      return newCategory;
    } catch (error: unknown) {
      handleServiceError(error, "errors.createCategoryFailed");
    }
  }

  async update({ id, ...data }: TUpdateCategoryInput): Promise<TCategory> {
    try {
      const [updatedCategory] = await this.db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      if (!updatedCategory) {
        throw new Error("errors.categoryNotFound");
      }
      return updatedCategory;
    } catch (error: unknown) {
      handleServiceError(error, "errors.updateCategoryFailed");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error: unknown) {
      handleServiceError(error, "errors.deleteCategoryFailed");
    }
  }

  /**
   * Structures all flat categories into a hierarchical tree format in O(N) time complexity.
   * Maps parent-child relationships using an in-memory Map structure for fast lookup.
   */
  async getCategoryTree(): Promise<TCategoryWithChildren[]> {
    const allCategories = await this.getAll();
    // Map to quickly reference categories by their ID in O(1) time
    const categoryMap = new Map<string, TCategoryWithChildren>();
    const roots: TCategoryWithChildren[] = [];

    // Initialize the mapping registry with empty children arrays
    for (const cat of allCategories) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }

    // Link children node references directly under their parent node
    for (const cat of allCategories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children = parent.children ?? [];
          parent.children.push(node);
        } else {
          // Fallback to root-level if parent is not found in the dataset
          roots.push(node);
        }
      } else {
        // Root category (no parentId)
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Retrieves all descendant category IDs recursively using a Breadth-First Search (BFS) queue.
   * Avoids recursion stack overflow on deep hierarchy trees.
   */
  async getCategoryDescendants(parentId: string): Promise<string[]> {
    const allCategories = await this.getAll();

    // Build a map of parentId to immediate children categories for efficient O(1) traversal
    const childrenMap = new Map<string, typeof allCategories>();
    for (const cat of allCategories) {
      if (!cat.parentId) continue;
      if (!childrenMap.has(cat.parentId)) childrenMap.set(cat.parentId, []);
      childrenMap.get(cat.parentId)?.push(cat);
    }

    const descendants: string[] = [parentId];
    // O(1) lookup set to trace visited nodes and prevent infinite loops in cyclic dependencies
    const visited = new Set<string>([parentId]);
    const queue: string[] = [parentId];

    // Perform BFS traversal to retrieve all child levels iteratively
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = childrenMap.get(currentId) ?? [];

      for (const child of children) {
        if (!visited.has(child.id)) {
          visited.add(child.id);
          descendants.push(child.id);
          queue.push(child.id);
        }
      }
    }

    return descendants;
  }
}
