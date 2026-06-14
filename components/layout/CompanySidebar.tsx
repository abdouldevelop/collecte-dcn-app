"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FileInput, FileOutput, History,
  HelpCircle, User, Users, LogOut, ChevronRight, Globe,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/products", icon: Package, label: "Produits" },
  { href: "/countries", icon: Globe, label: "Pays partenaires" },
  {
    href: "/declarations",
    icon: FileInput,
    label: "Déclarations",
    children: [
      { href: "/declarations/import", icon: FileInput, label: "Import" },
      { href: "/declarations/export", icon: FileOutput, label: "Export" },
    ],
  },
  { href: "/history", icon: History, label: "Historique" },
  { href: "/focal-point", icon: Users, label: "Point Focal" },
  { href: "/profile", icon: User, label: "Mon Profil" },
  { href: "/support", icon: HelpCircle, label: "Support" },
];

interface CompanySidebarProps {
  companyName: string;
  companyEmail: string;
}

export function CompanySidebar({ companyName, companyEmail }: CompanySidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-64 min-h-screen bg-[#496559] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="bg-white rounded-xl px-3 py-2.5 flex items-center justify-center">
          <Image
            src="/anstat-logo.png"
            alt="ANSTAT - Agence Nationale de la Statistique"
            width={3508}
            height={1323}
            priority
            className="h-10 w-auto"
          />
        </div>
      </div>

      {/* Company info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/10 rounded-xl px-3 py-2.5">
          <p className="text-white text-sm font-semibold truncate">{companyName}</p>
          <p className="text-white/60 text-xs truncate">{companyEmail}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            const parentActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive(item.href) || parentActive
                      ? "text-white bg-white/20"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
                        isActive(child.href)
                          ? "text-white bg-white/20"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <child.icon className="w-3.5 h-3.5" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive(item.href)
                  ? "text-white bg-white/20 shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
