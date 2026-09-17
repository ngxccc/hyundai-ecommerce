import { AdminSidebar } from "@/features/dashboard/components/admin-sidebar";
import { getCachedSession } from "@/lib/session";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCachedSession();
  const allowedRoles = ["ADMIN", "SALES"];
  const isAdmin =
    session?.user.role && allowedRoles.includes(session.user.role);

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {isAdmin && <AdminSidebar user={session.user} />}
      <SidebarInset className="bg-background">
        <header className="border-border/60 bg-background/95 sticky top-0 z-100 flex h-12 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-y-auto p-1 md:p-2 lg:p-4">
          <div className="flex w-full flex-1 flex-col">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
