import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { DeclarationStatusBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Card";
import Link from "next/link";
import {
  FileInput, FileOutput, Package, Users, History,
  AlertTriangle, CheckCircle2, Clock, Bell,
} from "lucide-react";

export const metadata: Metadata = { title: "Tableau de bord — Collecte DCN" };

async function getDashboardData(companyId: string) {
  const period = await prisma.period.findFirst({ where: { isActive: true } });

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      focalPoint: true,
      companyProducts: { include: { product: true } },
      notifications: {
        where: { isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!company) return null;

  let importDeclaration = null;
  let exportDeclaration = null;
  if (period) {
    importDeclaration = await prisma.importDeclaration.findUnique({
      where: { companyId_periodId: { companyId, periodId: period.id } },
      include: { lines: true },
    });
    exportDeclaration = await prisma.exportDeclaration.findUnique({
      where: { companyId_periodId: { companyId, periodId: period.id } },
      include: { lines: true },
    });
  }

  const importProducts = company.companyProducts.filter(
    (cp) => cp.product.type === "IMPORT" || cp.product.type === "IMPORT_EXPORT"
  );
  const exportProducts = company.companyProducts.filter(
    (cp) => cp.product.type === "EXPORT" || cp.product.type === "IMPORT_EXPORT"
  );

  const history = await prisma.period.findMany({
    where: { isActive: false },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 3,
    include: {
      importDeclarations: { where: { companyId } },
      exportDeclarations: { where: { companyId } },
    },
  });

  return {
    company,
    period,
    importDeclaration,
    exportDeclaration,
    importProducts,
    exportProducts,
    history,
  };
}

export default async function DashboardPage() {
  const session = await requireCompanySession();
  const data = await getDashboardData(session.id);
  if (!data) redirect("/login");

  const { company, period, importDeclaration, exportDeclaration, importProducts, exportProducts, history } = data;
  const daysLeft = period?.dueDate ? getDaysRemaining(period.dueDate) : null;

  const importFilledLines = importDeclaration?.lines.filter(
    (l) => l.quantity !== null || l.priceMin !== null
  ).length ?? 0;
  const exportFilledLines = exportDeclaration?.lines.filter(
    (l) => l.quantity !== null || l.priceMin !== null
  ).length ?? 0;

  const allSubmitted =
    importDeclaration?.status === "SUBMITTED" &&
    exportDeclaration?.status === "SUBMITTED";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Tableau de bord</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {period ? `Période active : ${period.label}` : "Aucune période active"}
          </p>
        </div>
        {period?.dueDate && (
          <div
            className={`text-right px-4 py-2 rounded-xl text-sm font-medium ${
              daysLeft !== null && daysLeft <= 0
                ? "bg-[#DC2626]/10 text-[#DC2626]"
                : daysLeft !== null && daysLeft <= 5
                ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                : "bg-[#496559]/10 text-[#496559]"
            }`}
          >
            <p className="font-bold text-lg">
              {daysLeft !== null && daysLeft <= 0 ? "En retard" : `${daysLeft}j restants`}
            </p>
            <p className="text-xs opacity-70">Échéance : {formatDate(period.dueDate)}</p>
          </div>
        )}
      </div>

      {/* Alert: all submitted */}
      {allSubmitted && (
        <div className="flex items-center gap-3 p-4 bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
          <p className="text-sm text-[#16A34A] font-medium">
            Excellent ! Vos déclarations Import et Export ont été soumises avec succès.
          </p>
        </div>
      )}

      {/* Alert: no focal point */}
      {!company.focalPoint && (
        <div className="flex items-center justify-between p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            <p className="text-sm text-[#F59E0B] font-medium">
              Aucun point focal défini. Veuillez désigner votre point focal.
            </p>
          </div>
          <Link
            href="/focal-point"
            className="text-sm font-semibold text-[#F59E0B] hover:underline shrink-0 ml-4"
          >
            Configurer →
          </Link>
        </div>
      )}

      {/* Alert: no products */}
      {company.companyProducts.length === 0 && (
        <div className="flex items-center justify-between p-4 bg-[#496559]/10 border border-[#496559]/20 rounded-xl">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-[#496559]" />
            <p className="text-sm text-[#496559] font-medium">
              Aucun produit dans votre catalogue. Consultez la liste des produits disponibles.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-[#496559] hover:underline shrink-0 ml-4"
          >
            Voir produits →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Produits Import"
          value={importProducts.length}
          subtitle="Dans votre catalogue"
          icon={<FileInput className="w-5 h-5" />}
          color="primary"
        />
        <StatCard
          title="Produits Export"
          value={exportProducts.length}
          subtitle="Dans votre catalogue"
          icon={<FileOutput className="w-5 h-5" />}
          color="success"
        />
        <StatCard
          title="Lignes Import renseignées"
          value={`${importFilledLines}/${importProducts.length}`}
          subtitle={importDeclaration?.status ?? "NON_STARTED"}
          icon={<FileInput className="w-5 h-5" />}
          color={importDeclaration?.status === "SUBMITTED" ? "success" : "warning"}
        />
        <StatCard
          title="Lignes Export renseignées"
          value={`${exportFilledLines}/${exportProducts.length}`}
          subtitle={exportDeclaration?.status ?? "NON_STARTED"}
          icon={<FileOutput className="w-5 h-5" />}
          color={exportDeclaration?.status === "SUBMITTED" ? "success" : "warning"}
        />
      </div>

      {/* Declaration cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Import card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#496559]/10 rounded-xl flex items-center justify-center">
                <FileInput className="w-5 h-5 text-[#496559]" />
              </div>
              <div>
                <p className="font-semibold text-[#1F2937]">Déclaration Import</p>
                <p className="text-xs text-[#9CA3AF]">{period?.label ?? "—"}</p>
              </div>
            </div>
            <DeclarationStatusBadge status={importDeclaration?.status ?? "NOT_STARTED"} />
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Produits à déclarer</span>
              <span className="font-medium text-[#1F2937]">{importProducts.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Lignes renseignées</span>
              <span className="font-medium text-[#1F2937]">{importFilledLines}</span>
            </div>
          </div>
          <Link href="/declarations/import">
            <button className="w-full bg-[#496559] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#324d42] transition-colors">
              {importDeclaration?.status === "SUBMITTED" ? "Voir la déclaration" : "Renseigner Import"}
            </button>
          </Link>
        </div>

        {/* Export card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f39221]/10 rounded-xl flex items-center justify-center">
                <FileOutput className="w-5 h-5 text-[#f39221]" />
              </div>
              <div>
                <p className="font-semibold text-[#1F2937]">Déclaration Export</p>
                <p className="text-xs text-[#9CA3AF]">{period?.label ?? "—"}</p>
              </div>
            </div>
            <DeclarationStatusBadge status={exportDeclaration?.status ?? "NOT_STARTED"} />
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Produits à déclarer</span>
              <span className="font-medium text-[#1F2937]">{exportProducts.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Lignes renseignées</span>
              <span className="font-medium text-[#1F2937]">{exportFilledLines}</span>
            </div>
          </div>
          <Link href="/declarations/export">
            <button className="w-full bg-[#f39221] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#e08219] transition-colors">
              {exportDeclaration?.status === "SUBMITTED" ? "Voir la déclaration" : "Renseigner Export"}
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
          <h3 className="font-semibold text-[#1F2937] mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/declarations/import", icon: FileInput, label: "Import", color: "text-[#496559]", bg: "bg-[#496559]/8" },
              { href: "/declarations/export", icon: FileOutput, label: "Export", color: "text-[#f39221]", bg: "bg-[#f39221]/8" },
              { href: "/products", icon: Package, label: "Produits", color: "text-[#6B7280]", bg: "bg-[#6B7280]/8" },
              { href: "/focal-point", icon: Users, label: "Point Focal", color: "text-[#496559]", bg: "bg-[#496559]/8" },
              { href: "/history", icon: History, label: "Historique", color: "text-[#6B7280]", bg: "bg-[#6B7280]/8" },
              { href: "/support", icon: Bell, label: "Support", color: "text-[#6B7280]", bg: "bg-[#6B7280]/8" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-[#F8F9FA] border border-transparent hover:border-[#E5E7EB] transition-all text-sm font-medium text-[#1F2937]"
              >
                <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent history */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1F2937]">Historique récent</h3>
            <Link href="/history" className="text-xs text-[#496559] font-semibold hover:underline">
              Tout voir →
            </Link>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF] text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Aucun historique disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{p.label}</p>
                    <div className="flex gap-2 mt-1">
                      <DeclarationStatusBadge
                        status={p.importDeclarations[0]?.status ?? "NOT_STARTED"}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <DeclarationStatusBadge
                      status={p.exportDeclarations[0]?.status ?? "NOT_STARTED"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {company.notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
          <h3 className="font-semibold text-[#1F2937] mb-4">Notifications</h3>
          <div className="space-y-2">
            {company.notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 bg-[#496559]/5 rounded-xl">
                <Bell className="w-4 h-4 text-[#496559] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#1F2937]">{n.title}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
