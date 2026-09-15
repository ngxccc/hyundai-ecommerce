import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { z } from "zod";

const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  phoneNumber: z.string().nullish(),
  creditLimit: z.string().optional(),
  currentDebt: z.string().optional(),
  companyName: z.string().nullish(),
  taxId: z.string().nullish(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export interface Session {
  user: SessionUser;
  accessToken: string;
}

/**
 * Retrieves the current authenticated user session from HTTP cookies.
 * Signals to Next.js PPR that this function requires a live request context via connection().
 */
export const getCachedSession = cache(async (): Promise<Session | null> => {
  await connection();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const userCookie = cookieStore.get("user")?.value;

    if (!token || !userCookie) {
      return null;
    }

    const rawUser: unknown = JSON.parse(decodeURIComponent(userCookie));
    const parsed = sessionUserSchema.safeParse(rawUser);
    if (!parsed.success) {
      return null;
    }
    return {
      user: parsed.data,
      accessToken: token,
    };
  } catch (error) {
    console.warn("Get cached session error: ", error);
    return null;
  }
});
