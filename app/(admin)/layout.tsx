import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AppShell } from "@/components/layout/AppShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AppShell sidebar={<AdminSidebar
        adminName={`${session.firstName} ${session.lastName}`}
        adminEmail={session.email}
        role={session.role}
      />}>
      {children}
    </AppShell>
  );
}
