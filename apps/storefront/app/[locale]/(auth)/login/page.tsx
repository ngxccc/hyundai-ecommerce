import { Suspense } from "react";
import { LoginFormWithSearchParams } from "@/features/auth/components/login-form-with-search-params";

const LoginLoadingFallback = () => (
  <div className="flex h-64 w-full max-w-md items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
    <div className="text-muted-foreground text-center text-sm">Loading...</div>
  </div>
);

const LoginPage = () => {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <Suspense fallback={<LoginLoadingFallback />}>
        <LoginFormWithSearchParams />
      </Suspense>
    </div>
  );
};

export default LoginPage;
