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
  Zap, TrendingUp, ShoppingBag, ArrowRight, Shield,
  Users, MessageCircle, RefreshCw,
  CheckCircle, Clock, MapPin, Star, Package, Flame,
} from "lucide-react";

const TODAY = new Date("2026-06-27");
const START_DATE = new Date("2026-06-22");
const DAYS_IN = Math.round((TODAY.getTime() - START_DATE.getTime()) / 86400000);
const FIRST_WIN_TARGET = 10;
const PACKAGE_COST = 500;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// ── Bundle suggestions data ───────────────────────────────────────────────────
const BUNDLE_TIPS = [
  {
    trigger: "Gym",
    emoji: "💪",
    combo: "Flamin' Fun Mini + Nardana Raisins",
    pitch: "Gym crowd buys both — spicy snack on the way in, raisins after workout. Sell as a ₹30 pair.",
    lift: "+₹20 per sale",
  },
  {
    trigger: "College",
    emoji: "🎒",
    combo: "Mad Variety Pack + Chaat Corner Mini",
    pitch: "Students go for variety. ₹30 combo = two different flavours to share.",
    lift: "+₹20 per sale",
  },
  {
    trigger: "Corporate Office",
    emoji: "💼",
    combo: "Mighty Masala Mini + Millet Bhel",
    pitch: "Office tea-time crowd likes mix of light and bold. Easy upsell at ₹30.",
    lift: "+₹20 per sale",
  },
];

// ── Weekly route data ─────────────────────────────────────────────────────────
const WEEKLY_ROUTE = [
  { day: "Mon", spot: "Gold's Gym, Andheri", time: "7–9 AM", sku: "Flamin' Fun Mini", reason: "Pre-workout crowd" },
  { day: "Tue", spot: "Andheri Corp Offices", time: "4–6 PM", sku: "Mighty Masala Mini", reason: "Evening tea-time" },
  { day: "Wed", spot: "Mithibai College, Vile Parle", time: "12–2 PM", sku: "Mad Variety Pack", reason: "Lunch crowd" },
  { day: "Thu", spot: "Gold's Gym, Andheri", time: "7–9 AM", sku: "Flamin' Fun Mini", reason: "Build repeat buyers" },
  { day: "Fri", spot: "BKC Adjacent Offices", time: "4–6 PM", sku: "Bhujia Classic Mini", reason: "End-of-week spend" },
  { day: "Sat", spot: "Andheri West Market", time: "10 AM–1 PM", sku: "Chaat Corner Mini", reason: "Weekend foot traffic" },
];

const JOURNEY_STAGES = [
  {
    key: "getting-started",
    label: "Getting Started",
    desc: "Sell your starter pack, hit your First Win, own your zone.",
    mission: "📍 Mission: Gold's Gym, Andheri — Flamin' Fun Puffs, 7–9 AM",
    nextUnlocks: ["First Win badge + ₹100 back", "50 bonus points", "Stage 2 access"],
    goal: FIRST_WIN_TARGET,
  },
  {
    key: "building-momentum",
    label: "Building Momentum",
    desc: "Consistent sales, bigger consignment, second channel unlocked.",
    mission: "📍 Next: Add Versova as your second zone — gym demand, zero sellers",
    nextUnlocks: ["₹1,000 consignment (10% bigger)", "Second territory: Versova", "Weekly route planner"],
    goal: 35,
  },
  {
    key: "scaling-up",
    label: "Scaling Up",
    desc: "Multiple zones, full weekly route, Territory Captain option.",
    mission: "📍 Next: Become Territory Captain — manage Andheri + mentor 2 sellers",
    nextUnlocks: ["Territory Captain title", "Priority delivery perk", "Earn from your squad"],
    goal: 100,
  },
];

// ── Risk Meter ────────────────────────────────────────────────────────────────
function RiskMeter({ sales }: { sales: SaleRecord[] }) {
  const recovered = useMemo(() => sales.reduce((s, r) => s + r.value, 0), [sales]);
  const pct = Math.min(100, Math.round((recovered / PACKAGE_COST) * 100));
  const r = 40;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const state = pct >= 100 ? "profit" : pct >= 50 ? "halfway" : "recovery";
  const stateLabel = state === "profit" ? "In Profit 🎉" : state === "halfway" ? "Halfway There!" : "Building Recovery";
  const stateColor = state === "profit" ? "#22c55e" : state === "halfway" ? "#FFB800" : "#FF6900";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} style={{ color: "#FF6900" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>Pack Recovery</p>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#F0E6D8" strokeWidth="10" />
            <circle
              cx="50" cy="50" r={r} fill="none" stroke={stateColor} strokeWidth="10"
              strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
              transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1s ease" }}
            />
            <text x="50" y="47" textAnchor="middle" fill="#1A1200" fontSize="14" fontWeight="800">{pct}%</text>
            <text x="50" y="60" textAnchor="middle" fill="#9C8870" fontSize="7">recovered</text>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-black text-base" style={{ color: "#1A1200" }}>₹{recovered} of ₹{PACKAGE_COST}</p>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: `${stateColor}20`, color: stateColor }}>
            {stateLabel}
          </span>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: "#6B5B45" }}>
            {state === "profit" ? "Everything you earn from here is pure profit. 🎉"
              : `₹${PACKAGE_COST - recovered} more and your pack is fully recovered.`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Foundation / First Win Tracker ───────────────────────────────────────────
function FoundationTracker({ sales }: { sales: SaleRecord[] }) {
  const totalUnits = useMemo(() => sales.reduce((s, r) => s + r.units, 0), [sales]);
  const firstWinDone = totalUnits >= FIRST_WIN_TARGET;
  const firstWinPct = Math.min(100, Math.round((totalUnits / FIRST_WIN_TARGET) * 100));
  const daysLeft = 7 - DAYS_IN;

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm"
      style={{ border: firstWinDone ? "2px solid #22c55e" : "2px solid #FF6900" }}>
      <div className="px-4 py-3"
        style={{ background: firstWinDone ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #FF6900, #FFB800)" }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-wider text-white/80">7-Day First Win</p>
          {firstWinDone
            ? <CheckCircle size={16} className="text-white" />
            : <span className="text-xs font-bold text-white">{daysLeft} day{daysLeft !== 1 ? "s" : ""} left</span>}
        </div>
        <p className="text-white font-black text-base mt-0.5">
          {firstWinDone ? "First Win achieved! 🏆"
            : `Day ${DAYS_IN} of 7 · ${totalUnits} of ${FIRST_WIN_TARGET} packs · You're on track ✅`}
        </p>
      </div>
      <div className="px-4 py-3 bg-white">
        {!firstWinDone && (
          <>
            <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: "#F0E6D8" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${firstWinPct}%`, background: "linear-gradient(90deg, #FF6900, #FFB800)" }} />
            </div>
            <p className="text-xs" style={{ color: "#6B5B45" }}>
              {FIRST_WIN_TARGET - totalUnits} more pack{FIRST_WIN_TARGET - totalUnits !== 1 ? "s" : ""} to earn your First Win badge + ₹100 back + 50 bonus points
            </p>
            <p className="text-xs mt-1.5 font-semibold" style={{ color: "#FF6900" }}>
              🛡️ Your ₹500 pack is protected — MadMix has your back.
            </p>
          </>
        )}
        {firstWinDone && (
          <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
            You've earned your First Win badge + ₹100 back + 50 bonus points! Keep going.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Journey Card (3-stage progression with unlocks) ──────────────────────────
function JourneyCard({ totalUnits }: { totalUnits: number }) {
  const stageIdx = totalUnits >= 35 ? 2 : totalUnits >= FIRST_WIN_TARGET ? 1 : 0;
  const stage = JOURNEY_STAGES[stageIdx];
  const stagePct = stageIdx === 0
    ? Math.min(100, Math.round((totalUnits / FIRST_WIN_TARGET) * 100))
    : stageIdx === 1
    ? Math.min(100, Math.round(((totalUnits - FIRST_WIN_TARGET) / (35 - FIRST_WIN_TARGET)) * 100))
    : 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #F0E6D8" }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#FFF8F0", borderBottom: "1px solid #F0E6D8" }}>
        <Star size={14} style={{ color: "#FF6900" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>Your Journey</p>
        <span className="ml-auto text-xs font-semibold" style={{ color: "#FF6900" }}>Stage {stageIdx + 1} of 3</span>
      </div>

      {/* Stage stepper */}
      <div className="px-4 pt-4 space-y-0">
        {JOURNEY_STAGES.map((s, i) => {
          const done = i < stageIdx;
          const active = i === stageIdx;
          return (
            <div key={s.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    background: done ? "#22c55e" : active ? "#FF6900" : "#F0E6D8",
                    color: done || active ? "white" : "#9C8870",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                {i < JOURNEY_STAGES.length - 1 && (
                  <div className="w-0.5 mt-1" style={{ height: active ? "auto" : 24, minHeight: 24, background: done ? "#22c55e" : "#F0E6D8" }} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-bold" style={{ color: active ? "#FF6900" : done ? "#1A1200" : "#9C8870" }}>
                  {s.label} {active && "← You're here"}
                </p>
                <p className="text-xs" style={{ color: active ? "#6B5B45" : "#9C8870" }}>{s.desc}</p>

                {active && (
                  <div className="mt-2 space-y-2">
                    {/* Progress bar within current stage */}
                    {stageIdx < 2 && (
                      <div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${stagePct}%`, background: "linear-gradient(90deg, #FF6900, #FFB800)" }} />
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: "#9C8870" }}>
                          {totalUnits} of {stageIdx === 0 ? FIRST_WIN_TARGET : 35} packs · {stagePct}% through this stage
                        </p>
                      </div>
                    )}
                    {/* Current mission */}
                    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "#FFF3E6", color: "#FF6900" }}>
                      {stage.mission}
                    </div>
                    {/* What unlocks next */}
                    {stageIdx < 2 && (
                      <div className="rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <p className="text-xs font-bold mb-1.5" style={{ color: "#15803d" }}>
                          🔓 Complete this stage to unlock:
                        </p>
                        {stage.nextUnlocks.map((u) => (
                          <div key={u} className="flex items-center gap-1.5 text-xs mb-0.5" style={{ color: "#166534" }}>
                            <CheckCircle size={10} className="shrink-0" style={{ color: "#22c55e" }} />
                            {u}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Level Up Banner (triggers when near sold-out) ─────────────────────────────
function LevelUpBanner({ remainingStock, starterPackage }: { remainingStock: number; starterPackage: number }) {
  const [ordered, setOrdered] = useState(false);
  const threshold = Math.ceil((starterPackage / 10) * 0.2); // 20% of pack
  if (remainingStock > threshold) return null;

  const nextPkg = starterPackage === 100 ? 500 : 1000;
  if (ordered) return (
    <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#dcfce7", border: "2px solid #22c55e" }}>
      <CheckCircle size={20} style={{ color: "#22c55e" }} className="shrink-0" />
      <div>
        <p className="font-bold text-sm" style={{ color: "#15803d" }}>₹{nextPkg.toLocaleString("en-IN")} reorder in progress!</p>
        <p className="text-xs" style={{ color: "#166534" }}>Versova territory + bigger consignment unlock on delivery.</p>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "2px solid #FF6900" }}>
      <div className="px-4 py-3" style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}>
        <p className="text-[10px] font-black uppercase tracking-wider text-white/80">🎉 You&apos;re Almost Sold Out!</p>
        <p className="text-white font-black text-lg mt-0.5">Time to Level Up</p>
        <p className="text-xs text-white/80 mt-0.5">Only {remainingStock} packs left. Reorder bigger for better margin + new zone.</p>
      </div>
      <div className="p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {[
            { emoji: "📦", title: `₹${nextPkg.toLocaleString("en-IN")} Pack`, desc: "10% more stock + better margin per pack" },
            { emoji: "📍", title: "Versova Opens Up", desc: "Your second territory — gyms, low competition" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: "#FFF8F0" }}>
              <span className="text-xl shrink-0">{item.emoji}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: "#1A1200" }}>{item.title}</p>
                <p className="text-[10px]" style={{ color: "#6B5B45" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setOrdered(true)}
          className="w-full py-3 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
        >
          Reorder ₹{nextPkg.toLocaleString("en-IN")} Pack + Unlock Versova →
        </button>
      </div>
    </div>
  );
}

// ── Weekly Route Planner ──────────────────────────────────────────────────────
function WeeklyRouteCard() {
  const today = TODAY.getDay(); // 0=Sun...6=Sat
  const todayIdx = [1, 2, 3, 4, 5, 6].indexOf(today); // Mon-Sat indices in WEEKLY_ROUTE

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #F0E6D8" }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#FFF8F0", borderBottom: "1px solid #F0E6D8" }}>
        <MapPin size={14} style={{ color: "#FF6900" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>Your Weekly Route</p>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFF3E6", color: "#FF6900" }}>AI Generated</span>
      </div>
      <div className="divide-y" style={{ borderColor: "#F0E6D8" }}>
        {WEEKLY_ROUTE.map((stop, i) => {
          const isToday = i === todayIdx;
          return (
            <div key={stop.day} className="flex items-start gap-3 px-4 py-3"
              style={{ background: isToday ? "#FFF3E6" : "white" }}>
              <div
                className="w-10 shrink-0 text-center py-1 rounded-lg"
                style={{ background: isToday ? "#FF6900" : "#F0E6D8" }}
              >
                <p className="text-xs font-black" style={{ color: isToday ? "white" : "#9C8870" }}>{stop.day}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: isToday ? "#FF6900" : "#1A1200" }}>{stop.spot}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#9C8870" }}>
                  {stop.time} · {stop.sku}
                </p>
                <p className="text-[10px]" style={{ color: isToday ? "#FF6900" : "#9C8870" }}>{stop.reason}</p>
              </div>
              {isToday && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 self-center"
                  style={{ background: "#FF6900", color: "white" }}>Today</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Smart Bundle Suggestion ───────────────────────────────────────────────────
function SmartBundleCard({ channel }: { channel?: string }) {
  const tip = BUNDLE_TIPS.find((b) => b.trigger === channel) ?? BUNDLE_TIPS[0];
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-center gap-2 mb-3">
        <Package size={14} style={{ color: "#7C3AED" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>Smart Bundle</p>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#7C3AED" }}>
          {tip.lift}
        </span>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{tip.emoji}</span>
        <div>
          <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{tip.combo}</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B5B45" }}>{tip.pitch}</p>
        </div>
      </div>
    </div>
  );
}

// ── Repeat Customer Insight ───────────────────────────────────────────────────
function RepeatCustomerCard({ sales }: { sales: SaleRecord[] }) {
  const repeatCount = sales.filter((s) => s.repeatCustomer).length;
  const totalSales = sales.length;
  const repeatPct = totalSales > 0 ? Math.round((repeatCount / totalSales) * 100) : 0;

  // Average sale value (plain language, no jargon)
  const totalValue = sales.reduce((s, r) => s + r.value, 0);
  const avgSale = totalSales > 0 ? Math.round(totalValue / totalSales) : 0;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} style={{ color: "#22c55e" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>Your Regulars</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl p-3 text-center" style={{ background: "#f0fdf4" }}>
          <p className="text-xl font-black" style={{ color: "#15803d" }}>{repeatCount}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "#9C8870" }}>repeat sales</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: "#FFF3E6" }}>
          <p className="text-xl font-black" style={{ color: "#FF6900" }}>₹{avgSale}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "#9C8870" }}>avg sale value</p>
        </div>
      </div>
      <div className="rounded-xl px-3 py-2 text-xs leading-relaxed" style={{ background: "#FFF8F0" }}>
        <span className="font-bold" style={{ color: "#1A1200" }}>Mentor tip: </span>
        <span style={{ color: "#6B5B45" }}>
          {repeatPct >= 30
            ? "Strong repeat rate! Your gym crowd trusts you. Offer them the variety pack to grow your average sale."
            : "Show up at the same spot same time. Consistency builds repeat buyers — your steadiest income."}
        </span>
      </div>
      {avgSale > 0 && (
        <p className="text-[10px] mt-2 text-center" style={{ color: "#9C8870" }}>
          Add a combo to push your avg sale above ₹{avgSale + 10} 📈
        </p>
      )}
    </div>
  );
}

// ── Squad Support ─────────────────────────────────────────────────────────────
function SquadSupport() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-center gap-2 mb-3">
        <Users size={15} style={{ color: "#FF6900" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>Squad Buddy</p>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: "#FFF3E6", color: "#FF6900" }}>
          SN
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "#1A1200" }}>Sneha Nair</p>
          <p className="text-xs" style={{ color: "#9C8870" }}>Andheri · Crusher · 2 yrs selling</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: "#dcfce7", color: "#15803d" }}>● Online</span>
        </div>
      </div>
      <div className="space-y-2">
        {[
          "Hit gyms between 7–9 AM — that's when the pre-workout crowd is buying.",
          "Andheri corporate offices pick up fast on Fridays — try BKC-adjacent buildings.",
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2 rounded-xl px-3 py-2" style={{ background: "#FFF8F0" }}>
            <span className="text-xs shrink-0 mt-0.5">💡</span>
            <p className="text-xs leading-relaxed" style={{ color: "#6B5B45" }}>{tip}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] mt-3 text-center" style={{ color: "#9C8870" }}>Mentorship — learning from sellers who know your area</p>
    </div>
  );
}

// ── Momentum ──────────────────────────────────────────────────────────────────
function MomentumCard({ streak }: { streak: number }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4" style={{ border: "1px solid #F0E6D8" }}>
      <Flame size={28} style={{ color: "#FF6900" }} />
      <div className="flex-1">
        <p className="font-black" style={{ color: "#1A1200" }}>{streak}-day momentum!</p>
        <p className="text-xs mt-0.5" style={{ color: "#6B5B45" }}>You've sold every day this week. Keep the streak alive today.</p>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i < streak ? "#FF6900" : "#F0E6D8" }} />
        ))}
      </div>
    </div>
  );
}

// ── Reorder Stock (with real stock levels) ────────────────────────────────────
function ReorderCard({ sales, packageUnits }: { sales: SaleRecord[]; packageUnits: number }) {
  const [done, setDone] = useState(false);

  const skuData = [
    { id: "sku-01", name: "Flamin' Fun Puffs Mini", emoji: "🔥", initial: Math.ceil(packageUnits * 0.6) },
    { id: "sku-07", name: "Mighty Masala Mini",     emoji: "💥", initial: Math.floor(packageUnits * 0.4) },
  ].map(({ id, name, emoji, initial }) => {
    const sold = sales.filter((s) => s.skuId === id).reduce((sum, s) => sum + s.units, 0);
    const remaining = Math.max(0, initial - sold);
    const pct = Math.round((remaining / initial) * 100);
    return { id, name, emoji, sold, remaining, initial, pct };
  });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw size={14} style={{ color: "#FF6900" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>Reorder Stock</p>
      </div>
      <div className="space-y-3">
        {skuData.map((item) => {
          const statusLabel = item.pct > 50 ? "Healthy" : item.pct > 20 ? "Running low" : "Restock soon";
          const statusColor = item.pct > 50 ? "#15803d" : item.pct > 20 ? "#FF6900" : "#D62828";
          const statusBg = item.pct > 50 ? "#dcfce7" : item.pct > 20 ? "#FFF3E6" : "#fee2e2";
          return (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#1A1200" }}>{item.name}</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>{item.remaining} packs left</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0"
                  style={{ background: statusBg, color: statusColor }}>{statusLabel}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${item.pct}%`,
                  background: item.pct > 50 ? "#22c55e" : item.pct > 20 ? "#FF6900" : "#D62828",
                }} />
              </div>
            </div>
          );
        })}
      </div>
      {done ? (
        <div className="mt-3 flex items-center gap-2 justify-center py-2 rounded-xl" style={{ background: "#dcfce7" }}>
          <CheckCircle size={14} style={{ color: "#15803d" }} />
          <span className="text-xs font-bold" style={{ color: "#15803d" }}>Reorder requested!</span>
        </div>
      ) : (
        <button onClick={() => setDone(true)}
          className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-transform"
          style={{ background: "#FFF3E6", color: "#FF6900" }}>
          Request Restock →
        </button>
      )}
    </div>
  );
}

// ── Weekly mini chart ──────────────────────────────────────────────────────────
function WeekChart({ sales }: { sales: SaleRecord[] }) {
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(TODAY);
      d.setDate(d.getDate() - 6 + i);
      return d;
    }), []);

  const barData = useMemo(() =>
    days.map((d) => ({
      label: DAY_LABELS[d.getDay()],
      units: sales.filter((s) => isSameDay(new Date(s.timestamp), d)).reduce((sum, s) => sum + s.units, 0),
      isToday: isSameDay(d, TODAY),
    })), [days, sales]);

  const maxUnits = Math.max(...barData.map((d) => d.units), 1);
  const total = barData.reduce((s, d) => s + d.units, 0);
  const CHART_H = 60;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>This Week</p>
        <span className="text-xs font-bold" style={{ color: "#FF6900" }}>{total} packs</span>
      </div>
      <div className="flex items-end gap-1.5" style={{ height: CHART_H + 20 }}>
        {barData.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div className="w-full flex items-end" style={{ height: CHART_H }}>
              <div className="w-full rounded-t" style={{
                height: `${Math.max(4, (bar.units / maxUnits) * CHART_H)}px`,
                background: bar.isToday ? "#FFB800" : "#FF6900",
                opacity: bar.units === 0 ? 0.2 : 1,
              }} />
            </div>
            <span className="text-[9px]" style={{ color: bar.isToday ? "#FF6900" : "#9C8870" }}>{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { state } = useApp();
  const router = useRouter();
  const { seller, points, streak } = state;
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

  const arjunSales = useMemo(
    () => state.sales.filter((s) => s.sellerId === state.seller.id),
    [state.sales, state.seller.id]
  );

  const todaySales = arjunSales.filter((s) => isSameDay(new Date(s.timestamp), TODAY));
  const todayUnits = todaySales.reduce((t, s) => t + s.units, 0);
  const totalUnits = arjunSales.reduce((t, s) => t + s.units, 0);

  const packageUnits = state.starterPackage / 10;
  const remainingStock = Math.max(0, packageUnits - totalUnits);
  const stageIdx = totalUnits >= 35 ? 2 : totalUnits >= FIRST_WIN_TARGET ? 1 : 0;

  // Determine top channel for bundle suggestion
  const chMap: Record<string, number> = {};
  arjunSales.forEach((s) => { chMap[s.channel] = (chMap[s.channel] ?? 0) + s.units; });
  const topChannel = Object.entries(chMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Gym";

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}>
        <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>Aaj kya plan hai? 🌶️</p>
        <h1 className="text-white text-2xl font-extrabold">Hey {seller.shortName} 👋</h1>
        <div className="flex items-center gap-3 mt-3">
          <PointsPill points={points} size="lg" />
          <TierBadge tier={seller.tier} size="md" />
        </div>
        {nextTier && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>
              <span>{seller.tier}</span>
              <span>{nextTier.tier} at {nextTier.pointsNeeded.toLocaleString("en-IN")} pts</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Today's Packs", value: todayUnits, sub: `${todaySales.length} sales logged`, icon: ShoppingBag },
            { label: "Total This Week", value: totalUnits, sub: "packs sold", icon: TrendingUp },
            { label: "Day", value: `${DAYS_IN}/7`, sub: "of First Win window", icon: Clock },
            { label: "Points", value: points.toLocaleString("en-IN"), sub: seller.tier, icon: Zap },
          ].map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={13} style={{ color: "#FF6900" }} />
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#9C8870" }}>{label}</p>
              </div>
              <p className="text-xl font-black" style={{ color: "#1A1200" }}>{value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#9C8870" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Momentum */}
        <MomentumCard streak={streak} />

        {/* Log Sale CTA */}
        <Link
          href="/log-sale"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
        >
          <Zap size={20} fill="white" />
          Log a Sale — Earn Points
        </Link>

        {/* Risk Meter + Foundation Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RiskMeter sales={arjunSales} />
          <FoundationTracker sales={arjunSales} />
        </div>

        {/* Level Up Banner — only visible when near sold-out */}
        <LevelUpBanner remainingStock={remainingStock} starterPackage={state.starterPackage} />

        {/* Journey */}
        <JourneyCard totalUnits={totalUnits} />

        {/* Weekly Route */}
        <WeeklyRouteCard />

        {/* Smart Bundle + Repeat Customer: 2-col on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SmartBundleCard channel={topChannel} />
          <RepeatCustomerCard sales={arjunSales} />
        </div>

        {/* Week Chart + Squad: 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeekChart sales={arjunSales} />
          <SquadSupport />
        </div>

        {/* Reorder + Territory: 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ReorderCard sales={arjunSales} packageUnits={packageUnits} />
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF3E6" }}>
                <MapPin size={18} style={{ color: "#FF6900" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "#1A1200" }}>My Territory</p>
                <p className="text-xs" style={{ color: "#9C8870" }}>Andheri · Your zone</p>
              </div>
              <Link href="/territory" className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: "#FFF3E6", color: "#FF6900" }}>
                View →
              </Link>
            </div>
            <div className="px-4 pb-3 space-y-1.5">
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: "#dcfce7", color: "#15803d" }}>🟢 Your zone</span>
                <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#F0E6D8", color: "#6B5B45" }}>Low saturation</span>
                <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#F0E6D8", color: "#6B5B45" }}>Room to grow</span>
              </div>
              <p className="text-xs" style={{ color: "#9C8870" }}>Andheri gyms have strong demand and room for you — this zone is yours.</p>
              {stageIdx >= 1 ? (
                <div className="rounded-lg px-2.5 py-1.5 text-xs" style={{ background: "#dcfce7", color: "#15803d" }}>
                  <span className="font-bold">New zone unlocked:</span> Versova — low saturation, gym demand.
                </div>
              ) : (
                <p className="text-[10px]" style={{ color: "#9C8870" }}>
                  💡 Hit your First Win → Versova (second zone) unlocks
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tier perks */}
        <div className={`rounded-2xl p-4 ${tierCfg.bg}`}>
          <p className={`text-xs font-bold uppercase tracking-wide ${tierCfg.color} mb-2`}>
            {tierCfg.emoji} Your {seller.tier} Perks
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
            {tierCfg.perks.map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm" style={{ color: "#1A1200" }}>
                <CheckCircle size={12} className="text-green-500 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Ask AI card */}
        <button
          onClick={() => setAiOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all active:scale-[0.98]"
          style={{ background: "#1A1200" }}
        >
          <MessageCircle size={20} className="text-white shrink-0" />
          <div className="flex-1 text-left">
            <p className="font-bold text-white text-sm">Ask your AI Mentor anything</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Timing, route, bundles, territory — ask away</p>
          </div>
          <ArrowRight size={16} className="text-white/60" />
        </button>
      </div>

      {aiOpen && <AskAIModal onClose={() => setAiOpen(false)} />}
    </div>
  );
}
