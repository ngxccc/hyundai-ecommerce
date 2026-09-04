import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phoneNumber?: string | null;
  creditLimit?: string;
  currentDebt?: string;
  companyName?: string | null;
  taxId?: string | null;
}

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

    const parsedUser = JSON.parse(
      decodeURIComponent(userCookie),
    ) as SessionUser;
    return {
      user: parsedUser,
      accessToken: token,
    };
  } catch (error) {
    console.warn("Get cached session error: ", error);
    return null;
  }
});
