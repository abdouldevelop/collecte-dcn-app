import { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Créer mon compte — Collecte DCN",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#496559] flex-col justify-between p-12">
        <div>
          <div className="mb-12">
            <div className="bg-white rounded-2xl px-5 py-4 inline-flex items-center justify-center shadow-lg">
              <Image
                src="/anstat-logo.png"
                alt="ANSTAT - Agence Nationale de la Statistique"
                width={3508}
                height={1323}
                priority
                className="h-14 w-auto"
              />
            </div>
            <p className="text-white/60 text-sm mt-3">Portail Collecte Statistiques</p>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Bienvenue sur<br />
            <span className="text-[#f39221]">votre espace</span>
          </h1>
          <p className="text-white/70 leading-relaxed mb-8">
            Vous avez reçu une invitation pour rejoindre la plateforme de collecte
            des données statistiques de commerce extérieur.
          </p>

          <div className="space-y-4">
            {[
              { step: "1", title: "Vérification", desc: "Validation de votre invitation" },
              { step: "2", title: "Compte", desc: "Création de vos accès sécurisés" },
              { step: "3", title: "Connexion", desc: "Accès à votre espace" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#f39221] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">{s.step}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{s.title}</p>
                  <p className="text-white/60 text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/40 text-xs">
          © {new Date().getFullYear()} Collecte DCN — Données sécurisées
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F8F9FA] overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1F2937]">Créer mon compte</h2>
              <p className="text-[#6B7280] text-sm mt-2">
                Finalisez votre inscription en définissant vos accès.
              </p>
            </div>
            <Suspense fallback={<p className="text-[#6B7280] text-sm">Chargement...</p>}>
              <OnboardingForm />
            </Suspense>
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="text-[#496559] font-semibold hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
