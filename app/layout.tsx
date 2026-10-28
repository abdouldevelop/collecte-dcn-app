import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Collecte DCN — Portail Institutionnel",
  description: "Plateforme de collecte des données statistiques de commerce extérieur",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-[#F8F9FA]">
        {children}
      </body>
    </html>
  );
}
