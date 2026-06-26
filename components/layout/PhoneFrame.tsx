"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isHQ = path.startsWith("/hq");

  useEffect(() => {
    document.body.classList.toggle("seller-view", !isHQ);
    document.body.classList.toggle("hq-view", isHQ);
  }, [isHQ]);

  if (isHQ) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Desktop branding — top-left badge */}
      <div className="hidden md:flex fixed top-6 left-6 items-center gap-2 pointer-events-none z-20">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "#FF6900" }}
        >
          <span className="text-sm font-black text-white">M</span>
        </div>
        <div>
          <p className="text-sm font-black leading-tight" style={{ color: "#1A1200" }}>MadSquad</p>
          <p className="text-[10px]" style={{ color: "#6B5B45" }}>Seller App by MadMix</p>
        </div>
      </div>

      {/* Desktop — top-right HQ link */}
      <div className="hidden md:block fixed top-6 right-6 z-20">
        <Link
          href="/hq"
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background: "#1A1200", color: "white" }}
        >
          HQ Dashboard →
        </Link>
      </div>

      {/* Desktop — left feature list */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 h-full items-end justify-center pr-8 gap-3 pointer-events-none z-10"
        style={{ width: "calc(50% - 215px)" }}>
        <div className="space-y-2 text-right">
          {[
            "Log sales, earn points 📍",
            "Beat your own records 📈",
            "Unlock exclusive rewards 🎁",
            "Get your territory mission 🎯",
          ].map((t) => (
            <p key={t} className="text-xs font-medium" style={{ color: "#9C8870" }}>{t}</p>
          ))}
        </div>
      </div>

      {/* Phone frame shell — centered, 430 px wide */}
      <main className="seller-shell pb-nav min-h-screen">
        {children}
      </main>
    </>
  );
}
