"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImagePlaceholder } from "@/components/common";

interface ProductThumbnailProps {
  src?: string | null;
  alt: string;
}

/**
 * Isolated Client Component leaf for thumbnail image rendering with error fallback.
 */
export function ProductThumbnail({ src, alt }: ProductThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <ProductImagePlaceholder iconClassName="size-4" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className="size-full object-cover"
      sizes="40px"
      fill
      onError={() => setHasError(true)}
    />
  );
}
