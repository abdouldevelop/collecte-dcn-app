import { redirect } from "next/navigation";
import { getCompanySession, getAdminSession } from "@/lib/auth";

export default async function Home() {
  const adminSession = await getAdminSession();
  if (adminSession) {
    redirect("/admin/dashboard");
  }
  const companySession = await getCompanySession();
  if (companySession) {
    redirect("/dashboard");
  }
  redirect("/login");
}
