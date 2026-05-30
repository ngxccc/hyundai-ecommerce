import { getCachedSession } from "./session";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const requireAuth = async () => {
  const session = await getCachedSession();
  
  if (!session?.user) {
    throw new AuthError("Unauthorized");
  }
  
  if (session.user.role !== "admin") {
    throw new AuthError("Forbidden: Admin access required");
  }
  
  return session;
};
