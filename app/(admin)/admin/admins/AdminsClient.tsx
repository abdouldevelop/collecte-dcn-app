"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Search, Plus, AlertCircle, Trash2, Power, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { adminCreateSchema, type AdminCreateInput } from "@/validators";

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export function AdminsClient({
  currentAdminId,
  initialAdmins,
}: {
  currentAdminId: string;
  initialAdmins: Admin[];
}) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminCreateInput>({
    resolver: zodResolver(adminCreateSchema),
    defaultValues: { role: "ADMIN" },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q)
    );
  }, [admins, search]);

  const onCreate = async (data: AdminCreateInput) => {
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error ?? "Création impossible");
        return;
      }
      setAdmins((prev) => [json.data, ...prev]);
      reset({ role: "ADMIN" } as AdminCreateInput);
      setOpenCreate(false);
      router.refresh();
    } catch {
      setServerError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (admin: Admin) => {
    setBusyId(admin.id);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, isActive: json.data.isActive } : a)));
      }
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (admin: Admin) => {
    if (!confirm(`Supprimer l'administrateur ${admin.firstName} ${admin.lastName} ?`)) return;
    setBusyId(admin.id);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Administrateurs</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {admins.length} compte(s) — réservé au Super Admin
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvel administrateur
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-[#6B7280] text-sm">Aucun administrateur trouvé.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <tr className="text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Créé le</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const isSelf = a.id === currentAdminId;
                return (
                  <tr key={a.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8F9FA]/50">
                    <td className="px-4 py-3 text-[#1F2937] font-medium">
                      <div className="flex items-center gap-2">
                        {a.firstName} {a.lastName}
                        {isSelf && (
                          <span className="text-[10px] uppercase tracking-wider bg-[#496559]/10 text-[#496559] px-1.5 py-0.5 rounded">
                            Moi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{a.email}</td>
                    <td className="px-4 py-3">
                      {a.role === "SUPER_ADMIN" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#f39221]/10 text-[#f39221] px-2 py-0.5 rounded">
                          <Shield className="w-3 h-3" /> Super Admin
                        </span>
                      ) : (
                        <Badge>Admin</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={a.isActive ? "success" : "neutral"}>
                        {a.isActive ? "Actif" : "Désactivé"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1 justify-end">
                        <button
                          onClick={() => toggleActive(a)}
                          disabled={isSelf || busyId === a.id}
                          title={a.isActive ? "Désactiver" : "Activer"}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(a)}
                          disabled={isSelf || busyId === a.id}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setServerError("");
          reset({ role: "ADMIN" } as AdminCreateInput);
        }}
        title="Nouvel administrateur"
        description="Créez un compte administrateur. Le mot de passe lui sera communiqué hors-ligne."
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

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Mot de passe initial</label>
            <input
              type="password"
              {...register("password")}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            />
            <p className="mt-1 text-xs text-[#9CA3AF]">Min. 8 caractères, une majuscule et un chiffre.</p>
            {errors.password && <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Rôle</label>
            <select
              {...register("role")}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setOpenCreate(false);
                setServerError("");
                reset({ role: "ADMIN" } as AdminCreateInput);
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
