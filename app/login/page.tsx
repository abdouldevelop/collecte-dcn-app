import { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion — Collecte DCN",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - institutional */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#496559] flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">DCN</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Collecte DCN</p>
              <p className="text-white/60 text-sm">Portail Statistiques</p>
            </div>
          </div>

          <div className="max-w-sm">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Plateforme de<br />
              <span className="text-[#f39221]">Collecte Statistique</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Déclarez vos données mensuelles de commerce extérieur
              Import / Export en toute sécurité.
            </p>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Entreprises actives", value: "150+" },
              { label: "Déclarations traitées", value: "2,400+" },
              { label: "Taux de conformité", value: "94%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-white/60 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-white/40 text-sm">
            <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full" />
            <span>Connexion sécurisée HTTPS</span>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F8F9FA]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#496559] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">DCN</span>
            </div>
            <p className="text-[#1F2937] font-bold">Collecte DCN</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1F2937]">Connexion Entreprise</h2>
              <p className="text-[#6B7280] text-sm mt-2">
                Accédez à votre espace sécurisé pour renseigner vos données mensuelles.
              </p>
            </div>

            <LoginForm />

            <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-center">
              <p className="text-sm text-[#6B7280]">
                Avez-vous reçu une invitation ?{" "}
                <a href="/onboarding" className="text-[#496559] font-semibold hover:underline">
                  Créer mon compte
                </a>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            © {new Date().getFullYear()} Collecte DCN — Données confidentielles et sécurisées
          </p>
        </div>
      </div>
    </div>
  );
}
