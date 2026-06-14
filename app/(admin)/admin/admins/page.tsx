import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminsClient } from "./AdminsClient";

export const metadata: Metadata = { title: "Administrateurs — Admin DCN" };

export default async function AdminsPage() {
  const session = await requireAdminSession();
  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return <AdminsClient currentAdminId={session.id} initialAdmins={admins} />;
}
