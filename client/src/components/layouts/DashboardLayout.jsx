"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/components/topbar/Topbar";

const PAGE_TITLES = {
  "/employee/dashboard": "Dashboard",
  "/employee/profile": "Profile",
  "/employee/events": "Events",
  "/employee/surveys": "Surveys",
  "/employee/notifications": "Notifications",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/create-account": "Create Employee Account",
  "/hr/dashboard": "HR Dashboard",
  "/hr-operations/dashboard": "HR Operations Dashboard",
  "/compliance/dashboard": "Compliance Dashboard",
};

export default function DashboardLayout({ title, children }) {
  const pathname = usePathname();
  const pageTitle = title || PAGE_TITLES[pathname] || "Employee Workspace";

  return (
    <div className="grid-shell min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex min-h-screen flex-col">
        <Topbar title={pageTitle} />
        <main className="flex-1 p-5 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
