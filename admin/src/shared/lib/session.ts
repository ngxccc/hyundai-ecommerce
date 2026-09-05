import { cache } from "react";
import { cookies } from "next/headers";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AdminSession {
  user: AdminUser;
  accessToken: string;
}

export function parseSessionFromCookieStore(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): AdminSession | null {
  try {
    const token =
      cookieStore.get("adminAccessToken")?.value ??
      cookieStore.get("accessToken")?.value;
    const userCookie =
      cookieStore.get("adminUser")?.value ?? cookieStore.get("user")?.value;

    if (!token || !userCookie) {
      return null;
    }

    const user = JSON.parse(decodeURIComponent(userCookie)) as AdminUser;
    return {
      user,
      accessToken: token,
    };
  } catch {
    return null;
  }
}

export const getCachedSession = cache(
  async (): Promise<AdminSession | null> => {
    try {
      const cookieStore = await cookies();
      return parseSessionFromCookieStore(cookieStore);
    } catch (error) {
      console.warn("Get cached admin session error: ", error);
      return null;
    }
  },
);
