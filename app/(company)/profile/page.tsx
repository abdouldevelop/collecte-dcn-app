import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";
import { formatDate } from "@/lib/utils";
import { Building2, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";

export const metadata: Metadata = { title: "Mon Profil — Collecte DCN" };

export default async function ProfilePage() {
  const session = await requireCompanySession();

  const company = await prisma.company.findUnique({
    where: { id: session.id },
    select: {
      id: true, name: true, email: true, rccm: true, ncc: true,
      phone: true, address: true, sector: true, createdAt: true,
    },
  });

  if (!company) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Mon Profil</h1>
        <p className="text-[#6B7280] text-sm mt-1">Informations de votre entreprise.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#496559] rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-lg font-bold text-[#1F2937]">{company.name}</h2>
            <p className="text-sm text-[#6B7280] mt-1">{company.email}</p>
          </div>

          <div className="mt-6 space-y-3 border-t border-[#E5E7EB] pt-4">
            {[
              { icon: Mail, label: "Email", value: company.email },
              { icon: Phone, label: "Téléphone", value: company.phone ?? "—" },
              { icon: MapPin, label: "Adresse", value: company.address ?? "—" },
              { icon: Briefcase, label: "Secteur", value: company.sector ?? "—" },
              { icon: Calendar, label: "Membre depuis", value: formatDate(company.createdAt) },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#9CA3AF]">{item.label}</p>
                  <p className="text-sm text-[#1F2937] font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {(company.rccm || company.ncc) && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-2">
              {company.rccm && (
                <div>
                  <p className="text-xs text-[#9CA3AF]">RCCM</p>
                  <p className="text-sm text-[#1F2937] font-mono">{company.rccm}</p>
                </div>
              )}
              {company.ncc && (
                <div>
                  <p className="text-xs text-[#9CA3AF]">NCC</p>
                  <p className="text-sm text-[#1F2937] font-mono">{company.ncc}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
          <h3 className="text-base font-semibold text-[#1F2937] mb-6">Modifier les informations</h3>
          <ProfileForm
            initial={{
              phone: company.phone ?? "",
              address: company.address ?? "",
              sector: company.sector ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
