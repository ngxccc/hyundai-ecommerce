/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach, type Mock } from "bun:test";
import { getPublicIdFromUrl, deleteFromCloudinary } from "./cloudinary.service";
import { v2 as cloudinary } from "cloudinary";

await vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn(),
      upload: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

describe("Cloudinary Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPublicIdFromUrl", () => {
    test("extracts public_id correctly from standard url", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v1234567890/products/my-image.jpg";
      expect(getPublicIdFromUrl(url)).toBe("products/my-image");
    });

    test("extracts public_id correctly from url without version", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/products/another-image.png";
      expect(getPublicIdFromUrl(url)).toBe("products/another-image");
    });

    test("returns null for non-cloudinary urls", () => {
      expect(getPublicIdFromUrl("https://example.com/image.jpg")).toBeNull();
      expect(getPublicIdFromUrl("")).toBeNull();
      // @ts-expect-error - testing invalid input
      expect(getPublicIdFromUrl(null)).toBeNull();
    });

    test("handles deep nested folders", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v123/a/b/c/d.webp";
      expect(getPublicIdFromUrl(url)).toBe("a/b/c/d");
    });
  });

  describe("deleteFromCloudinary", () => {
    test("returns false if url is invalid", async () => {
      const result = await deleteFromCloudinary("https://example.com/img.png");
      expect(result).toBe(false);
      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    test("calls cloudinary destroy and returns true on success", async () => {
      (
        cloudinary.uploader.destroy as unknown as Mock<(...args: any[]) => any>
      ).mockResolvedValueOnce({ result: "ok" });

      const result = await deleteFromCloudinary(
        "https://res.cloudinary.com/demo/image/upload/v123/products/img.jpg",
      );

      expect(result).toBe(true);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("products/img");
    });

    test("returns false on API failure", async () => {
      (
        cloudinary.uploader.destroy as unknown as Mock<(...args: any[]) => any>
      ).mockRejectedValueOnce(new Error("API Error"));

      const result = await deleteFromCloudinary(
        "https://res.cloudinary.com/demo/image/upload/v123/products/img.jpg",
      );

      expect(result).toBe(false);
    });
  });
});
