import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  weight: ["400", "500", "600", "700"],
});

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
      <body className={`${publicSans.variable} font-sans antialiased bg-[#F8F9FA]`}>
        {children}
      </body>
    </html>
  );
}
