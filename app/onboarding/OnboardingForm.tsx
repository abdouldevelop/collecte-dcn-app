"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle, CheckCircle, Building2 } from "lucide-react";
import { onboardingSchema, OnboardingInput } from "@/validators";
import { Button } from "@/components/ui/Button";

interface InvitationData {
  companyName: string;
  email: string;
  rccm?: string;
  ncc?: string;
}

export function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [invitationError, setInvitationError] = useState("");
  const [validating, setValidating] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { token },
  });

  useEffect(() => {
    setValue("token", token);
    if (!token) {
      setInvitationError("Lien d'invitation manquant ou invalide.");
      setValidating(false);
      return;
    }
    fetch(`/api/invitations/validate?token=${token}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setInvitation(json.data);
        } else {
          setInvitationError(json.error ?? "Invitation invalide ou expirée.");
        }
      })
      .catch(() => setInvitationError("Erreur de validation de l'invitation."))
      .finally(() => setValidating(false));
  }, [token, setValue]);

  const onSubmit = async (data: OnboardingInput) => {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error ?? "Erreur lors de la création du compte.");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setServerError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex items-center gap-3 text-[#6B7280] py-8">
        <div className="w-5 h-5 border-2 border-[#496559] border-t-transparent rounded-full animate-spin" />
        Validation de l&apos;invitation en cours...
      </div>
    );
  }

  if (invitationError) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-[#DC2626]/8 border border-[#DC2626]/20 rounded-xl text-sm text-[#DC2626]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Invitation invalide</p>
            <p className="mt-0.5 opacity-80">{invitationError}</p>
          </div>
        </div>
        <p className="text-sm text-[#6B7280]">
          Contactez votre administrateur pour recevoir un nouveau lien d&apos;invitation.
        </p>
        <a href="/login" className="block text-center text-sm text-[#496559] font-semibold hover:underline">
          ← Retour à la connexion
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("token")} />

      {/* Company info card */}
      {invitation && (
        <div className="flex items-start gap-3 p-4 bg-[#496559]/6 border border-[#496559]/20 rounded-xl">
          <Building2 className="w-5 h-5 text-[#496559] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#1F2937]">{invitation.companyName}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{invitation.email}</p>
            {invitation.rccm && (
              <p className="text-xs text-[#9CA3AF] mt-0.5">RCCM : {invitation.rccm}</p>
            )}
          </div>
          <CheckCircle className="w-4 h-4 text-[#16A34A] ml-auto shrink-0" />
        </div>
      )}

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-[#DC2626]/8 border border-[#DC2626]/20 rounded-xl text-sm text-[#DC2626]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">
          Mot de passe <span className="text-[#DC2626]">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 8 caractères"
            autoComplete="new-password"
            {...register("password")}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 pr-11 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>
        )}
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Au moins 8 caractères, une majuscule et un chiffre.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">
          Confirmer le mot de passe <span className="text-[#DC2626]">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirmer le mot de passe"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 pr-11 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="border-t border-[#E5E7EB] pt-5">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
          Informations complémentaires (optionnel)
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Téléphone</label>
            <input
              type="tel"
              placeholder="+243 ..."
              {...register("phone")}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Adresse</label>
            <input
              type="text"
              placeholder="Adresse de l&apos;entreprise"
              {...register("address")}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Secteur d&apos;activité</label>
            <input
              type="text"
              placeholder="Ex: Commerce, Industrie..."
              {...register("sector")}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 transition-all"
            />
          </div>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Créer mon compte
      </Button>
    </form>
  );
}
