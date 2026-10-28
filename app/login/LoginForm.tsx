"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { loginSchema, LoginInput } from "@/validators";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

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
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#37433d]">
          Nom d&apos;utilisateur
        </label>
        <input
          type="email"
          placeholder="Votre adresse e-mail"
          autoComplete="email"
          {...register("email")}
          className="w-full border border-[#cbd4cf] bg-white px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-all focus:border-[#496559] focus:outline-none focus:ring-1 focus:ring-[#496559]"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#37433d]">
            Mot de passe
          </label>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className="w-full border border-[#cbd4cf] bg-white px-4 py-3 pr-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-all focus:border-[#496559] focus:outline-none focus:ring-1 focus:ring-[#496559]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#71867d] transition-colors hover:text-[#496559]"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" loading={loading} className="mt-2 w-full rounded-none bg-[#71867d] py-3 shadow-none hover:bg-[#496559]" size="lg">
        {!loading && <LogIn className="h-4 w-4" />}
        Se connecter
      </Button>

    </form>
  );
}
