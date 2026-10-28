import { redirect } from "next/navigation";
import { getCompanySession } from "@/lib/auth";
import { CompanySidebar } from "@/components/layout/CompanySidebar";
import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCompanySession();
  if (!session) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, isOnboarded: true, isActive: true },
  });

  if (!company || !company.isActive) {
    redirect("/login");
  }

  return (
    <AppShell sidebar={<CompanySidebar companyName={company.name} companyEmail={company.email} />}>
      {children}
    </AppShell>
  );
}
