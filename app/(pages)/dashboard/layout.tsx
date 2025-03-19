import { ReactNode } from "react";
import DashboardNavigation from "./_components/dashboard-navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardNavigation>{children}</DashboardNavigation>;
}
