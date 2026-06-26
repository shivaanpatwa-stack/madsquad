"use client";
import { useMemo } from "react";
import { useApp } from "@/store/AppContext";
import { TIER_CONFIG, getNextTier } from "@/lib/sellers";
import { runCoach } from "@/lib/coach";
import { SKUS } from "@/lib/skus";
import type { SaleRecord } from "@/lib/sales";
import TierBadge from "@/components/ui/TierBadge";
import PointsPill from "@/components/ui/PointsPill";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Zap, TrendingUp, ShoppingBag, ArrowRight,
  GraduationCap, Dumbbell, Coffee, Building2,
  Train, BookOpen, Heart,
} from "lucide-react";

const CHANNEL_ICONS: Record<string, LucideIcon> = {
  School:            GraduationCap,
  College:           BookOpen,
  Gym:               Dumbbell,
  Café:              Coffee,
  "Corporate Office": Building2,
  Hospital:          Heart,
  "Vending Machine": ShoppingBag,
  "Metro Stall":     Train,
};

const TODAY = new Date("2026-06-27");
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function dayOffset(d: Date): number {
  const t0 = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()).getTime();
  const t1 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((t0 - t1) / 86400000);
}

// ── Section A — Weekly bar chart ─────────────────────────────────────────────
function WeeklyBarChart({ sales }: { sales: SaleRecord[] }) {
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(TODAY);
      d.setDate(d.getDate() - 6 + i);
      return d;
    }), []);

  const barData = useMemo(() =>
    days.map((d) => ({
      label: DAY_LABELS[d.getDay()],
      units: sales
        .filter((s) => isSameDay(new Date(s.timestamp), d))
        .reduce((sum, s) => sum + s.units, 0),
      isToday: isSameDay(d, TODAY),
    })), [days, sales]);

  const lastWeekTotal = useMemo(() => {
    const lwDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(TODAY);
      d.setDate(d.getDate() - 13 + i);
      return d;
    });
    return lwDays.reduce((sum, d) =>
      sum + sales.filter((s) => isSameDay(new Date(s.timestamp), d)).reduce((u, s) => u + s.units, 0), 0);
  }, [sales]);

  const thisWeekTotal = barData.reduce((sum, d) => sum + d.units, 0);
  const maxUnits = Math.max(...barData.map((d) => d.units), 1);
  const trendUp = thisWeekTotal >= lastWeekTotal;
  const trendDiff = Math.abs(thisWeekTotal - lastWeekTotal);
  const CHART_H = 88;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold" style={{ color: "#1A1200" }}>This Week's Sales</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          vs last week
        </span>
      </div>

      <div className="flex items-end gap-1.5 px-1" style={{ height: `${CHART_H + 34}px` }}>
        {barData.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <span className="text-[9px] font-bold" style={{ color: "#1A1200", minHeight: "13px" }}>
              {bar.units > 0 ? bar.units : ""}
            </span>
            <div className="w-full flex items-end" style={{ height: `${CHART_H}px` }}>
              <div
                className="w-full rounded-t"
                style={{
                  height: `${Math.max(3, (bar.units / maxUnits) * CHART_H)}px`,
                  background: bar.isToday ? "#FFB800" : "#FF6900",
                  transformOrigin: "bottom",
                  animation: `bar-grow 0.5s ease-out ${i * 50}ms both`,
                }}
              />
            </div>
            <span className="text-[9px]" style={{ color: "#6B5B45" }}>{bar.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid #F0E6D8" }}>
        <span className="text-xs font-semibold" style={{ color: "#1A1200" }}>
          Total: {thisWeekTotal} units
        </span>
        <span className={`text-xs font-bold ${trendUp ? "text-green-600" : "text-red-500"}`}>
          {trendUp ? "↑" : "↓"} {trendDiff} units vs last week
        </span>
      </div>
    </div>
  );
}

// ── Section B — Week comparison ───────────────────────────────────────────────
function WeekComparison({ sales }: { sales: SaleRecord[] }) {
  const thisWeek = useMemo(() => {
    const s = sales.filter((x) => dayOffset(new Date(x.timestamp)) <= 6);
    return { units: s.reduce((a, x) => a + x.units, 0), value: s.reduce((a, x) => a + x.value, 0) };
  }, [sales]);

  const lastWeek = useMemo(() => {
    const s = sales.filter((x) => { const o = dayOffset(new Date(x.timestamp)); return o >= 7 && o <= 13; });
    return { units: s.reduce((a, x) => a + x.units, 0), value: s.reduce((a, x) => a + x.value, 0) };
  }, [sales]);

  const pctChange = lastWeek.value > 0
    ? Math.round(((thisWeek.value - lastWeek.value) / lastWeek.value) * 100)
    : 100;
  const better = pctChange >= 0;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 shadow-sm" style={{ background: "#FFF3E6", border: "1px solid #F0E6D8" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>This Week</p>
          <p className="text-2xl font-black mt-1" style={{ color: "#FF6900" }}>
            ₹{thisWeek.value.toLocaleString("en-IN")}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#6B5B45" }}>{thisWeek.units} units</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>Last Week</p>
          <p className="text-2xl font-black mt-1" style={{ color: "#1A1200" }}>
            ₹{lastWeek.value.toLocaleString("en-IN")}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#6B5B45" }}>{lastWeek.units} units</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 py-1">
        <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${better ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {better ? "↑" : "↓"} {Math.abs(pctChange)}%
        </span>
        <span className="text-xs font-semibold" style={{ color: "#6B5B45" }}>
          {better ? "Crazy good!" : "Let's push harder"}
        </span>
      </div>
    </div>
  );
}

// ── Section C — Top 5 SKUs ───────────────────────────────────────────────────
function TopSKUs({ sales }: { sales: SaleRecord[] }) {
  const topSkus = useMemo(() => {
    const byId: Record<string, number> = {};
    sales.forEach((s) => { byId[s.skuId] = (byId[s.skuId] ?? 0) + s.units; });
    return Object.entries(byId)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skuId, units]) => {
        const sku = SKUS.find((s) => s.id === skuId);
        return { skuId, units, name: sku?.shortName ?? skuId, emoji: sku?.emoji ?? "📦", color: sku?.color ?? "bg-gray-400" };
      });
  }, [sales]);

  const maxUnits = topSkus[0]?.units ?? 1;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>
        Your Top Sellers
      </p>
      <div className="space-y-3">
        {topSkus.map((sku, i) => (
          <div key={sku.skuId} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
              style={{ background: i === 0 ? "#FFB800" : "#F0E6D8", color: i === 0 ? "#1A1200" : "#6B5B45" }}
            >
              {i + 1}
            </div>
            <span className="text-base shrink-0">{sku.emoji}</span>
            <span className="text-xs font-semibold shrink-0 w-28 truncate" style={{ color: "#1A1200" }}>
              {sku.name}
            </span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
              <div
                className={`h-full rounded-full ${sku.color}`}
                style={{ width: `${(sku.units / maxUnits) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold shrink-0 w-8 text-right" style={{ color: "#1A1200" }}>
              {sku.units}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section D — Sales by Channel ─────────────────────────────────────────────
function ChannelBreakdown({ sales }: { sales: SaleRecord[] }) {
  const channels = useMemo(() => {
    const byCh: Record<string, number> = {};
    sales.forEach((s) => { byCh[s.channel] = (byCh[s.channel] ?? 0) + s.units; });
    const total = Object.values(byCh).reduce((a, u) => a + u, 0);
    return Object.entries(byCh)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([channel, units]) => ({
        channel,
        units,
        pct: total > 0 ? Math.round((units / total) * 100) : 0,
      }));
  }, [sales]);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>
        Where You&apos;re Selling
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {channels.map((ch, i) => {
          const Icon = (CHANNEL_ICONS[ch.channel] ?? ShoppingBag) as LucideIcon;
          const shortLabel = ch.channel
            .replace(" Office", "")
            .replace(" Machine", "")
            .replace(" Stall", "");
          return (
            <div
              key={ch.channel}
              className={`shrink-0 bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center gap-1 min-w-[76px] chan-${i}`}
              style={{ border: "1px solid #F0E6D8" }}
            >
              <Icon size={20} style={{ color: "#FF6900" }} />
              <p className="text-[10px] font-bold text-center leading-tight" style={{ color: "#1A1200" }}>
                {shortLabel}
              </p>
              <p className="text-lg font-black" style={{ color: "#FF6900" }}>{ch.units}</p>
              <p className="text-[9px]" style={{ color: "#6B5B45" }}>{ch.pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section E — Customer loyalty split ───────────────────────────────────────
function LoyaltySplit({ sales }: { sales: SaleRecord[] }) {
  const { repeatPct, newPct } = useMemo(() => {
    const total = sales.length;
    const repeat = sales.filter((s) => s.repeatCustomer).length;
    return {
      repeatPct: total > 0 ? Math.round((repeat / total) * 100) : 0,
      newPct:    total > 0 ? Math.round(((total - repeat) / total) * 100) : 0,
    };
  }, [sales]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>
        Your Buyers
      </p>
      <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: "#F0E6D8" }}>
        <div className="h-full rounded-full" style={{ width: `${repeatPct}%`, background: "#FF6900" }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-2xl font-black" style={{ color: "#FF6900" }}>{repeatPct}%</p>
          <p className="text-xs font-bold" style={{ color: "#1A1200" }}>Repeat Buyers</p>
          <p className="text-[10px]" style={{ color: "#6B5B45" }}>Keep them coming!</p>
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: "#9C8870" }}>{newPct}%</p>
          <p className="text-xs font-bold" style={{ color: "#1A1200" }}>New Buyers</p>
          <p className="text-[10px]" style={{ color: "#6B5B45" }}>Great reach</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { state } = useApp();
  const { seller, points } = state;
  const tierCfg = TIER_CONFIG[seller.tier];
  const nextTier = getNextTier(seller.tier);
  const progress = nextTier
    ? Math.min(100, ((points - tierCfg.minPoints) / (nextTier.pointsNeeded - tierCfg.minPoints)) * 100)
    : 100;

  const { todayMove } = runCoach("seller-01");

  const riyaSales = useMemo(
    () => state.sales.filter((s) => s.sellerId === "seller-01"),
    [state.sales]
  );

  const todaySales = riyaSales.filter((s) => isSameDay(new Date(s.timestamp), TODAY));
  const todayUnits = todaySales.reduce((t, s) => t + s.units, 0);
  const todayValue = todaySales.reduce((t, s) => t + s.value, 0);

  return (
    <div className="min-h-screen md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
      {/* Header */}
      <div
        className="px-5 pt-10 pb-6"
        style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>
          Aaj kitna becha? 🌶️
        </p>
        <h1 className="text-white text-2xl font-extrabold">Hey {seller.shortName} 👋</h1>
        <div className="flex items-center gap-3 mt-4">
          <PointsPill points={points} size="lg" />
          <TierBadge tier={seller.tier} size="md" />
        </div>
        {nextTier && (
          <div className="mt-4">
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

      <div className="px-4 py-4 space-y-4">
        {/* Today stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
            <p className="text-xs font-medium" style={{ color: "#9C8870" }}>Today&apos;s Units</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#1A1200" }}>{todayUnits}</p>
            <div className="flex items-center gap-1 mt-1">
              <ShoppingBag size={12} style={{ color: "#FF6900" }} />
              <span className="text-xs font-medium" style={{ color: "#FF6900" }}>{todaySales.length} sales logged</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
            <p className="text-xs font-medium" style={{ color: "#9C8870" }}>Today&apos;s Value</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#1A1200" }}>₹{todayValue}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-green-500" />
              <span className="text-xs font-medium text-green-600">Crazy good!</span>
            </div>
          </div>
        </div>

        {/* Coach tip */}
        <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{todayMove.emoji}</span>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#FF6900" }}>Today&apos;s Move</p>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#1A1200" }}>{todayMove.title}</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B5B45" }}>{todayMove.body}</p>
          <Link href="/coach" className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: "#FF6900" }}>
            See all tips <ArrowRight size={12} />
          </Link>
        </div>

        {/* Log Sale CTA */}
        <Link
          href="/log-sale"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
        >
          <Zap size={20} fill="white" />
          Log a Sale — Earn Points
        </Link>

        {/* Streak */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3" style={{ border: "1px solid #F0E6D8" }}>
          <span className="text-2xl animate-streak-pulse">🔥</span>
          <div>
            <p className="font-bold" style={{ color: "#1A1200" }}>
              🔥 {state.streak}-day streak! Mat rukna!
            </p>
            <p className="text-xs" style={{ color: "#6B5B45" }}>Log a sale today to keep it alive</p>
          </div>
        </div>

        {/* Tier perks */}
        <div className={`rounded-2xl p-4 ${tierCfg.bg}`}>
          <p className={`text-xs font-bold uppercase tracking-wide ${tierCfg.color} mb-2`}>
            {tierCfg.emoji} Your {seller.tier} Perks
          </p>
          <ul className="space-y-1">
            {tierCfg.perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm" style={{ color: "#1A1200" }}>
                <span className="text-green-500">✓</span> {p}
              </li>
            ))}
          </ul>
        </div>

        {/* ── NEW SECTIONS ── */}

        {/* A — Weekly bar chart */}
        <WeeklyBarChart sales={riyaSales} />

        {/* B — This week vs last week */}
        <WeekComparison sales={riyaSales} />

        {/* C — Top 5 SKUs */}
        <TopSKUs sales={riyaSales} />

        {/* D — Sales by channel */}
        <ChannelBreakdown sales={riyaSales} />

        {/* E — Customer loyalty */}
        <LoyaltySplit sales={riyaSales} />

        {/* F — My Territory teaser */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #F0E6D8" }}>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF3E6" }}>
              <span className="text-lg">📍</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: "#1A1200" }}>My Territory</p>
              <p className="text-xs" style={{ color: "#9C8870" }}>Bandra · No-competition zone</p>
            </div>
            <a
              href="/territory"
              className="text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background: "#FFF3E6", color: "#FF6900" }}
            >
              View →
            </a>
          </div>
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: "#dcfce7", color: "#15803d" }}>🟢 Healthy</span>
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#F0E6D8", color: "#6B5B45" }}>2 white-space zones nearby</span>
            </div>
          </div>
        </div>

        {/* G — New seller First Win demo card */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "2px solid #FF6900", background: "#FFF8F0" }}>
          <div className="px-4 py-3" style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}>
            <p className="text-[10px] font-black uppercase tracking-wider text-white/80">New Seller Feature Preview</p>
            <p className="text-sm font-extrabold text-white mt-0.5">7-Day First Win Guarantee 🎯</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs" style={{ color: "#6B5B45" }}>
              Arjun just joined. His AI-generated first mission is ready — exact venue, SKU, time window, and opening line.
            </p>
            <div className="rounded-xl px-3 py-2" style={{ background: "white", border: "1px solid #F0E6D8" }}>
              <p className="text-[10px] font-bold" style={{ color: "#FF6900" }}>📍 WHERE: Gold's Gym, Andheri West</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#9C8870" }}>Flamin' Fun Puffs · 7–9 AM · Target: 10 packs</p>
            </div>
            <a
              href="/onboarding"
              className="block w-full py-2.5 rounded-xl font-bold text-white text-sm text-center active:scale-95 transition-transform"
              style={{ background: "#1A1200" }}
            >
              See Arjun's Full Mission →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
