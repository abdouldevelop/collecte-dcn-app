"use client";

import { useState } from "react";

interface FocalPointInvitation {
  status: string;
  expiresAt: string;
}

interface FocalPoint {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  isOnboarded: boolean;
  invitation?: FocalPointInvitation | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Invitation envoyée", color: "bg-yellow-100 text-yellow-800" },
  USED: { label: "Accès activé", color: "bg-green-100 text-green-800" },
  EXPIRED: { label: "Invitation expirée", color: "bg-red-100 text-red-800" },
};

function getStatus(fp: FocalPoint) {
  if (fp.isOnboarded) return { label: "Accès activé", color: "bg-green-100 text-green-800" };
  if (!fp.invitation) return { label: "Sans accès", color: "bg-gray-100 text-gray-500" };
  return STATUS_CONFIG[fp.invitation.status] ?? { label: fp.invitation.status, color: "bg-gray-100 text-gray-500" };
}

export default function FocalPointForm({ initialFocalPoints }: { initialFocalPoints: FocalPoint[] }) {
  const [focalPoints, setFocalPoints] = useState<FocalPoint[]>(initialFocalPoints);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", position: "" });
  const [loading, setLoading] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company/focal-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erreur"); return; }
      setFocalPoints((prev) => [
        ...prev,
        {
          ...json.data,
          invitation: { status: "PENDING", expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() },
        },
      ]);
      setShowAdd(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", position: "" });
      setSuccess("Point focal ajouté — invitation envoyée par email");
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(id: string) {
    setResendingId(id);
    try {
      const res = await fetch(`/api/company/focal-point/${id}`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setSuccess("Invitation renvoyée");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(json.error || "Erreur");
      }
    } finally {
      setResendingId(null);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Désactiver ce point focal ?")) return;
    const res = await fetch(`/api/company/focal-point/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFocalPoints((prev) => prev.filter((fp) => fp.id !== id));
    }
  }

  const canAdd = focalPoints.length < 4;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Points focaux</h1>
          <p className="text-sm text-gray-500 mt-1">
            {focalPoints.length}/4 — chaque point focal reçoit ses propres accès par email.
          </p>
        </div>
        {canAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: "#496559" }}
          >
            + Ajouter
          </button>
        )}
      </div>

      {success && <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {showAdd && (
        <form onSubmit={handleAdd} className="mb-6 p-5 rounded-xl border border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-4">Nouveau point focal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
              <input
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "#496559" }}
            >
              {loading ? "Envoi..." : "Créer et envoyer l'invitation"}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {focalPoints.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">👤</div>
          <p className="font-medium">Aucun point focal défini</p>
          <p className="text-sm mt-1">Ajoutez jusqu&apos;à 4 points focaux avec accès individuels.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {focalPoints.map((fp) => {
            const status = getStatus(fp);
            return (
              <div key={fp.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: "#496559" }}
                  >
                    {fp.firstName[0]}{fp.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{fp.firstName} {fp.lastName}</p>
                    <p className="text-sm text-gray-500">{fp.email}</p>
                    {fp.position && <p className="text-xs text-gray-400">{fp.position}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                  {!fp.isOnboarded && (
                    <button
                      onClick={() => handleResend(fp.id)}
                      disabled={resendingId === fp.id}
                      className="text-sm text-[#496559] hover:underline disabled:opacity-50"
                    >
                      {resendingId === fp.id ? "..." : "Renvoyer invitation"}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(fp.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                    title="Désactiver"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
