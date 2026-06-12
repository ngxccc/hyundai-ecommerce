"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
import { cn } from "@nhatnang/ui/lib/utils";

interface ImageWithSkeletonProps extends ImageProps {
  skeletonClassName?: string;
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

  const styleWidth = typeof width === "number" ? `${width}px` : width;
  const styleHeight = typeof height === "number" ? `${height}px` : height;

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
            skeletonClassName
          )}
          style={!fill ? { width: styleWidth, height: styleHeight } : undefined}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width!}
        height={height!}
        fill={fill!}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={(e) => {
          setIsLoading(false);
          onLoad?.(e);
        }}
        {...props}
      />
    </div>
  );
}
