"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { focalPointSchema, FocalPointInput } from "@/validators";
import { Button } from "@/components/ui/Button";

interface FocalPointFormProps {
  initial?: Partial<FocalPointInput>;
}

export function FocalPointForm({ initial }: FocalPointFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FocalPointInput>({
    resolver: zodResolver(focalPointSchema),
    defaultValues: initial,
  });

  const onSubmit = async (data: FocalPointInput) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/company/focal-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<{
    name: keyof FocalPointInput;
    label: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
  }> = [
    { name: "firstName", label: "Prénom", required: true, placeholder: "Prénom" },
    { name: "lastName", label: "Nom", required: true, placeholder: "Nom de famille" },
    { name: "email", label: "Email professionnel", required: true, type: "email", placeholder: "email@exemple.com" },
    { name: "phone", label: "Téléphone", type: "tel", placeholder: "+243 ..." },
    { name: "position", label: "Poste / Fonction", placeholder: "Ex: Directeur Financier" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {success && (
        <div className="flex items-center gap-3 p-4 bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-xl text-[#16A34A] text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          Point focal enregistré avec succès.
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-[#DC2626]/8 border border-[#DC2626]/20 rounded-xl text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.name} className={f.name === "email" ? "sm:col-span-2" : ""}>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">
              {f.label}
              {f.required && <span className="text-[#DC2626] ml-1">*</span>}
            </label>
            <input
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              {...register(f.name)}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 transition-all"
            />
            {errors[f.name] && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors[f.name]?.message as string}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {initial ? "Mettre à jour" : "Enregistrer le point focal"}
        </Button>
      </div>
    </form>
  );
}
