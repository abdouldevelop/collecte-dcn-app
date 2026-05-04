import { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, Mail, Phone, MapPin, Users, Package, FileText, ArrowLeft } from "lucide-react";
import { Badge, DeclarationStatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Fiche Entreprise — Admin DCN" };

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      focalPoints: { where: { isActive: true }, take: 1 },
      companyProducts: {
        include: { product: true },
        where: { isActive: true },
        orderBy: { product: { code: "asc" } },
      },
      importDeclarations: {
        include: { period: true, _count: { select: { lines: true } } },
        orderBy: { period: { year: "desc" } },
        take: 5,
      },
      exportDeclarations: {
        include: { period: true, _count: { select: { lines: true } } },
        orderBy: { period: { year: "desc" } },
        take: 5,
      },
      supportTickets: { orderBy: { createdAt: "desc" }, take: 5 },
      invitation: true,
    },
  });

  if (!company) notFound();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/companies" className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#E5E7EB] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">{company.name}</h1>
          <p className="text-[#6B7280] text-sm mt-0.5">Fiche entreprise détaillée</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={company.isActive ? "success" : "danger"}>
            {company.isActive ? "Actif" : "Inactif"}
          </Badge>
          {!company.isOnboarded && <Badge variant="warning">Non inscrit</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#496559] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-[#1F2937]">{company.name}</p>
                <p className="text-xs text-[#9CA3AF]">Membre depuis {formatDate(company.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: Mail, label: "Email", value: company.email },
                { icon: Phone, label: "Téléphone", value: company.phone ?? "—" },
                { icon: MapPin, label: "Adresse", value: company.address ?? "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#9CA3AF]">{item.label}</p>
                    <p className="text-sm text-[#1F2937]">{item.value}</p>
                  </div>
                </div>
              ))}
              {company.rccm && (
                <div><p className="text-xs text-[#9CA3AF]">RCCM</p><p className="text-sm font-mono text-[#1F2937]">{company.rccm}</p></div>
              )}
              {company.ncc && (
                <div><p className="text-xs text-[#9CA3AF]">NCC</p><p className="text-sm font-mono text-[#1F2937]">{company.ncc}</p></div>
              )}
            </div>
          </div>

          {/* Focal point */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#496559]" />
              <h3 className="font-semibold text-[#1F2937]">Point Focal</h3>
            </div>
            {company.focalPoints?.[0] ? (
              <div className="space-y-2">
                <p className="font-medium text-[#1F2937]">{company.focalPoints[0].firstName} {company.focalPoints[0].lastName}</p>
                <p className="text-sm text-[#6B7280]">{company.focalPoints[0].email}</p>
                {company.focalPoints[0].phone && <p className="text-sm text-[#6B7280]">{company.focalPoints[0].phone}</p>}
                {company.focalPoints[0].position && <p className="text-sm text-[#9CA3AF] italic">{company.focalPoints[0].position}</p>}
              </div>
            ) : (
              <Badge variant="warning">Non défini</Badge>
            )}
          </div>
        </div>

        {/* Products and declarations */}
        <div className="lg:col-span-2 space-y-4">
          {/* Declarations history */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#496559]" />
              <h3 className="font-semibold text-[#1F2937]">Historique des Déclarations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F1F3F5]">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase">Période</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase">Import</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase">Export</th>
                  </tr>
                </thead>
                <tbody>
                  {company.importDeclarations.map((imp) => {
                    const exp = company.exportDeclarations.find((e) => e.periodId === imp.periodId);
                    return (
                      <tr key={imp.id} className="border-t border-[#E9ECEF] hover:bg-[#F8F9FA]">
                        <td className="px-3 py-2 text-sm font-medium text-[#1F2937]">{imp.period.label}</td>
                        <td className="px-3 py-2"><DeclarationStatusBadge status={imp.status} /></td>
                        <td className="px-3 py-2"><DeclarationStatusBadge status={exp?.status ?? "NOT_STARTED"} /></td>
                      </tr>
                    );
                  })}
                  {company.importDeclarations.length === 0 && (
                    <tr><td colSpan={3} className="px-3 py-6 text-center text-sm text-[#9CA3AF]">Aucune déclaration</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#496559]" />
                <h3 className="font-semibold text-[#1F2937]">Produits ({company.companyProducts.length})</h3>
              </div>
            </div>
            {company.companyProducts.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">Aucun produit dans le catalogue</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F1F3F5]">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase">Code</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase">Désignation</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase">Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.companyProducts.slice(0, 10).map((cp) => (
                      <tr key={cp.id} className="border-t border-[#E9ECEF] hover:bg-[#F8F9FA]">
                        <td className="px-3 py-2 text-sm font-mono text-[#496559] font-semibold">{cp.product.code}</td>
                        <td className="px-3 py-2 text-sm text-[#1F2937]">{cp.product.designation}</td>
                        <td className="px-3 py-2"><Badge variant={cp.product.type === "IMPORT_EXPORT" ? "accent" : cp.product.type === "IMPORT" ? "info" : "success"}>{cp.product.type}</Badge></td>
                        <td className="px-3 py-2"><Badge variant={cp.product.source === "ADMIN" ? "info" : "neutral"}>{cp.product.source}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {company.companyProducts.length > 10 && (
                  <p className="text-xs text-[#9CA3AF] px-3 py-2">Et {company.companyProducts.length - 10} autre(s)...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
