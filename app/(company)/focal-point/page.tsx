import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FocalPointForm from "./FocalPointForm";

export const metadata: Metadata = { title: "Points Focaux — Collecte DCN" };

export default async function FocalPointPage() {
  const session = await requireCompanySession();

  const rawFocalPoints = await prisma.focalPoint.findMany({
    where: { companyId: session.id, isActive: true },
    include: { invitation: { select: { status: true, expiresAt: true } } },
    orderBy: { createdAt: "asc" },
  });

  const focalPoints = rawFocalPoints.map((fp) => ({
    ...fp,
    invitation: fp.invitation
      ? { ...fp.invitation, expiresAt: fp.invitation.expiresAt.toISOString() }
      : fp.invitation,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-8">
        <FocalPointForm initialFocalPoints={focalPoints} />
      </div>
    </div>
  );
}
