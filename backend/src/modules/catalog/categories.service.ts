import { Inject, Injectable } from "@nestjs/common";
import {
  I18nBadRequestException,
  I18nConflictException,
  I18nNotFoundException,
} from "@/common/exceptions";
import { asc, eq } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { categories, type Category } from "@/database/schemas";
import type { CreateCategoryDto } from "./dto/create-category.dto";
import type { UpdateCategoryDto } from "./dto/update-category.dto";
import type { CategoryResponseDto } from "./dto/category-response.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Retrieves all active categories ordered by Vietnamese name.
   */
  async findAll(): Promise<CategoryResponseDto[]> {
    const records = await this.db
      .select()
      .from(categories)
      .orderBy(asc(categories.nameVi));

    return records.map((r) => this.mapCategoryToDto(r));
  }

  /**
   * Builds and returns a recursive hierarchical category tree.
   */
  async getTree(): Promise<CategoryResponseDto[]> {
    const records = await this.db
      .select()
      .from(categories)
      .orderBy(asc(categories.nameVi));

    const categoryMap = new Map<string, CategoryResponseDto>();
    for (const r of records) {
      const dto = this.mapCategoryToDto(r);
      dto.children = [];
      categoryMap.set(r.id, dto);
    }

    const roots: CategoryResponseDto[] = [];
    for (const r of records) {
      const node = categoryMap.get(r.id);
      if (!node) {
        continue;
      }

      if (r.parentId) {
        const parent = categoryMap.get(r.parentId);
        if (parent) {
          parent.children = parent.children ?? [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Retrieves a single category by its UUID.
   */
  async findById(id: string): Promise<CategoryResponseDto> {
    const [record] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!record) {
      throw new I18nNotFoundException("catalog.CATEGORY_NOT_FOUND", { id });
    }
    return this.mapCategoryToDto(record);
  }

  /**
   * Creates a new category.
   */
  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const [existingSlug] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, dto.slug))
      .limit(1);

    if (existingSlug) {
      throw new I18nConflictException("catalog.CATEGORY_SLUG_EXISTS", {
        slug: dto.slug,
      });
    }

    if (dto.parentId) {
      const [parent] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, dto.parentId))
        .limit(1);

      if (!parent) {
        throw new I18nBadRequestException("catalog.CATEGORY_NOT_FOUND", {
          id: dto.parentId,
        });
      }
    }

    const [newCategory] = await this.db
      .insert(categories)
      .values({
        nameVi: dto.nameVi,
        nameEn: dto.nameEn ?? null,
        slug: dto.slug,
        parentId: dto.parentId ?? null,
        descriptionVi: dto.descriptionVi ?? null,
        descriptionEn: dto.descriptionEn ?? null,
        image: dto.image ?? null,
        isActive: dto.isActive,
      })
      .returning();

    if (!newCategory) {
      throw new I18nBadRequestException("catalog.CATEGORY_CREATE_FAILED");
    }

    return this.mapCategoryToDto(newCategory);
  }

  /**
   * Updates an existing category by ID.
   */
  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const [existing] = await this.db
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (!existing) {
      throw new I18nNotFoundException("catalog.CATEGORY_NOT_FOUND", { id });
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, dto.slug))
        .limit(1);

      if (slugConflict) {
        throw new I18nConflictException("catalog.CATEGORY_SLUG_EXISTS", {
          slug: dto.slug,
        });
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new I18nBadRequestException("catalog.CATEGORY_SELF_PARENT");
      }
      if (dto.parentId !== null) {
        const [parent] = await this.db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, dto.parentId))
          .limit(1);

        if (!parent) {
          throw new I18nBadRequestException("catalog.CATEGORY_NOT_FOUND", {
            id: dto.parentId,
          });
        }
      }
    }

    const [updated] = await this.db
      .update(categories)
      .set({
        ...(dto.nameVi !== undefined ? { nameVi: dto.nameVi } : {}),
        ...(dto.nameEn !== undefined ? { nameEn: dto.nameEn } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
        ...(dto.descriptionVi !== undefined
          ? { descriptionVi: dto.descriptionVi }
          : {}),
        ...(dto.descriptionEn !== undefined
          ? { descriptionEn: dto.descriptionEn }
          : {}),
        ...(dto.image !== undefined ? { image: dto.image } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      throw new I18nNotFoundException("catalog.CATEGORY_NOT_FOUND", { id });
    }

    return this.mapCategoryToDto(updated);
  }

  /**
   * Deletes a category by ID.
   */
  async delete(id: string): Promise<void> {
    const [existing] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      throw new I18nNotFoundException("catalog.CATEGORY_NOT_FOUND", { id });
    }

    await this.db.delete(categories).where(eq(categories.id, id));
  }

  private mapCategoryToDto(record: Category): CategoryResponseDto {
    return {
      id: record.id,
      nameVi: record.nameVi,
      nameEn: record.nameEn,
      slug: record.slug,
      parentId: record.parentId,
      descriptionVi: record.descriptionVi,
      descriptionEn: record.descriptionEn,
      image: record.image,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
