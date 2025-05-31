import { AppSidebar } from "@/components/molecules/dashboard/app-sidebar";
import { SidebarInset } from "@/components/atoms/ui/sidebar";
import { SidebarProvider } from "@/components/atoms/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/molecules/dashboard/data-table";
import { ChartAreaInteractive } from "@/components/molecules/dashboard/chart-area-interactive";
import { SectionCards } from "@/components/molecules/dashboard/section-cards";
import { SiteHeader } from "@/components/molecules/dashboard/site-header";
import data from "../../public/data.json"

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    return (
        <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                      {children}
             </div>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
}
