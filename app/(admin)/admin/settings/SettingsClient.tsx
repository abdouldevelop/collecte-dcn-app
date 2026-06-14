"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Settings as SettingsIcon,
  CalendarDays,
  User,
  Shield,
  Database,
  Building2,
  Package,
  Ruler,
  TrendingUp,
  Plus,
  Power,
  Trash2,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import {
  periodCreateSchema,
  adminProfileSchema,
  type PeriodCreateInput,
  type AdminProfileInput,
} from "@/validators";

interface PeriodRow {
  id: string;
  year: number;
  month: number;
  label: string;
  isActive: boolean;
  dueDate: string | null;
  declarationsCount: number;
}

interface SessionInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Stats {
  companiesCount: number;
  productsCount: number;
  unitsCount: number;
  periodsCount: number;
}

const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

type Tab = "periods" | "profile" | "security" | "references";

export function SettingsClient({
  session,
  initialPeriods,
  stats,
}: {
  session: SessionInfo;
  initialPeriods: PeriodRow[];
  stats: Stats;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("periods");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#496559]/10 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-[#496559]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Paramètres système</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Configuration de la plateforme — réservé au Super Admin.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-1 inline-flex flex-wrap gap-1">
        {[
          { id: "periods" as const, icon: CalendarDays, label: "Périodes & cycles" },
          { id: "profile" as const, icon: User, label: "Mon profil" },
          { id: "security" as const, icon: Shield, label: "Sécurité" },
          { id: "references" as const, icon: Database, label: "Référentiels" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-[#496559] text-white"
                : "text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#1F2937]"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "periods" && (
        <PeriodsTab initialPeriods={initialPeriods} onChange={() => router.refresh()} />
      )}
      {tab === "profile" && <ProfileTab session={session} onChange={() => router.refresh()} />}
      {tab === "security" && <SecurityTab />}
      {tab === "references" && <ReferencesTab stats={stats} />}
    </div>
  );
}

/* ---------------- Periods tab ---------------- */

function PeriodsTab({
  initialPeriods,
  onChange,
}: {
  initialPeriods: PeriodRow[];
  onChange: () => void;
}) {
  const [periods, setPeriods] = useState(initialPeriods);
  const [openCreate, setOpenCreate] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PeriodCreateInput>({
    resolver: zodResolver(periodCreateSchema),
    defaultValues: { year: defaultYear, month: defaultMonth },
  });

  const onCreate = async (data: PeriodCreateInput) => {
    setSubmitting(true);
    setServerError("");
    try {
      const payload: Record<string, unknown> = {
        year: Number(data.year),
        month: Number(data.month),
      };
      if (data.label) payload.label = data.label;
      if (data.dueDate) payload.dueDate = new Date(data.dueDate).toISOString();
      if (data.isActive) payload.isActive = true;

      const res = await fetch("/api/admin/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error ?? "Impossible de créer la période");
        return;
      }
      setPeriods((prev) =>
        [
          {
            ...json.data,
            dueDate: json.data.dueDate ?? null,
            declarationsCount: 0,
          },
          ...prev.map((p) => (json.data.isActive ? { ...p, isActive: false } : p)),
        ].sort((a, b) => (b.year - a.year) * 100 + (b.month - a.month))
      );
      reset({ year: defaultYear, month: defaultMonth });
      setOpenCreate(false);
      onChange();
    } catch {
      setServerError("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  const activate = async (p: PeriodRow) => {
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/periods/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPeriods((prev) =>
          prev.map((x) => {
            if (x.id === p.id) return { ...x, isActive: json.data.isActive };
            // If activating, others become inactive
            if (json.data.isActive) return { ...x, isActive: false };
            return x;
          })
        );
        onChange();
      }
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: PeriodRow) => {
    if (p.declarationsCount > 0) return;
    if (!confirm(`Supprimer la période « ${p.label} » ?`)) return;
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/periods/${p.id}`, { method: "DELETE" });
      if (res.ok) {
        setPeriods((prev) => prev.filter((x) => x.id !== p.id));
        onChange();
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-[#1F2937] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#496559]" />
              Périodes de collecte
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Activez la période courante pour ouvrir les déclarations Import / Export aux entreprises.
            </p>
          </div>
          <Button onClick={() => setOpenCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle période
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        {periods.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-[#6B7280] text-sm">Aucune période configurée.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <tr className="text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Date limite</th>
                <th className="px-4 py-3">Déclarations</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8F9FA]/50">
                  <td className="px-4 py-3 font-medium text-[#1F2937]">{p.label}</td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {p.dueDate ? formatDate(new Date(p.dueDate)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{p.declarationsCount}</td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="neutral">Fermée</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1 justify-end">
                      <button
                        onClick={() => activate(p)}
                        disabled={busyId === p.id}
                        title={p.isActive ? "Désactiver" : "Activer"}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937] transition-colors disabled:opacity-40"
                      >
                        {p.isActive ? <Power className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => remove(p)}
                        disabled={busyId === p.id || p.declarationsCount > 0}
                        title={
                          p.declarationsCount > 0
                            ? "Suppression impossible (déclarations existantes)"
                            : "Supprimer"
                        }
                        className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setServerError("");
          reset({ year: defaultYear, month: defaultMonth });
        }}
        title="Nouvelle période"
        description="Créez une période de collecte mensuelle."
      >
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4" noValidate>
          {serverError && (
            <div className="flex items-start gap-2.5 p-3 bg-[#DC2626]/8 border border-[#DC2626]/20 rounded-xl text-sm text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Année</label>
              <input
                type="number"
                {...register("year", { valueAsNumber: true })}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
              />
              {errors.year && <p className="mt-1 text-xs text-[#DC2626]">{errors.year.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Mois</label>
              <select
                {...register("month", { valueAsNumber: true })}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
              >
                {MONTH_LABELS.map((label, i) => (
                  <option key={label} value={i + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
              Date limite de soumission <span className="text-[#9CA3AF] font-normal">(optionnel)</span>
            </label>
            <input
              type="datetime-local"
              {...register("dueDate")}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isActive")}
              className="w-4 h-4 rounded border-[#E5E7EB] text-[#496559] focus:ring-[#496559]/20"
            />
            <span className="text-sm text-[#1F2937]">
              Activer cette période immédiatement
              <span className="block text-xs text-[#6B7280]">
                Les autres périodes actives seront automatiquement désactivées.
              </span>
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setOpenCreate(false);
                setServerError("");
                reset({ year: defaultYear, month: defaultMonth });
              }}
            >
              Annuler
            </Button>
            <Button type="submit" loading={submitting} className="flex-1">
              Créer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ---------------- Profile tab ---------------- */

function ProfileTab({ session, onChange }: { session: SessionInfo; onChange: () => void }) {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<AdminProfileInput>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
    },
  });

  const newPwd = watch("newPassword");

  const onSubmit = async (data: AdminProfileInput) => {
    setSubmitting(true);
    setServerError("");
    setSuccess("");
    try {
      const payload: Record<string, unknown> = {};
      if (data.firstName && data.firstName !== session.firstName) payload.firstName = data.firstName;
      if (data.lastName && data.lastName !== session.lastName) payload.lastName = data.lastName;
      if (data.email && data.email !== session.email) payload.email = data.email;
      if (data.newPassword) {
        payload.newPassword = data.newPassword;
        payload.currentPassword = data.currentPassword;
      }

      if (Object.keys(payload).length === 0) {
        setSuccess("Aucune modification à enregistrer.");
        return;
      }

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error ?? "Mise à jour impossible");
        return;
      }
      setSuccess("Profil mis à jour avec succès.");
      reset({
        firstName: json.data.firstName,
        lastName: json.data.lastName,
        email: json.data.email,
        currentPassword: "",
        newPassword: "",
      });
      onChange();
    } catch {
      setServerError("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#1F2937] flex items-center gap-2">
            <User className="w-4 h-4 text-[#496559]" />
            Informations personnelles
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Mettez à jour votre identité et votre adresse de contact.
          </p>
        </div>

        {serverError && (
          <div className="flex items-start gap-2.5 p-3 bg-[#DC2626]/8 border border-[#DC2626]/20 rounded-xl text-sm text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 p-3 bg-[#16A34A]/8 border border-[#16A34A]/20 rounded-xl text-sm text-[#16A34A]">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Prénom</label>
            <input
              {...register("firstName")}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            />
            {errors.firstName && <p className="mt-1 text-xs text-[#DC2626]">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Nom</label>
            <input
              {...register("lastName")}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            />
            {errors.lastName && <p className="mt-1 text-xs text-[#DC2626]">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
          />
          {errors.email && <p className="mt-1 text-xs text-[#DC2626]">{errors.email.message}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#1F2937] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#496559]" />
            Changer de mot de passe
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Laissez vide pour conserver le mot de passe actuel.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Mot de passe actuel</label>
          <input
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Nouveau mot de passe</label>
          <input
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
          />
          <p className="mt-1 text-xs text-[#9CA3AF]">Min. 8 caractères, une majuscule et un chiffre.</p>
          {errors.newPassword && <p className="mt-1 text-xs text-[#DC2626]">{errors.newPassword.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={submitting}
          disabled={!isDirty && !newPwd}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}

/* ---------------- Security tab ---------------- */

function SecurityTab() {
  const policies = [
    { label: "Longueur minimale", value: "8 caractères" },
    { label: "Caractères requis", value: "1 majuscule + 1 chiffre" },
    { label: "Hashage", value: "bcrypt (12 rounds)" },
    { label: "Durée de session", value: "8 heures" },
    { label: "Limite de tentatives", value: "5 / 15 minutes / email" },
    { label: "Cookie", value: "HttpOnly · SameSite=Lax" },
  ];

  const audits = [
    "Connexions et déconnexions (admin et entreprise)",
    "Création, mise à jour et suppression de comptes admin",
    "Création et activation des périodes",
    "Soumission, modification et exports de déclarations",
    "Envoi et annulation d'invitations entreprises",
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <h2 className="text-base font-semibold text-[#1F2937] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#496559]" />
          Politique en vigueur
        </h2>
        <p className="text-sm text-[#6B7280] mt-1 mb-4">
          Paramètres figés dans la configuration applicative.
        </p>
        <dl className="space-y-2.5 text-sm">
          {policies.map((p) => (
            <div
              key={p.label}
              className="flex justify-between items-center py-2 border-b border-[#F3F4F6] last:border-0"
            >
              <dt className="text-[#6B7280]">{p.label}</dt>
              <dd className="text-[#1F2937] font-medium">{p.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <h2 className="text-base font-semibold text-[#1F2937] flex items-center gap-2">
          <Database className="w-4 h-4 text-[#496559]" />
          Audit log
        </h2>
        <p className="text-sm text-[#6B7280] mt-1 mb-4">
          Les actions sensibles sont automatiquement enregistrées dans la base de données.
        </p>
        <ul className="space-y-2 text-sm">
          {audits.map((a) => (
            <li key={a} className="flex items-start gap-2 text-[#1F2937]">
              <Check className="w-4 h-4 text-[#16A34A] mt-0.5 shrink-0" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- References tab ---------------- */

function ReferencesTab({ stats }: { stats: Stats }) {
  const cards = useMemo(
    () => [
      {
        icon: Building2,
        title: "Entreprises",
        description: "Gérer les sociétés inscrites, leurs accès et leurs déclarations.",
        count: stats.companiesCount,
        href: "/admin/companies",
        cta: "Ouvrir la gestion",
      },
      {
        icon: Package,
        title: "Produits",
        description: "Importer les nomenclatures et catalogues de produits.",
        count: stats.productsCount,
        href: "/admin/declarations",
        cta: "Voir les déclarations",
      },
      {
        icon: Ruler,
        title: "Unités",
        description: "Référentiel des unités de mesure utilisées dans les déclarations.",
        count: stats.unitsCount,
        href: "/admin/declarations",
        cta: "Voir les déclarations",
      },
      {
        icon: TrendingUp,
        title: "Taux de change",
        description: "Mettre à jour les parités utilisées pour les conversions.",
        count: null,
        href: "/admin/exchange-rates",
        cta: "Gérer les taux",
      },
      {
        icon: CalendarDays,
        title: "Périodes",
        description: "Configurer les cycles déclaratifs depuis l'onglet précédent.",
        count: stats.periodsCount,
        href: null,
        cta: null,
      },
    ],
    [stats]
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#F8F9FA] flex items-center justify-center">
              <c.icon className="w-4 h-4 text-[#496559]" />
            </div>
            {c.count !== null && (
              <span className="text-xs font-semibold text-[#1F2937] bg-[#F8F9FA] px-2 py-1 rounded">
                {c.count}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[#1F2937]">{c.title}</h3>
          <p className="text-xs text-[#6B7280] mt-1 leading-relaxed flex-1">{c.description}</p>
          {c.href && c.cta && (
            <Link
              href={c.href}
              className="mt-4 text-xs font-semibold text-[#496559] hover:underline inline-flex items-center gap-1"
            >
              {c.cta} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
