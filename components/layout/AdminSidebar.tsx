"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, FileText, Settings, LogOut, Users, TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/admin/companies", icon: Building2, label: "Entreprises" },
  { href: "/admin/declarations", icon: FileText, label: "Déclarations" },
  { href: "/admin/exchange-rates", icon: TrendingUp, label: "Taux de change" },
  { href: "/admin/admins", icon: Users, label: "Administrateurs", superAdmin: true },
  { href: "/admin/settings", icon: Settings, label: "Paramètres", superAdmin: true },
];

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
  role: string;
}

export function AdminSidebar({ adminName, adminEmail, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-64 min-h-screen bg-[#324d42] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">DCN</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Administration</p>
            <p className="text-white/60 text-xs">Collecte Statistiques</p>
          </div>
        </div>
      </div>

      {/* Admin info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/10 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-semibold truncate flex-1">{adminName}</p>
            {isSuperAdmin && (
              <span className="text-[8px] font-bold bg-[#f39221] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                Super
              </span>
            )}
          </div>
          <p className="text-white/60 text-xs truncate">{adminEmail}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter((item) => !item.superAdmin || isSuperAdmin)
          .map((item) => (
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
          ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <form action="/api/auth/admin-logout" method="POST">
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
