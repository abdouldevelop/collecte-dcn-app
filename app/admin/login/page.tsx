import { Metadata } from "next";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = { title: "Administration — Collecte DCN" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#324d42] flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">DCN</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Administration</p>
              <p className="text-white/60 text-sm">Collecte Statistiques</p>
            </div>
          </div>

          <div className="max-w-sm">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Espace<br />
              <span className="text-[#f39221]">Administrateur</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Supervisez les déclarations, gérez les entreprises et exportez les données statistiques.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Supervision déclarations", icon: "📊" },
            { label: "Gestion entreprises", icon: "🏢" },
            { label: "Import/Export données", icon: "📁" },
            { label: "Relances automatiques", icon: "🔔" },
          ].map((f) => (
            <div key={f.label} className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl mb-2">{f.icon}</p>
              <p className="text-white/80 text-sm font-medium">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F8F9FA]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-8">
            <div className="mb-8">
              <div className="w-12 h-12 bg-[#324d42] rounded-xl flex items-center justify-center mb-4">
                <span className="text-white font-bold">A</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937]">Connexion Administration</h2>
              <p className="text-[#6B7280] text-sm mt-2">
                Accédez au panneau d&apos;administration sécurisé.
              </p>
            </div>
            <AdminLoginForm />
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            © {new Date().getFullYear()} Collecte DCN — Accès réservé aux administrateurs
          </p>
        </div>
      </div>
    </div>
  );
}
