"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/AppContext";
import { TIER_CONFIG, getNextTier } from "@/lib/sellers";
import type { SaleRecord } from "@/lib/sales";
import TierBadge from "@/components/ui/TierBadge";
import PointsPill from "@/components/ui/PointsPill";
import AskAIModal from "@/components/ui/AskAIModal";
import Link from "next/link";
import {
  Zap, ArrowRight, Shield, MessageCircle,
  CheckCircle, MapPin, Brain, Gift,
} from "lucide-react";

const TODAY = new Date("2026-06-27");
const START_DATE = new Date("2026-06-22");
const DAYS_IN = Math.round((TODAY.getTime() - START_DATE.getTime()) / 86400000);
const FIRST_WIN_TARGET = 10;
const PACKAGE_COST = 500;

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// Today's single venue card — actionable, not overwhelming
const TODAYS_SPOT = {
  venue: "Gold's Gym, Andheri",
  time: "6–8 PM",
  sku: "Flamin' Fun Puffs Mini",
  tip: "Post-workout crowd. Have 15 packs ready.",
};

const JOURNEY_STAGES = [
  { label: "Getting Started",    goal: FIRST_WIN_TARGET, unlock: "First Win badge + ₹100 back + 50 pts" },
  { label: "Building Momentum",  goal: 35,               unlock: "Bigger consignment + Versova zone"     },
  { label: "Scaling Up",         goal: 100,              unlock: "Territory Captain title"                },
];

// ── USP / Protection Hero ─────────────────────────────────────────────────────
function ProtectionHero({ sales }: { sales: SaleRecord[] }) {
  const recovered = useMemo(() => sales.reduce((s, r) => s + r.value, 0), [sales]);
  const pct = Math.min(100, Math.round((recovered / PACKAGE_COST) * 100));
  const r = 34;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const daysLeft = 7 - DAYS_IN;
  const inProfit = recovered >= PACKAGE_COST;

  if (inProfit) {
    return (
      <div className="rounded-3xl overflow-hidden" style={{
        background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
        padding: "28px 24px",
      }}>
        <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-3">Investment Status</p>
        <h2 className="text-white font-black text-2xl leading-tight mb-1">In Profit! 🎉</h2>
        <p className="text-green-200 text-sm">Your ₹{PACKAGE_COST} is fully recovered. Everything from here is yours.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden" style={{
      background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)",
    }}>
      {/* Top: headline */}
      <div style={{ padding: "24px 24px 20px" }}>
        <div className="flex items-center gap-2 mb-5">
          <Shield size={14} fill="rgba(255,255,255,0.9)" color="rgba(255,255,255,0.9)" />
          <p className="text-white font-bold text-xs uppercase tracking-widest opacity-90">
            Buy-Back Guarantee · Active
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Ring */}
          <svg viewBox="0 0 100 100" style={{ width: 88, height: 88, flexShrink: 0 }}>
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
            <circle cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="10"
              strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
              transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1s ease" }} />
            <text x="50" y="46" textAnchor="middle" fill="white" fontSize="17" fontWeight="900">{pct}%</text>
            <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7">recovered</text>
          </svg>

          {/* Numbers */}
          <div>
            <p className="text-white font-black" style={{ fontSize: 32, lineHeight: 1, letterSpacing: "-0.02em" }}>
              ₹{recovered}
            </p>
            <p className="text-white/60 text-sm mt-1">of ₹{PACKAGE_COST} recovered</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                {daysLeft}d left on guarantee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: progress strip */}
      <div style={{ background: "rgba(0,0,0,0.12)", padding: "12px 24px 20px" }}>
        <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.2)" }}>
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-white/70 text-xs">
          ₹{PACKAGE_COST - recovered} more to fully recover · or MadMix buys it back
        </p>
      </div>
    </div>
  );
}

// ── Compact First Win bar ─────────────────────────────────────────────────────
function FirstWinBar({ sales }: { sales: SaleRecord[] }) {
  const total = useMemo(() => sales.reduce((s, r) => s + r.units, 0), [sales]);
  const done = total >= FIRST_WIN_TARGET;
  const pct = Math.min(100, Math.round((total / FIRST_WIN_TARGET) * 100));

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: `1.5px solid ${done ? "#22c55e" : "#F0E6D8"}` }}>
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: done ? "#f0fdf4" : "#FFF8F0" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: done ? "#22c55e" : "#FF6900" }}>
            {done
              ? <CheckCircle size={13} color="white" />
              : <Zap size={13} color="white" />
            }
          </div>
          <p className="font-bold text-sm" style={{ color: "#1A1200" }}>
            {done ? "First Win achieved! 🏆" : "7-Day First Win"}
          </p>
        </div>
        <p className="text-xs font-bold" style={{ color: done ? "#22c55e" : "#FF6900" }}>
          {done ? "+₹100 back" : `${total}/${FIRST_WIN_TARGET} packs`}
        </p>
      </div>

      {!done && (
        <div className="px-4 py-3">
          <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: "#F0E6D8" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #FF6900, #FFB800)" }} />
          </div>
          <p className="text-xs" style={{ color: "#6B5B45" }}>
            {FIRST_WIN_TARGET - total} more pack{FIRST_WIN_TARGET - total !== 1 ? "s" : ""} → First Win badge + ₹100 back + 50 pts
          </p>
        </div>
      )}
    </div>
  );
}

// ── Today's mission (single focused card) ────────────────────────────────────
function TodaysMission() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1A1200" }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <MapPin size={13} style={{ color: "#FF6900" }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF6900" }}>Today&apos;s Mission</p>
      </div>
      <div style={{ padding: "16px 16px 20px" }}>
        <p className="text-white font-black text-lg leading-tight mb-1">{TODAYS_SPOT.venue}</p>
        <p className="text-white/50 text-sm mb-3">{TODAYS_SPOT.time} · {TODAYS_SPOT.sku}</p>
        <p className="text-white/70 text-xs leading-relaxed px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
          💡 {TODAYS_SPOT.tip}
        </p>
      </div>
    </div>
  );
}

// ── Journey progress (compact) ────────────────────────────────────────────────
function JourneyBar({ totalUnits }: { totalUnits: number }) {
  const idx = totalUnits >= 35 ? 2 : totalUnits >= FIRST_WIN_TARGET ? 1 : 0;
  const stage = JOURNEY_STAGES[idx];
  const prev = idx === 0 ? 0 : idx === 1 ? FIRST_WIN_TARGET : 35;
  const pct = idx === 2 ? 100 : Math.min(100, Math.round(((totalUnits - prev) / (stage.goal - prev)) * 100));

  return (
    <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid #F0E6D8" }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#9C8870" }}>
            Stage {idx + 1} of 3
          </p>
          <p className="font-black text-sm" style={{ color: "#1A1200" }}>{stage.label}</p>
        </div>
        <div className="flex gap-1.5">
          {JOURNEY_STAGES.map((_, i) => (
            <div key={i} className="rounded-full transition-all" style={{
              width: i === idx ? 20 : 8, height: 8,
              background: i < idx ? "#FF6900" : i === idx ? "#FF6900" : "#F0E6D8",
              opacity: i > idx ? 0.4 : 1,
            }} />
          ))}
        </div>
      </div>

      <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "#F0E6D8" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #FF6900, #FFB800)" }} />
      </div>

      {idx < 2 && (
        <p className="text-xs" style={{ color: "#6B5B45" }}>
          Complete to unlock: <span className="font-semibold" style={{ color: "#1A1200" }}>{stage.unlock}</span>
        </p>
      )}
      {idx === 2 && (
        <p className="text-xs font-semibold" style={{ color: "#22c55e" }}>
          Full scale reached — you&apos;re a Territory Captain candidate 🏆
        </p>
      )}
    </div>
  );
}

// ── Quick nav ─────────────────────────────────────────────────────────────────
function QuickNav({ onAskAI }: { onAskAI: () => void }) {
  const NAV = [
    { href: "/mentor",    Icon: Brain,        label: "Mentor",   bg: "#EDE9FE", color: "#7C3AED" },
    { href: "/rewards",   Icon: Gift,         label: "Rewards",  bg: "#FFF3E6", color: "#FF6900" },
    { href: "/territory", Icon: MapPin,       label: "Territory",bg: "#DCFCE7", color: "#16A34A" },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {NAV.map(({ href, Icon, label, bg, color }) => (
        <Link key={href} href={href}
          className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
          style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
            <Icon size={18} style={{ color }} />
          </div>
          <p className="text-xs font-bold" style={{ color: "#1A1200" }}>{label}</p>
        </Link>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { state } = useApp();
  const router = useRouter();
  const { seller, points } = state;
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (!state.onboardingComplete) router.replace("/onboarding");
  }, [state.onboardingComplete, router]);

  if (!state.onboardingComplete) return null;

  const tierCfg = TIER_CONFIG[seller.tier];
  const nextTier = getNextTier(seller.tier);
  const progress = nextTier
    ? Math.min(100, ((points - tierCfg.minPoints) / (nextTier.pointsNeeded - tierCfg.minPoints)) * 100)
    : 100;

  const mySales = useMemo(
    () => state.sales.filter((s) => s.sellerId === state.seller.id),
    [state.sales, state.seller.id]
  );

  const todayUnits = mySales
    .filter((s) => isSameDay(new Date(s.timestamp), TODAY))
    .reduce((t, s) => t + s.units, 0);
  const totalUnits = mySales.reduce((t, s) => t + s.units, 0);

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* ── Dark header ── */}
      <div style={{ background: "#1A1200", padding: "48px 20px 24px" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {seller.area} · Day {DAYS_IN} of 7
            </p>
            <h1 className="text-white font-black" style={{ fontSize: 28, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Hey {seller.shortName}! 👋
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 mt-1">
            <PointsPill points={points} size="md" />
            <TierBadge tier={seller.tier} size="sm" />
          </div>
        </div>

        {nextTier && (
          <div style={{ marginTop: 20 }}>
            <div className="flex justify-between mb-2">
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{seller.tier}</span>
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {nextTier.tier} · {nextTier.pointsNeeded.toLocaleString("en-IN")} pts
              </span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#FF6900" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Content: generous padding, fewer cards ── */}
      <div style={{ padding: "24px 16px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 1 — USP hero */}
          <ProtectionHero sales={mySales} />

          {/* 2 — Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Today", value: `${todayUnits}`, sub: "packs sold" },
              { label: "Total", value: `${totalUnits}`, sub: "packs sold" },
              { label: `Day ${DAYS_IN}`, value: "/7", sub: "First Win window" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="rounded-2xl text-center"
                style={{ background: "white", border: "1px solid #F0E6D8", padding: "14px 8px" }}>
                <p className="font-black text-xl leading-none" style={{ color: "#1A1200" }}>
                  {value}
                </p>
                <p className="text-[10px] font-semibold mt-1.5" style={{ color: "#9C8870" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* 3 — PRIMARY CTA */}
          <Link
            href="/log-sale"
            className="flex items-center justify-center gap-3 rounded-2xl font-black text-white text-lg active:scale-[0.97] transition-transform"
            style={{
              background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)",
              padding: "22px 24px",
              boxShadow: "0 8px 32px rgba(255,105,0,0.3)",
            }}
          >
            <Zap size={22} fill="white" />
            Log a Sale
            <ArrowRight size={18} />
          </Link>

          {/* 4 — First Win */}
          <FirstWinBar sales={mySales} />

          {/* 5 — Today's mission */}
          <TodaysMission />

          {/* 6 — Journey */}
          <JourneyBar totalUnits={totalUnits} />

          {/* 7 — Quick nav */}
          <QuickNav onAskAI={() => setAiOpen(true)} />

          {/* 8 — AI mentor card */}
          <button
            onClick={() => setAiOpen(true)}
            className="w-full flex items-center gap-4 rounded-2xl transition-all active:scale-[0.98]"
            style={{ background: "#1A1200", padding: "18px 20px" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(124,58,237,0.3)" }}>
              <MessageCircle size={18} style={{ color: "#A78BFA" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-white text-sm">Ask your AI Mentor</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                What to sell, when to go, how to bundle
              </p>
            </div>
            <ArrowRight size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
          </button>

          <div style={{ height: 8 }} />
        </div>
      </div>

      {aiOpen && <AskAIModal onClose={() => setAiOpen(false)} />}
    </div>
  );
}
