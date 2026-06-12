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
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <Skeleton
          className={cn(
            "absolute inset-0 z-10 h-full w-full rounded-none",
            skeletonClassName
          )}
        />
      )}
      {/* eslint-disable-next-line no-restricted-syntax */}
      <Image
        src={src}
        alt={alt}
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
