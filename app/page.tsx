import { redirect } from "next/navigation";
import { getCompanySession } from "@/lib/auth";

export default async function Home() {
  const session = await getCompanySession();
  if (session) {
    redirect("/dashboard");
  }
  redirect("/login");
}
