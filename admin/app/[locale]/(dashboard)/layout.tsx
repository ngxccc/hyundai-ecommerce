import { isInternalStaff } from "@/lib/rbac";
import { Suspense } from "react";
import { AdminSidebar } from "@/features/dashboard/components/admin-sidebar";
import { getCachedSession } from "@/lib/session";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Suspense fallback={null}>
        <AdminSidebarSlot />
      </Suspense>
      <SidebarInset className="bg-background">
        <header className="border-border/60 bg-background/95 sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-y-auto p-1 md:p-2 lg:p-4">
          <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function AdminSidebarSlot() {
  const session = await getCachedSession();
  if (!session) return null;

  if (!isInternalStaff(session.user.role)) return null;

  return <AdminSidebar user={session.user} />;
}
