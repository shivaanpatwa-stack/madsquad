"use client";
import { useMemo } from "react";
import { useApp } from "@/store/AppContext";
import { SKUS } from "@/lib/skus";
import { calcPointsForSale } from "@/lib/points";
import { BarChart2, TrendingUp, Package, Zap } from "lucide-react";

const PACKAGE_COST = 500;

// ── Bar chart primitive ────────────────────────────────────────────────────
function BarChart({
  bars,
  color,
  height = 100,
  labelKey,
}: {
  bars: { label: string; value: number; sub?: string }[];
  color: string;
  height?: number;
  labelKey?: string;
}) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height: height + 36 }}>
      {bars.map((b, i) => {
        const pct = b.value / max;
        const barH = Math.max(4, Math.round(pct * height));
        return (
          <div key={`${labelKey ?? ""}${i}`} className="flex flex-col items-center flex-1 gap-1">
            <p className="text-[9px] font-bold" style={{ color: "#9C8870" }}>
              {b.value > 0 ? b.value : ""}
            </p>
            <div className="w-full rounded-t-lg transition-all duration-700"
              style={{ height: barH, background: color, minWidth: 6 }} />
            <p className="text-[9px] font-semibold text-center leading-tight" style={{ color: "#9C8870", maxWidth: 32 }}>
              {b.sub ?? b.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut / pie segment for channel mix ───────────────────────────────────
function ChannelPie({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  let cumulative = 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" style={{ width: 110, height: 110 }}>
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const offset = -((cumulative / 100) * circ) + circ * 0.25;
        cumulative += seg.pct;
        return (
          <circle
            key={i}
            cx="50" cy="50" r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="28"
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={offset}
          />
        );
      })}
      <circle cx="50" cy="50" r="22" fill="white" />
      <text x="50" y="47" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1A1200">Mix</text>
    </svg>
  );
}

// Stat card
function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl text-center" style={{ background: "white", border: "1px solid #F0E6D8", padding: "16px 8px" }}>
      <p className="font-black text-2xl leading-none" style={{ color: accent ?? "#1A1200" }}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide mt-1.5" style={{ color: "#9C8870" }}>{label}</p>
      {sub && <p className="text-[9px] mt-0.5" style={{ color: "#C0B090" }}>{sub}</p>}
    </div>
  );
}

// Section header
function SectionHeader({ icon: Icon, title, sub }: { icon: typeof BarChart2; title: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF3E6" }}>
        <Icon size={16} style={{ color: "#FF6900" }} />
      </div>
      <div>
        <p className="font-black text-sm" style={{ color: "#1A1200" }}>{title}</p>
        {sub && <p className="text-xs" style={{ color: "#9C8870" }}>{sub}</p>}
      </div>
    </div>
  );
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY = new Date("2026-06-27");

function dayOfWeekIdx(d: Date) {
  return (d.getDay() + 6) % 7; // Monday = 0
}

export default function AnalyticsPage() {
  const { state } = useApp();
  const { sales: allSales, seller, points, referrals } = state;
  const mySales = useMemo(() => allSales.filter((s) => s.sellerId === seller.id), [allSales, seller.id]);

  // 7-day daily units
  const last7 = useMemo(() => {
    const bins = Array(7).fill(0);
    mySales.forEach((s) => {
      const diffMs = TODAY.getTime() - new Date(s.timestamp).getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffDays >= 0 && diffDays < 7) {
        bins[6 - diffDays] += s.units;
      }
    });
    return bins;
  }, [mySales]);

  const last7Bars = last7.map((v, i) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), value: v, sub: d.toLocaleDateString("en-IN", { weekday: "short" }) };
  });

  // 30-day weekly units (4 buckets)
  const last30Weekly = useMemo(() => {
    const bins = [0, 0, 0, 0];
    mySales.forEach((s) => {
      const diffMs = TODAY.getTime() - new Date(s.timestamp).getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffDays >= 0 && diffDays < 28) {
        const wk = Math.floor(diffDays / 7);
        bins[3 - wk] += s.units;
      }
    });
    return bins;
  }, [mySales]);

  const weekBars = last30Weekly.map((v, i) => ({
    label: `Wk ${i + 1}`, value: v, sub: `W${i + 1}`,
  }));

  // Pack recovery
  const totalValue = mySales.reduce((s, r) => s + r.value, 0);
  const recoveryPct = Math.min(100, Math.round((totalValue / PACKAGE_COST) * 100));

  // Points growth (simulated weekly)
  const pointsGrowthBars = [
    { label: "W1", value: 80, sub: "W1" },
    { label: "W2", value: 180, sub: "W2" },
    { label: "W3", value: 320, sub: "W3" },
    { label: "W4", value: points, sub: "Now" },
  ];

  // Top SKUs
  const skuMap = useMemo(() => {
    const m: Record<string, number> = {};
    mySales.forEach((s) => { m[s.skuId] = (m[s.skuId] ?? 0) + s.units; });
    return m;
  }, [mySales]);
  const topSkus = Object.entries(skuMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, units]) => ({ sku: SKUS.find((s) => s.id === id), units }))
    .filter((x) => x.sku);

  // Channel mix
  const channelMap = useMemo(() => {
    const m: Record<string, number> = {};
    mySales.forEach((s) => { m[s.channel] = (m[s.channel] ?? 0) + s.units; });
    return m;
  }, [mySales]);
  const totalUnits = mySales.reduce((s, r) => s + r.units, 0);
  const CHANNEL_COLORS: Record<string, string> = {
    Gym: "#FF6900", College: "#7C3AED", Café: "#16A34A",
    Hospital: "#0EA5E9", "Metro Stall": "#FFB800", "Corporate Office": "#DC2626",
  };
  const channelSegments = Object.entries(channelMap)
    .map(([ch, v]) => ({ label: ch, pct: Math.round((v / totalUnits) * 100), color: CHANNEL_COLORS[ch] ?? "#9C8870" }))
    .sort((a, b) => b.pct - a.pct);

  // Referrals over time (simplified bins)
  const refBars = [
    { label: "W1", value: 0, sub: "W1" },
    { label: "W2", value: 1, sub: "W2" },
    { label: "W3", value: 2, sub: "W3" },
    { label: "Now", value: referrals.length, sub: "Now" },
  ];

  // Avg daily
  const totalDaysActive = 5;
  const avgDaily = totalUnits > 0 ? (totalUnits / totalDaysActive).toFixed(1) : "0";

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* Header */}
      <div style={{ background: "#1A1200", padding: "48px 20px 24px" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF6900" }}>Analytics</p>
        <h1 className="text-white font-black leading-tight" style={{ fontSize: 26, letterSpacing: "-0.01em" }}>
          {seller.shortName}&apos;s Stats
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Day 5 of your MadSquad journey
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Total Packs" value={`${totalUnits}`} sub="sold" accent="#FF6900" />
          <StatCard label="Recovered" value={`₹${totalValue}`} sub="of ₹500" />
          <StatCard label="Points" value={points.toLocaleString("en-IN")} />
          <StatCard label="Avg/Day" value={avgDaily} sub="packs" />
        </div>

        {/* 7-day daily chart */}
        <div className="rounded-2xl" style={{ background: "white", border: "1px solid #F0E6D8", padding: "18px 20px" }}>
          <SectionHeader icon={BarChart2} title="Last 7 Days" sub="Daily packs sold" />
          <BarChart bars={last7Bars} color="#FF6900" height={90} labelKey="7d" />
        </div>

        {/* 4-week chart */}
        <div className="rounded-2xl" style={{ background: "white", border: "1px solid #F0E6D8", padding: "18px 20px" }}>
          <SectionHeader icon={TrendingUp} title="Weekly Trend" sub="Packs per week (last 4 weeks)" />
          <BarChart bars={weekBars} color="#7C3AED" height={90} labelKey="wk" />
        </div>

        {/* Pack recovery */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <div style={{ padding: "18px 20px 12px" }}>
            <SectionHeader icon={Package} title="Pack Recovery" sub={`₹${totalValue} of ₹${PACKAGE_COST} buy-back window`} />
          </div>
          <div style={{ padding: "0 20px 18px" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold" style={{ color: "#6B5B45" }}>₹{totalValue} recovered</p>
              <p className="text-xs font-black" style={{ color: recoveryPct >= 100 ? "#22c55e" : "#FF6900" }}>{recoveryPct}%</p>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${recoveryPct}%`, background: recoveryPct >= 100 ? "#22c55e" : "linear-gradient(90deg, #FF6900, #FFB800)" }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#9C8870" }}>
              {recoveryPct >= 100 ? "Fully recovered — guarantee no longer needed 🎉" : `₹${PACKAGE_COST - totalValue} more to fully recover`}
            </p>
          </div>
        </div>

        {/* Points growth */}
        <div className="rounded-2xl" style={{ background: "white", border: "1px solid #F0E6D8", padding: "18px 20px" }}>
          <SectionHeader icon={Zap} title="Points Growth" sub="Cumulative points over time" />
          <BarChart bars={pointsGrowthBars} color="#FFB800" height={90} labelKey="pts" />
        </div>

        {/* Top SKUs */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <div style={{ padding: "18px 20px 12px" }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "#1A1200" }}>Top SKUs</p>
            <p className="text-xs" style={{ color: "#9C8870" }}>Your best-selling products</p>
          </div>
          {topSkus.map(({ sku, units }, i) => {
            if (!sku) return null;
            const maxUnits = topSkus[0]?.units ?? 1;
            const pct = Math.round((units / maxUnits) * 100);
            return (
              <div key={sku.id} className="flex items-center gap-3 px-5 py-3"
                style={{ borderTop: "1px solid #F0E6D8" }}>
                <span style={{ fontSize: 20, width: 28 }}>{sku.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "#1A1200" }}>{sku.shortName}</p>
                  <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: "#F0E6D8" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#FF6900" }} />
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className="font-black text-sm" style={{ color: "#1A1200" }}>{units}</p>
                  <p className="text-[9px]" style={{ color: "#9C8870" }}>packs</p>
                </div>
                {i === 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "#FF6900", color: "white" }}>🔥 #1</span>}
              </div>
            );
          })}
        </div>

        {/* Channel mix */}
        <div className="rounded-2xl" style={{ background: "white", border: "1px solid #F0E6D8", padding: "18px 20px" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "#1A1200" }}>Channel Mix</p>
          <p className="text-xs mb-4" style={{ color: "#9C8870" }}>Where your packs are going</p>
          <div className="flex items-center gap-6">
            <ChannelPie segments={channelSegments} />
            <div className="flex-1 space-y-2">
              {channelSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                  <p className="text-xs flex-1 font-medium" style={{ color: "#1A1200" }}>{seg.label}</p>
                  <p className="text-xs font-black" style={{ color: "#1A1200" }}>{seg.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Referrals */}
        <div className="rounded-2xl" style={{ background: "white", border: "1px solid #F0E6D8", padding: "18px 20px" }}>
          <SectionHeader icon={TrendingUp} title="Referrals Over Time" sub="Community builder growth" />
          <BarChart bars={refBars} color="#7C3AED" height={80} labelKey="ref" />
          <p className="text-xs mt-2" style={{ color: "#9C8870" }}>
            {referrals.length} total referral{referrals.length !== 1 ? "s" : ""} · {referrals.reduce((s, r) => s + r.pointsEarned, 0)} recognition pts
          </p>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
