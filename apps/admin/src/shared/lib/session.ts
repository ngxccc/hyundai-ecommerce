import { cache } from "react";
import { auth } from "@nhatnang/database/auth";
import { headers } from "next/headers";

export const getCachedSession = cache(async () => {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    return null;
  }
});
