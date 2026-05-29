import type { UseFormReturn } from "react-hook-form";
import { ElectricalSpecs } from "./specs/electrical-specs";
import { EngineSpecs } from "./specs/engine-specs";
import { DimensionSpecs } from "./specs/dimension-specs";
import type { TCreateProductInput } from "@nhatnang/database/validators";

interface ProductTechnicalSpecsProps {
  form: UseFormReturn<TCreateProductInput>;
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
