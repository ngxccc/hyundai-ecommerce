"use client";

import {
  OffsetPagination,
  type OffsetPaginationProps,
} from "@/shared/components/offset-pagination";

export type ProductPaginationProps = OffsetPaginationProps;

export const ProductPagination = (props: ProductPaginationProps) => {
  return <OffsetPagination label="sản phẩm" {...props} />;
};
