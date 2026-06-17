import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockFindMany,
  mockUpdate,
  mockDelete,
  mockReturning,
  mockSelectResolvedValue,
} from "../../tests/utils/db-mock";
import { DbAddressService } from "./address.service";
import type { IDatabase } from "../../client";
import type { TUserAddress } from "../../schemas";

const addressService = new DbAddressService(mockDb as unknown as IDatabase);

describe("AddressService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getByUserId()", () => {
    test("should return all addresses for a user ordered by isDefault and createdAt", async () => {
      const mockAddresses = [
        {
          id: "addr-1",
          userId: "user-1",
          receiverName: "User 1",
          isDefault: true,
        },
        {
          id: "addr-2",
          userId: "user-1",
          receiverName: "User 2",
          isDefault: false,
        },
      ] as TUserAddress[];

      mockFindMany.mockResolvedValueOnce(mockAddresses);

      const result = await addressService.getByUserId("user-1");

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAddresses);
    });
  });

  describe("create()", () => {
    test("should set isDefault to true if it is the user's first address", async () => {
      // First select returns empty array (no existing addresses)
      mockSelectResolvedValue.mockResolvedValueOnce([]);
      const mockNewAddress = {
        id: "addr-1",
        userId: "user-1",
        receiverName: "User 1",
        phoneNumber: "0900000000",
        streetAddress: "123 Street",
        district: "District 1",
        city: "HCM",
        isDefault: true,
      } as TUserAddress;

      mockReturning.mockResolvedValueOnce([mockNewAddress]); // insert returns the new address

      const result = await addressService.create({
        userId: "user-1",
        receiverName: "User 1",
        phoneNumber: "0900000000",
        streetAddress: "123 Street",
        district: "District 1",
        city: "HCM",
        isDefault: false,
      });

      expect(result.isDefault).toBe(true);
    });

    test("should reset other defaults if the new address is set to default", async () => {
      // First select returns existing address
      const existingAddress = {
        id: "addr-existing",
        userId: "user-1",
        isDefault: true,
      };
      mockSelectResolvedValue.mockResolvedValueOnce([existingAddress]);

      mockSelectResolvedValue.mockResolvedValueOnce([]); // consumed by tx.update() resetting defaults

      const mockNewAddress = {
        id: "addr-2",
        userId: "user-1",
        receiverName: "User 2",
        isDefault: true,
      } as TUserAddress;

      mockReturning.mockResolvedValueOnce([mockNewAddress]);

      const result = await addressService.create({
        userId: "user-1",
        receiverName: "User 2",
        phoneNumber: "0900000000",
        streetAddress: "456 Street",
        district: "District 2",
        city: "HCM",
        isDefault: true,
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1); // Reset defaults
      expect(result.isDefault).toBe(true);
    });
  });

  describe("update()", () => {
    test("should update address and return updated values", async () => {
      const existingAddress = {
        id: "addr-1",
        userId: "user-1",
        isDefault: false,
      };
      mockSelectResolvedValue.mockResolvedValueOnce([existingAddress]); // select check

      const updatedAddress = {
        id: "addr-1",
        userId: "user-1",
        receiverName: "Updated Name",
      };
      mockReturning.mockResolvedValueOnce([updatedAddress]); // update check

      const result = await addressService.update("addr-1", "user-1", {
        receiverName: "Updated Name",
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(result.receiverName).toBe("Updated Name");
    });

    test("should throw error if address does not exist or does not belong to user", () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]); // select returns empty

      expect(
        addressService.update("addr-not-exists", "user-1", {
          receiverName: "Updated Name",
        }),
      ).rejects.toThrow("errors.addressNotFound");
    });
  });

  describe("delete()", () => {
    test("should delete address and return true", async () => {
      const existingAddress = {
        id: "addr-1",
        userId: "user-1",
        isDefault: false,
      };
      mockSelectResolvedValue.mockResolvedValueOnce([existingAddress]); // select check

      mockSelectResolvedValue.mockResolvedValueOnce([]); // consumed by tx.delete()

      const result = await addressService.delete("addr-1", "user-1");

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    test("should promote another address to default if the deleted address was default", async () => {
      const existingAddress = {
        id: "addr-1",
        userId: "user-1",
        isDefault: true,
      };
      mockSelectResolvedValue.mockResolvedValueOnce([existingAddress]); // select check

      mockSelectResolvedValue.mockResolvedValueOnce([]); // consumed by tx.delete()

      const nextAddress = { id: "addr-2", userId: "user-1", isDefault: false };
      mockSelectResolvedValue.mockResolvedValueOnce([nextAddress]); // select next address

      const result = await addressService.delete("addr-1", "user-1");

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledTimes(1); // Set next address as default
      expect(result).toBe(true);
    });

    test("should throw errors.addressNotFound if address does not exist to delete", () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]); // select check

      expect(
        addressService.delete("addr-not-exists", "user-1"),
      ).rejects.toThrow("errors.addressNotFound");
    });
  });

  describe("setDefault()", () => {
    test("should set address as default and reset others", async () => {
      const existingAddress = {
        id: "addr-1",
        userId: "user-1",
        isDefault: false,
      };
      mockSelectResolvedValue.mockResolvedValueOnce([existingAddress]); // select check

      mockSelectResolvedValue.mockResolvedValueOnce([]); // consumed by tx.update() resetting defaults

      const updatedAddress = {
        id: "addr-1",
        userId: "user-1",
        isDefault: true,
      };
      mockReturning.mockResolvedValueOnce([updatedAddress]); // update check

      await addressService.setDefault("addr-1", "user-1");

      expect(mockUpdate).toHaveBeenCalledTimes(2); // reset others + set this as default
    });

    test("should do nothing if the address is already default", async () => {
      const existingAddress = {
        id: "addr-1",
        userId: "user-1",
        isDefault: true,
      };
      mockSelectResolvedValue.mockResolvedValueOnce([existingAddress]); // select check

      await addressService.setDefault("addr-1", "user-1");

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    test("should throw error if address does not exist to set default", () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]); // select check

      expect(
        addressService.setDefault("addr-not-exists", "user-1"),
      ).rejects.toThrow("errors.addressNotFound");
    });
  });
});
