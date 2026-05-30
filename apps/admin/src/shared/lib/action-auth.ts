import { getCachedSession } from "./session";

export const requireAuth = async () => {
  const session = await getCachedSession();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  
  return session;
};
