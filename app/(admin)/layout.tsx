import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <AdminSidebar
        adminName={`${session.firstName} ${session.lastName}`}
        adminEmail={session.email}
        role={session.role}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
