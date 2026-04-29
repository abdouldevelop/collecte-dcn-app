import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileInput, FileOutput, ArrowRight } from "lucide-react";
import { DeclarationStatusBadge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Déclarations — Collecte DCN" };

export default async function DeclarationsHubPage() {
  const session = await requireCompanySession();
  const period = await prisma.period.findFirst({ where: { isActive: true } });

  let importStatus = "NOT_STARTED";
  let exportStatus = "NOT_STARTED";

  if (period) {
    const [imp, exp] = await Promise.all([
      prisma.importDeclaration.findUnique({
        where: { companyId_periodId: { companyId: session.id, periodId: period.id } },
        select: { status: true },
      }),
      prisma.exportDeclaration.findUnique({
        where: { companyId_periodId: { companyId: session.id, periodId: period.id } },
        select: { status: true },
      }),
    ]);
    if (imp) importStatus = imp.status;
    if (exp) exportStatus = exp.status;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Hub Déclarations</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {period ? `Période : ${period.label}` : "Aucune période active"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            type: "import",
            href: "/declarations/import",
            icon: FileInput,
            label: "Déclaration Import",
            description: "Renseignez les prix, quantités et unités pour vos produits importés.",
            status: importStatus,
            color: "#496559",
            bg: "bg-[#496559]/8",
          },
          {
            type: "export",
            href: "/declarations/export",
            icon: FileOutput,
            label: "Déclaration Export",
            description: "Renseignez les prix, quantités et unités pour vos produits exportés.",
            status: exportStatus,
            color: "#f39221",
            bg: "bg-[#f39221]/8",
          },
        ].map((d) => (
          <Link
            key={d.type}
            href={d.href}
            className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${d.bg} rounded-xl flex items-center justify-center`}>
                <d.icon className="w-6 h-6" style={{ color: d.color }} />
              </div>
              <DeclarationStatusBadge status={d.status} />
            </div>
            <h2 className="text-lg font-bold text-[#1F2937] mb-1">{d.label}</h2>
            <p className="text-sm text-[#6B7280] mb-4">{d.description}</p>
            <div
              className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
              style={{ color: d.color }}
            >
              {d.status === "SUBMITTED" ? "Voir la déclaration" : "Renseigner maintenant"}
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
