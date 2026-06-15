import { AdminSidebar } from "@/features/dashboard/components/admin-sidebar";
import { getCachedSession } from "@/shared/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCachedSession();
  const allowedRoles = ["SUPER_ADMIN", "SALES_REPRESENTATIVE", "ACCOUNTANT", "WAREHOUSE_MANAGER"];
  const isAdmin = session?.user?.role && allowedRoles.includes(session.user.role);

  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden font-sans">
      {isAdmin && <AdminSidebar />}
      <main className="bg-background relative flex h-screen flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full flex-1 flex-col pb-4">
          {children}
        </div>
      </main>
    </div>
  );
}
