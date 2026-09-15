"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImagePlaceholder } from "./product-image-placeholder";
import { cn } from "@/lib/utils";
import { cloudinaryLoader, isCloudinaryUrl } from "@/lib/cloudinary.utils";

interface ImageWithSkeletonProps extends ImageProps {
  skeletonClassName?: string;
  fallback?: React.ReactNode;
}

export function ImageWithSkeleton({
  src,
  alt,
  className,
  skeletonClassName,
  onLoad,
  width,
  height,
  fill,
  sizes,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const styleWidth = typeof width === "number" ? `${width}px` : width;
  const styleHeight = typeof height === "number" ? `${height}px` : height;
  const srcString = typeof src === "string" ? src : "";
  const isCld = isCloudinaryUrl(srcString);
  const selectedLoader = props.loader ?? (isCld ? cloudinaryLoader : undefined);

  if (hasError) {
    return (
      <div
        className={cn(fill ? "absolute inset-0" : "relative inline-block")}
        style={!fill ? { width: styleWidth, height: styleHeight } : undefined}
      >
        {props.fallback ?? <ProductImagePlaceholder showText />}
      </div>
    );
  }

  return (
    <div
      className={cn(fill ? "absolute inset-0" : "relative inline-block")}
      style={!fill ? { width: styleWidth, height: styleHeight } : undefined}
    >
      {isLoading && (
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
        src={src}
        alt={alt}
        loader={selectedLoader}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className,
        )}
        onLoad={(e) => {
          setIsLoading(false);
          onLoad?.(e);
        }}
        onError={(e) => {
          setIsLoading(false);
          setHasError(true);
          props.onError?.(e);
        }}
      />
    </div>
  );
}
