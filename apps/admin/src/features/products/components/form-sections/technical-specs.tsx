import type { UseFormReturn } from "react-hook-form";
import { type TNewProduct } from "@nhatnang/database/schemas";
import { ElectricalSpecs } from "./specs/electrical-specs";
import { EngineSpecs } from "./specs/engine-specs";
import { DimensionSpecs } from "./specs/dimension-specs";

interface ProductTechnicalSpecsProps {
  form: UseFormReturn<TNewProduct>;
}

export const ProductTechnicalSpecs = ({ form }: ProductTechnicalSpecsProps) => {
  return (
    <>
      <ElectricalSpecs form={form} />
      <EngineSpecs form={form} />
      <DimensionSpecs form={form} />
    </>
  );
};
