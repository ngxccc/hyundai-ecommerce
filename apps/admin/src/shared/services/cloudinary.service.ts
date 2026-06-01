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
  folder = "products",
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
