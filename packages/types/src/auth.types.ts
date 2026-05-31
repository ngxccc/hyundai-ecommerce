import type { FieldValues, UseFormReturn } from "react-hook-form";

export interface IAuthFormSectionProps<
  TForm extends FieldValues = FieldValues,
> {
  form: UseFormReturn<TForm>;
  isLoading?: boolean;
  disabled?: boolean;
}
