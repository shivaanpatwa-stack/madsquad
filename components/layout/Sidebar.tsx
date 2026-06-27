"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/store/AppContext";
import { TIER_CONFIG } from "@/lib/sellers";
import { Home, PlusCircle, Brain, Gift, MapPin, BarChart2, MessageCircle, GraduationCap } from "lucide-react";
import { useState } from "react";
import AskAIModal from "@/components/ui/AskAIModal";

const NAV = [
  { href: "/",          label: "Home",      Icon: Home           },
  { href: "/log-sale",  label: "Log Sale",  Icon: PlusCircle     },
  { href: "/academy",   label: "Academy",   Icon: GraduationCap  },
  { href: "/mentor",    label: "Mentor",    Icon: Brain          },
  { href: "/rewards",   label: "Rewards",   Icon: Gift           },
  { href: "/territory", label: "Territory", Icon: MapPin         },
];

export default function Sidebar() {
  const path = usePathname();
  const { state } = useApp();
  const { seller, points, academyCertified, completedLessons } = state;
  const tierCfg = TIER_CONFIG[seller.tier];
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 border-r"
        style={{ width: 240, background: "white", borderColor: "#F0E6D8" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "#F0E6D8" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-white text-sm"
            style={{ background: "#FF6900" }}
          >
            M
          </div>
          <div>
            <p className="font-black text-sm leading-tight" style={{ color: "#1A1200" }}>MadSquad</p>
            <p className="text-[10px]" style={{ color: "#9C8870" }}>by MadMix</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, Icon }) => {
            const active = path === href || (href !== "/" && path.startsWith(href));
            const isAcademy = href === "/academy";
            const lessonsDone = completedLessons.length;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                style={{
                  background: active ? "#FFF3E6" : "transparent",
                  color: active ? "#FF6900" : "#6B5B45",
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-sm flex-1 ${active ? "font-bold" : "font-medium"}`}>{label}</span>
                {isAcademy && !academyCertified && lessonsDone === 0 && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#FF6900", color: "white" }}>NEW</span>
                )}
                {isAcademy && !academyCertified && lessonsDone > 0 && (
                  <span className="text-[9px] font-bold" style={{ color: "#9C8870" }}>{lessonsDone}/5</span>
                )}
                {isAcademy && academyCertified && (
                  <span className="text-[9px] font-black" style={{ color: "#FFB800" }}>★ Done</span>
                )}
              </Link>
            );
          })}

          <div className="my-3 border-t" style={{ borderColor: "#F0E6D8" }} />

          <Link
            href="/hq"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{
              background: path.startsWith("/hq") ? "#1A1200" : "transparent",
              color: path.startsWith("/hq") ? "white" : "#6B5B45",
            }}
          >
            <BarChart2 size={18} strokeWidth={path.startsWith("/hq") ? 2.5 : 1.8} />
            <span className={`text-sm ${path.startsWith("/hq") ? "font-bold" : "font-medium"}`}>HQ Dashboard</span>
          </Link>
        </nav>

        {/* Ask AI button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => setAiOpen(true)}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
          >
            <MessageCircle size={16} />
            Ask AI Mentor
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "#F0E6D8" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
              style={{ background: "#FFF3E6", color: "#FF6900" }}
            >
              {seller.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "#1A1200" }}>{seller.name}</p>
              <p className="text-xs" style={{ color: "#9C8870" }}>
                {tierCfg.emoji} {seller.tier} · {points.toLocaleString("en-IN")} pts
              </p>
            </div>
          </div>
        </div>
      </aside>

      {aiOpen && <AskAIModal onClose={() => setAiOpen(false)} />}
    </>
  );
}
