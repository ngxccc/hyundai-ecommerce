"use client";

import { useSearchParams } from "next/navigation";
import { LoginFormInner } from "./login-form";

/**
 * Wrapper component that handles useSearchParams safely
 * This component can be wrapped in Suspense at the page level
 */
export const LoginFormWithSearchParams = () => {
  const searchParams = useSearchParams();

  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = rawCallbackUrl?.startsWith("/")
    ? rawCallbackUrl
    : "/dashboard";

  return <LoginFormInner callbackUrl={callbackUrl} />;
};
