import { LoginForm } from "@/features/auth/components/login-form";

const LoginPage = () => {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
