"use client";

import { CldImage as NextCldImage, type CldImageProps } from "next-cloudinary";

export function CldImage(props: CldImageProps) {
  return <NextCldImage {...props} />;
}
