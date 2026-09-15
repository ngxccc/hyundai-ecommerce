import { cache } from "react";
import { cookies } from "next/headers";
import { z } from "zod";

const adminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

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

    const rawUser: unknown = JSON.parse(decodeURIComponent(userCookie));
    const parsed = adminUserSchema.safeParse(rawUser);
    if (!parsed.success) {
      return null;
    }
    return {
      user: parsed.data,
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
