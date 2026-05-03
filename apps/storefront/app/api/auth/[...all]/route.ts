import { auth, toNextJsHandler } from "@nhatnang/database/auth";

export const { GET, POST } = toNextJsHandler(auth);
