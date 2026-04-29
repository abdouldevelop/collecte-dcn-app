"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginSchema, LoginInput } from "@/validators";

export function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error ?? "Identifiants incorrects.");
        return;
      }
      router.push("/admin/dashboard");
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
          Email administrateur <span className="text-[#DC2626]">*</span>
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="admin@collecte-dcn.gov"
          {...register("email")}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#324d42] focus:ring-2 focus:ring-[#324d42]/10 transition-all"
        />
        {errors.email && <p className="mt-1 text-xs text-[#DC2626]">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">
          Mot de passe <span className="text-[#DC2626]">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-[#324d42] focus:ring-2 focus:ring-[#324d42]/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#324d42] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#2a3d35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        Se connecter
      </button>
    </form>
  );
}
