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

export const isCloudinaryConfigured = (): boolean => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return Boolean(
    cloudName && cloudName !== "dummy-cloud" && cloudName.trim().length > 0,
  );
};

export const canUseCldImage = (url: string | null | undefined): boolean => {
  return isCloudinaryConfigured() && isCloudinaryUrl(url);
};
