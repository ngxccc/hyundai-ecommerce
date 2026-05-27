import {
  type TAuthErrorCode,
  type TSystemErrorCode,
} from "@nhatnang/shared/constants";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export type TAuthActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; code: TAuthErrorCode | TSystemErrorCode; error?: string };

export type IAuthErrorMessageMap = Record<string, string>;

export interface IAuthFormSectionProps<
  TForm extends FieldValues = FieldValues,
> {
  form: UseFormReturn<TForm>;
  isLoading?: boolean;
  disabled?: boolean;
}
