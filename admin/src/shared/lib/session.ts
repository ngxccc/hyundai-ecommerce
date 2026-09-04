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

export const getCachedSession = cache(
  async (): Promise<AdminSession | null> => {
    try {
      const cookieStore = await cookies();
      const token =
        cookieStore.get("adminAccessToken")?.value ||
        cookieStore.get("accessToken")?.value;
      const userCookie =
        cookieStore.get("adminUser")?.value || cookieStore.get("user")?.value;

      if (!token || !userCookie) {
        return null;
      }

      const user = JSON.parse(decodeURIComponent(userCookie)) as AdminUser;
      return {
        user,
        accessToken: token,
      };
    } catch (error) {
      console.warn("Get cached admin session error: ", error);
      return null;
    }
  },
);
