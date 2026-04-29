import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SupportClient } from "./SupportClient";

export const metadata: Metadata = { title: "Support — Collecte DCN" };

export default async function SupportPage() {
  const session = await requireCompanySession();

  const tickets = await prisma.supportTicket.findMany({
    where: { companyId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return <SupportClient tickets={tickets} />;
}
