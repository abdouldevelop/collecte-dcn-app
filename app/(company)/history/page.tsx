import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeclarationStatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { History, FileInput, FileOutput } from "lucide-react";

export const metadata: Metadata = { title: "Historique — Collecte DCN" };

export default async function HistoryPage() {
  const session = await requireCompanySession();

  const periods = await prisma.period.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      importDeclarations: {
        where: { companyId: session.id },
        select: { status: true, submittedAt: true, _count: { select: { lines: true } } },
      },
      exportDeclarations: {
        where: { companyId: session.id },
        select: { status: true, submittedAt: true, _count: { select: { lines: true } } },
      },
    },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Historique des déclarations</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Consultez toutes vos déclarations passées et leur statut.
        </p>
      </div>

      {periods.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF] bg-white rounded-2xl border border-[#E5E7EB]">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun historique disponible</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F1F3F5]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Période</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Échéance</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Import — Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Import — Soumis le</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Export — Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Export — Soumis le</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => {
                  const imp = p.importDeclarations[0];
                  const exp = p.exportDeclarations[0];
                  return (
                    <tr key={p.id} className="border-t border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">{p.label}</p>
                          {p.isActive && (
                            <span className="text-xs bg-[#496559]/12 text-[#496559] px-2 py-0.5 rounded-full font-medium">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {p.dueDate ? formatDate(p.dueDate) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <FileInput className="w-3.5 h-3.5 text-[#496559]" />
                          <DeclarationStatusBadge status={imp?.status ?? "NOT_STARTED"} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {imp?.submittedAt ? formatDate(imp.submittedAt) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <FileOutput className="w-3.5 h-3.5 text-[#f39221]" />
                          <DeclarationStatusBadge status={exp?.status ?? "NOT_STARTED"} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {exp?.submittedAt ? formatDate(exp.submittedAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
