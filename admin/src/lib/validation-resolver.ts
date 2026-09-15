import {
  type Resolver,
  type FieldErrors,
  type FieldValues,
  type ResolverResult,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { translateZodMessage, type I18nTranslator } from "./i18n-zod";

function translateFieldErrors(
  errors: FieldErrors<FieldValues>,
  t: I18nTranslator,
): void {
  for (const key in errors) {
    const error = errors[key];
    if (!error) continue;
    if (typeof error.message === "string") {
      error.message = translateZodMessage(error.message, t);
    } else if (typeof error === "object") {
      translateFieldErrors(error as FieldErrors<FieldValues>, t);
    }
  }
}

export function translatedZodResolver<
  TFieldValues extends FieldValues = FieldValues,
>(schema: z.ZodType<TFieldValues>, t: I18nTranslator): Resolver<TFieldValues> {
  const baseResolver = zodResolver(schema as never);
  return async (values, context, options) => {
    const result = (await baseResolver(
      values,
      context,
      options as never,
    )) as ResolverResult<TFieldValues>;

    if (Object.keys(result.errors).length > 0) {
      translateFieldErrors(result.errors, t);
    }
    return result;
  };
}
