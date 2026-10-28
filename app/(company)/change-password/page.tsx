import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { Shield, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Changement de mot de passe — Collecte DCN" };

export default async function ChangePasswordPage() {
  const session = await requireCompanySession();

  const company = await prisma.company.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      mustChangePassword: true,
    },
  });

  if (!company) {
    redirect("/login");
  }

  // Si le changement de mot de passe n'est pas obligatoire, rediriger vers le dashboard
  if (!company.mustChangePassword) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-[#496559] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Changement de mot de passe requis</h1>
          <p className="text-[#6B7280] text-sm mt-2">
            Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire.
          </p>
        </div>

        {/* Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">Important</h3>
            <p className="text-sm text-amber-800 mt-1">
              Votre mot de passe doit contenir au moins 8 caractères, incluant une majuscule,
              une minuscule, un chiffre et un caractère spécial (@#$%&*!).
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">
            Nouveau mot de passe
          </h2>
          <ChangePasswordForm />
        </div>

        {/* Info */}
        <p className="text-center text-xs text-[#9CA3AF]">
          Après avoir changé votre mot de passe, vous pourrez accéder à votre tableau de bord
          et commencer à gérer vos déclarations.
        </p>
      </div>
    </div>
  );
}
