"use server";

import { cookies } from "next/headers";

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  const cookieNames = [
    "adminAccessToken",
    "adminRefreshToken",
    "adminUser",
    "accessToken",
    "refreshToken",
    "user",
  ];

  for (const name of cookieNames) {
    cookieStore.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return { success: true };
}
