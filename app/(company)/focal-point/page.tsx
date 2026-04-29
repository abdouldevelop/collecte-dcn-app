import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FocalPointForm } from "./FocalPointForm";

export const metadata: Metadata = { title: "Point Focal — Collecte DCN" };

export default async function FocalPointPage() {
  const session = await requireCompanySession();

  const focalPoint = await prisma.focalPoint.findUnique({
    where: { companyId: session.id },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Point Focal</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Le point focal est la personne de contact pour les déclarations statistiques.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-8 max-w-2xl">
        <FocalPointForm
          initial={
            focalPoint
              ? {
                  firstName: focalPoint.firstName,
                  lastName: focalPoint.lastName,
                  email: focalPoint.email,
                  phone: focalPoint.phone ?? "",
                  position: focalPoint.position ?? "",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
