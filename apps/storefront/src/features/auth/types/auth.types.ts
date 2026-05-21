import type { FieldValues, UseFormReturn } from "react-hook-form";

export interface IAuthFormSectionProps<TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
}

export interface IAuthActionSuccess {
  success: true;
}

export interface IAuthActionFailure<TField extends string = string> {
  success: false;
  errorCode?: string;
  fieldErrors?: Partial<Record<TField, string[]>>;
}

export type TAuthActionResult<TField extends string = string> =
  | IAuthActionSuccess
  | IAuthActionFailure<TField>;

export interface IAuthErrorMessageMap {
  [errorCode: string]: string;
}
