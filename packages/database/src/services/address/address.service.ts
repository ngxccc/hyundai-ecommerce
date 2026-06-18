import type { AddressService } from "../interfaces";
import { userAddresses } from "../../schemas/user-address.schema";
import type { IDatabase } from "../../client";
import { and, eq } from "drizzle-orm";
import {
  type AddressDTO,
  type CreateAddressDTO,
  type UpdateAddressDTO,
} from "../../dtos";
import { handleServiceError } from "../../utils";

export class DbAddressService implements AddressService {
  constructor(protected readonly db: IDatabase) {}

  async getByUserId(userId: string): Promise<AddressDTO[]> {
    return this.db.query.userAddresses.findMany({
      where: {
        userId,
      },
      columns: {
        id: true,
        receiverName: true,
        phoneNumber: true,
        streetAddress: true,
        district: true,
        city: true,
        isDefault: true,
      },
      orderBy: {
        isDefault: "desc",
        createdAt: "desc",
      },
    });
  }

  async create(data: CreateAddressDTO): Promise<{ id: string }> {
    try {
      // If setting as default, or if it's the first address, we should handle default state
      const existing = await this.db
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(eq(userAddresses.userId, data.userId))
        .limit(1);

      const isFirstAddress = existing.length === 0;
      const shouldBeDefault = data.isDefault ?? isFirstAddress;

      return await this.db.transaction(async (tx) => {
        if (shouldBeDefault) {
          // Reset other defaults
          await tx
            .update(userAddresses)
            .set({ isDefault: false })
            .where(eq(userAddresses.userId, data.userId));
        }

        const [result] = await tx
          .insert(userAddresses)
          .values({
            ...data,
            isDefault: shouldBeDefault,
          })
          .returning({
            id: userAddresses.id,
          });

        if (!result) {
          throw new Error("errors.createAddressFailed");
        }
        return result;
      });
    } catch (error: unknown) {
      handleServiceError(error, "errors.createAddressFailed");
    }
  }

  async update(
    id: string,
    userId: string,
    data: UpdateAddressDTO,
  ): Promise<{ id: string }> {
    try {
      return await this.db.transaction(async (tx) => {
        // 1. Verify existence
        const [existing] = await tx
          .select({ id: userAddresses.id, isDefault: userAddresses.isDefault })
          .from(userAddresses)
          .where(
            and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)),
          )
          .limit(1);
        if (!existing) {
          throw new Error("errors.addressNotFound");
        }

        // 2. Handle default status changes
        if (data.isDefault && !existing.isDefault) {
          await tx
            .update(userAddresses)
            .set({ isDefault: false })
            .where(eq(userAddresses.userId, userId));
        }

        const [result] = await tx
          .update(userAddresses)
          .set(data)
          .where(
            and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)),
          )
          .returning({
            id: userAddresses.id,
          });

        if (!result) {
          throw new Error("errors.addressNotFound");
        }
        return result;
      });
    } catch (error: unknown) {
      handleServiceError(error, "errors.updateAddressFailed");
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const [existing] = await this.db
        .select({ id: userAddresses.id, isDefault: userAddresses.isDefault })
        .from(userAddresses)
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
        .limit(1);

      if (!existing) {
        throw new Error("errors.addressNotFound");
      }

      await this.db.transaction(async (tx) => {
        await tx
          .delete(userAddresses)
          .where(
            and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)),
          );

        // If the deleted address was default, set another address as default if possible
        if (existing.isDefault) {
          const [nextAddress] = await tx
            .select({ id: userAddresses.id })
            .from(userAddresses)
            .where(eq(userAddresses.userId, userId))
            .limit(1);

          if (nextAddress) {
            await tx
              .update(userAddresses)
              .set({ isDefault: true })
              .where(eq(userAddresses.id, nextAddress.id));
          }
        }
      });

      return true;
    } catch (error: unknown) {
      handleServiceError(error, "errors.deleteAddressFailed");
    }
  }

  async setDefault(id: string, userId: string): Promise<void> {
    try {
      await this.db.transaction(async (tx) => {
        const [existing] = await tx
          .select({ id: userAddresses.id, isDefault: userAddresses.isDefault })
          .from(userAddresses)
          .where(
            and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)),
          )
          .limit(1);

        if (!existing) {
          throw new Error("errors.addressNotFound");
        }

        if (existing.isDefault) {
          return;
        }

        await tx
          .update(userAddresses)
          .set({ isDefault: false })
          .where(eq(userAddresses.userId, userId));

        const [updated] = await tx
          .update(userAddresses)
          .set({ isDefault: true })
          .where(
            and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)),
          )
          .returning({ id: userAddresses.id });

        if (!updated) {
          throw new Error("errors.addressNotFound");
        }
      });
    } catch (error: unknown) {
      handleServiceError(error, "errors.updateAddressFailed");
    }
  }
}
