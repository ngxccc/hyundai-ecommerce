import { cache } from "react";
import { auth } from "@nhatnang/database/auth";
import { headers } from "next/headers";
import { connection } from "next/server";

export const getCachedSession = cache(async () => {
  // connection() signals to Next.js PPR that this function requires a live
  // request context. Without it, the static prerender phase calls headers()
  // with no request, causing it to throw and pollute the build log.
  await connection();
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.warn("Get cached session error: ", error);
    return null;
  }
});
