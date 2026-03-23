import DashboardShell from "@/components/dashboard/DashboardShell";

// Prevent prerendering for all dashboard pages
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}