"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImagePlaceholder } from "./product-image-placeholder";
import { cn } from "cn";
import { cloudinaryLoader, isCloudinaryUrl } from "@/lib/cloudinary.utils";

export interface ProductImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string | null;
  alt?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  showText?: boolean;
  iconClassName?: string;
  fallback?: React.ReactNode;
  wrapperClassName?: string;
}

export function ProductImage({
  src,
  alt = "",
  className,
  wrapperClassName,
  showSkeleton = true,
  skeletonClassName,
  showText = false,
  iconClassName,
  fallback,
  onLoad,
  onError,
  width,
  height,
  fill,
  sizes,
  ...props
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const styleWidth = typeof width === "number" ? `${width}px` : width;
  const styleHeight = typeof height === "number" ? `${height}px` : height;

  const validSrc =
    typeof src === "string" && src.trim().length > 0 ? src : null;

  const renderFallback = () =>
    fallback ?? (
      <ProductImagePlaceholder
        showText={showText}
        iconClassName={iconClassName}
      />
    );

  // If no source provided or failed to load, render fallback placeholder immediately
  if (!validSrc || hasError) {
    return (
      <div
        className={cn(
          fill ? "absolute inset-0" : "relative inline-block overflow-hidden",
          wrapperClassName,
        )}
        style={!fill ? { width: styleWidth, height: styleHeight } : undefined}
      >
        {renderFallback()}
      </div>
    );
  }

  const isCld = isCloudinaryUrl(validSrc);
  const selectedLoader = props.loader ?? (isCld ? cloudinaryLoader : undefined);

  return (
    <div
      className={cn(
        fill ? "absolute inset-0" : "relative inline-block overflow-hidden",
        wrapperClassName,
      )}
      style={!fill ? { width: styleWidth, height: styleHeight } : undefined}
    >
      {showSkeleton && isLoading && (
        <Skeleton
          className={cn(
            "absolute inset-0 z-10 rounded-none",
            fill ? "h-full w-full" : "",
            skeletonClassName,
          )}
          style={!fill ? { width: styleWidth, height: styleHeight } : undefined}
        />
      )}
      <Image
        src={validSrc}
        alt={alt}
        loader={selectedLoader}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          showSkeleton && isLoading ? "opacity-0" : "opacity-100",
          className,
        )}
        onLoad={(e) => {
          setIsLoading(false);
          onLoad?.(e);
        }}
        onError={(e) => {
          setIsLoading(false);
          setHasError(true);
          onError?.(e);
        }}
        {...props}
      />
    </div>
  );
}
