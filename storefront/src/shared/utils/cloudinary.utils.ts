/**
 * Checks if an image URL is hosted on Cloudinary CDN.
 */
export const isCloudinaryUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "res.cloudinary.com" ||
      parsed.hostname === "cloudinary.com" ||
      parsed.hostname.endsWith(".cloudinary.com")
    );
  } catch {
    return false;
  }
};

/**
 * Next.js Image loader that injects Cloudinary dynamic transformations
 * (f_auto: automatic AVIF/WebP format, q_auto: automatic perceptual quality, w_<width>: responsive resizing)
 * directly at Cloudinary CDN edges without loading through the Next.js server.
 */
export const cloudinaryLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string => {
  if (!src) return "";
  if (!isCloudinaryUrl(src)) {
    return src;
  }

  const uploadIndex = src.indexOf("/upload/");
  if (uploadIndex === -1) {
    return src;
  }

  const prefix = src.slice(0, uploadIndex + "/upload/".length);
  const suffix = src.slice(uploadIndex + "/upload/".length);

  // If already contains transformation params, do not duplicate
  if (
    suffix.startsWith("f_auto") ||
    suffix.includes(",w_") ||
    suffix.startsWith("w_")
  ) {
    return src;
  }

  const q = quality ? `q_${quality}` : "q_auto";
  const params = ["f_auto", q, `w_${width}`].join(",");

  return `${prefix}${params}/${suffix}`;
};
