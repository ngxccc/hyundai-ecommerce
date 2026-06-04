import { env } from "@/env";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const validateUploadedFile = (
  file: unknown,
): { valid: boolean; error?: "fileTooLarge" | "invalidMimeType" } => {
  if (!(file instanceof File)) {
    return { valid: true };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "fileTooLarge" };
  }
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "invalidMimeType" };
  }
  return { valid: true };
};

export const uploadToCloudinary = async (
  item: File | string,
  folder: string,
): Promise<string | null> => {
  try {
    if (item instanceof File) {
      // File size limit validation (max 10MB)
      if (item.size > 10 * 1024 * 1024) {
        return null;
      }

      // File MIME-type validation (images only)
      if (!item.type.startsWith("image/")) {
        return null;
      }

      const buffer = Buffer.from(await item.arrayBuffer());

      const { promise, resolve, reject } = Promise.withResolvers<{ secure_url: string }>();
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error) reject(new Error(error.message));
          else if (result) resolve(result);
          else reject(new Error("Upload failed"));
        })
        .end(buffer);

      const result = await promise;
      return result.secure_url;
    }

    if (typeof item === "string" && !item.includes("cloudinary.com")) {
      const result = await cloudinary.uploader.upload(item, {
        folder,
      });
      return result.secure_url;
    }

    // Already a Cloudinary URL or invalid format
    if (typeof item === "string" && item.includes("cloudinary.com")) {
      return item;
    }

    return null;
  } catch (error) {
    console.error("[Cloudinary Service Upload Error]", error);
    return null;
  }
};

export const getPublicIdFromUrl = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("cloudinary.com")) return null;

  try {
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;

    const nextSegment = parts[uploadIndex + 1];
    if (!nextSegment) return null;
    const startIndex = /^v\d+$/.test(nextSegment)
      ? uploadIndex + 2
      : uploadIndex + 1;

    const publicIdWithExtension = parts.slice(startIndex).join("/");
    return publicIdWithExtension.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

export const deleteFromCloudinary = async (
  url: string,
  expectedFolder?: string,
): Promise<boolean> => {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;

    // Path traversal / folder mismatch protection
    if (expectedFolder) {
      if (!publicId.startsWith(`${expectedFolder}/`)) {
        console.warn(`Folder mismatch for Cloudinary deletion. Expected: ${expectedFolder}, got publicId: ${publicId}`);
        return false;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await cloudinary.uploader.destroy(publicId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return result.result === "ok";
  } catch (error) {
    console.error("[Cloudinary Service Delete Error]", error);
    return false;
  }
};
