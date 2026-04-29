"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { profileUpdateSchema, ProfileUpdateInput } from "@/validators";
import { Button } from "@/components/ui/Button";

export function ProfileForm({ initial }: { initial: ProfileUpdateInput }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: initial,
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error ?? "Erreur"); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {success && (
        <div className="flex items-center gap-2 p-3 bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-xl text-sm text-[#16A34A]">
          <CheckCircle className="w-4 h-4" />
          Profil mis à jour avec succès.
        </div>
      )}
      {error && <p className="text-sm text-[#DC2626] bg-[#DC2626]/8 p-3 rounded-xl">{error}</p>}

      {[
        { name: "phone" as const, label: "Téléphone", type: "tel", placeholder: "+243 ..." },
        { name: "address" as const, label: "Adresse", placeholder: "Adresse de l'entreprise" },
        { name: "sector" as const, label: "Secteur d'activité", placeholder: "Ex: Commerce, Industrie..." },
      ].map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">{f.label}</label>
          <input
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            {...register(f.name)}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
          />
          {errors[f.name] && <p className="mt-1 text-xs text-[#DC2626]">{errors[f.name]?.message as string}</p>}
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Enregistrer les modifications</Button>
      </div>
    </form>
  );
}
