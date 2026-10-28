"use client";

import { Menu, ShieldCheck, X } from "lucide-react";
import { ReactNode, useState } from "react";

export function AppShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9f8] lg:flex">
      <div className="hidden shrink-0 lg:block">{sidebar}</div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#1b2920]/55 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
          />
          <div className="relative h-full w-[min(82vw,18rem)] shadow-2xl">
            {sidebar}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center border border-white/20 bg-white/10 text-white"
              aria-label="Fermer le menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="h-1 bg-[#f39323]" />
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#dfe5e1] bg-white/95 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center border border-[#dfe5e1] text-[#49655a] lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f39323]">ANStat</p>
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#1b2920] sm:text-base">
                Collecte DCN
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5d6d64]">
            <ShieldCheck className="h-4 w-4 text-[#49655a]" />
            <span className="hidden sm:inline">Espace sécurisé</span>
          </div>
        </header>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
