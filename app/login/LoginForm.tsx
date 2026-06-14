"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginSchema, LoginInput } from "@/validators";
import { Button } from "@/components/ui/Button";

const TEST_ACCOUNTS = [
  { label: "Super Admin", email: "superadmin@collecte-dcn.gov", password: "Admin@123456" },
  { label: "Admin", email: "admin@collecte-dcn.gov", password: "Admin@123456" },
  { label: "Entreprise Demo SARL", email: "demo@entreprise.com", password: "Entreprise@123456" },
  { label: "SOTRACO Import-Export", email: "contact@sotraco.cg", password: "Entreprise@123456" },
];

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const quickLogin = async (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setServerError(json.error ?? "Identifiants incorrects."); return; }
      const target = json.data?.redirectTo ?? "/dashboard";
      router.push(target);
      router.refresh();
    } catch {
      setServerError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error ?? "Identifiants incorrects.");
        return;
      }
      const target = json.data?.redirectTo ?? "/dashboard";
      router.push(target);
      router.refresh();
    } catch {
      setServerError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-[#DC2626]/8 border border-[#DC2626]/20 rounded-xl text-sm text-[#DC2626]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">
          Adresse email <span className="text-[#DC2626]">*</span>
        </label>
        <input
          type="email"
          placeholder="exemple@entreprise.com"
          autoComplete="email"
          {...register("email")}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 transition-all"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-[#1F2937]">
            Mot de passe <span className="text-[#DC2626]">*</span>
          </label>
          <a
            href="/forgot-password"
            className="text-xs text-[#496559] hover:underline font-medium"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 pr-11 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Se connecter
      </Button>

      <div className="pt-4 border-t border-[#E5E7EB]">
        <p className="text-xs text-[#9CA3AF] mb-2 font-medium">Accès de test</p>
        <div className="flex flex-col gap-2">
          {TEST_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => quickLogin(acc.email, acc.password)}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[#E5E7EB] hover:border-[#496559] hover:bg-[#496559]/5 transition-all disabled:opacity-50 text-left"
            >
              <span className="text-xs font-semibold text-[#1F2937]">{acc.label}</span>
              <span className="text-xs text-[#9CA3AF]">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
