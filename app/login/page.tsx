import { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion — Collecte DCN",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="grid min-h-screen border-t-4 border-[#f39323] lg:grid-cols-[58%_42%]">
        <section className="relative hidden min-h-[calc(100vh-4px)] overflow-hidden lg:block">
          <Image
            src="/dcn-login-illustration.png"
            alt="Professionnels analysant des données statistiques de commerce extérieur"
            fill
            priority
            sizes="58vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#243d33]/10 to-transparent" />
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-[420px] bg-white px-10 py-12 sm:px-12">
            <div className="mb-10 flex justify-center">
              <Image
                src="/anstat-logo.png"
                alt="ANStat - Agence Nationale de la Statistique"
                width={3508}
                height={1323}
                priority
                className="h-14 w-auto"
              />
            </div>
            <LoginForm />
            <p className="mt-6 text-center text-xs leading-5 text-[#68746e]">
              Connectez-vous avec vos identifiants pour accéder à votre espace de collecte DCN.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
