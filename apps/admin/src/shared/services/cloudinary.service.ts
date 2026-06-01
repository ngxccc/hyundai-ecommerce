import { env } from "@/env";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  item: File | string,
  folder: string,
): Promise<string | null> => {
  try {
    if (item instanceof File) {
      const buffer = Buffer.from(await item.arrayBuffer());

      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder }, (error, result) => {
              if (error) reject(new Error(error.message));
              else if (result) resolve(result);
              else reject(new Error("Upload failed"));
            })
            .end(buffer);
        },
      );

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

export const deleteFromCloudinary = async (url: string): Promise<boolean> => {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await cloudinary.uploader.destroy(publicId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return result.result === "ok";
  } catch (error) {
    console.error("[Cloudinary Service Delete Error]", error);
    return false;
  }
};
