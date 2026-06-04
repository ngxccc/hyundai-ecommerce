import { type Resolver, type FieldErrors, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";

function translateFieldErrors(errors: FieldErrors<FieldValues>, t: (key: never) => string): void {
  for (const key in errors) {
    const error = errors[key];
    if (!error) continue;
    if (typeof error.message === "string") {
      const msg = error.message;
      if (msg.includes(".") || msg.startsWith("validation") || msg.startsWith("shippingBids")) {
        error.message = t(msg as never);
      }
    } else if (typeof error === "object") {
      translateFieldErrors(error as FieldErrors<FieldValues>, t);
    }
  }
}

export function translatedZodResolver<TFieldValues extends FieldValues = FieldValues>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<TFieldValues, any, any>,
  t: (key: never) => string,
): Resolver<TFieldValues> {
  const baseResolver = zodResolver(schema);
  return async (values, context, options) => {
    const result = await baseResolver(values, context, options);
    if (result.errors) {
      translateFieldErrors(result.errors, t);
    }
    return result;
  };
}
