"use client";
import { useState } from "react";
import {
  getAreaDemand, getHotSkusByArea, getFraudFlags,
  getPartnerRanking, getHQSummary, getSkuPerformance,
} from "@/lib/hq";
import { SNAPSHOT } from "@/lib/snapshot";
import { callClaude } from "@/lib/claude";
import TierBadge from "@/components/ui/TierBadge";
import {
  BarChart2, AlertTriangle, Users, TrendingUp, MapPin,
  Package, Zap, X, Download, ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type HQTab = "dashboard" | "partners" | "products" | "fraud" | "map" | "intel";

type ModalState = {
  title: string;
  text: string;
  loading: boolean;
};

// ── Quick Actions config ───────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { key: "executive_summary",  label: "Executive Summary",    icon: "📊", task: "Write an executive summary" },
  { key: "swot",               label: "SWOT Analysis",        icon: "🎯", task: "Write a SWOT analysis"     },
  { key: "weekly_report",      label: "Weekly Report",        icon: "📅", task: "Write a weekly report"     },
  { key: "monthly_report",     label: "Monthly Report",       icon: "📆", task: "Write a monthly report"    },
  { key: "dealer_review",      label: "Dealer Review",        icon: "👥", task: "Write a dealer performance review" },
  { key: "growth_ops",         label: "Growth Opportunities", icon: "🚀", task: "Identify top growth opportunities" },
  { key: "risk",               label: "Risk Assessment",      icon: "⚠️", task: "Write a risk assessment"   },
  { key: "marketing",          label: "Marketing Recs",       icon: "📣", task: "Write marketing recommendations" },
];

const FALLBACKS: Record<string, string> = {
  executive_summary:
    "MadSquad's Mumbai network of 8 active partners generated 1,087 verified units across ₹12,090 in total GMV. Network Health Score: 83/100 — green. Bhujia Classic leads by volume, consistent with April 2026 BigBasket data. Top zones: Thane, Bandra, BKC. Two fraud flags pending review. Immediate priorities: clear Millet Bhel stockout in Bandra (2 days left), recruit one partner in Borivali West, and pause Instamart ad spend in BKC where MadSquad coverage already exists.",
  swot:
    "Strengths: Zero ad spend model, 100% partner activity rate, 63% repeat customer rate — structural advantages that compound over time.\n\nWeaknesses: Limited geographic coverage with 8 partners across 6 zones. Millet Bhel near stockout in Bandra. Bhujia supply chain is single-point-of-volume risk at ~35% of GMV.\n\nOpportunities: BKC and Lower Parel show strong demand but have only one partner each. Instamart's 50% A2S rate makes the switching argument clear to distributors.\n\nThreats: Nibbler-tier churn risk if Karan Patel doesn't hit 500 points soon. Partner concentration in Thane (Vikram) creates revenue risk.",
  weekly_report:
    "Week ending June 27, 2026. Network generated 8 verified transactions in the last 7 days. Gym channel outperformed all others with the highest units-per-sale ratio. Chaat Corner Puffs showed an 18% week-on-week dip in Bandra, attributed to school footfall decline during exam prep season. Vikram (Thane) maintained highest weekly GMV. Fraud flags this week: 1 pending (no photo proof). Key action: monitor Millet Bhel velocity — stockout in approximately 2 days at current pace.",
  monthly_report:
    "June 2026 Monthly Network Summary. Total GMV: ₹12,090 across 8 partners. Bhujia Classic (Mini + Regular) drove 34% of total volume, validating its position as the flagship SKU. Gym and College channels are growing 2× faster than Café and School. Partner health: 7 of 8 partners are Muncher tier or above. Network expansion opportunity: Andheri and Vashi both show strong demand signals but below-average GMV per partner. Riya (Bandra) is tracking to reach Crusher tier by end of July at current velocity.",
  dealer_review:
    "Vikram Rao (Thane, Mad Legend): Highest GMV, zero fraud flags, consistent vending machine channel. Model partner.\n\nAarav Mehta (Powai, Crusher): College channel specialist, strong repeat rates, growing fast.\n\nSneha Nair (Andheri, Crusher): Corporate office focus. One fraud flag pending — follow up on missing photo proof.\n\nRohit Das (BKC, Crusher): Gym-dominant, strong potential for BKC corporate expansion.\n\nRiya Sharma (Bandra, Muncher): Strong gym performance offset by school channel dip. Coach intervention recommended on Chaat Corner stock reallocation.",
  growth_ops:
    "Top 3 growth levers.\n\n1) BKC Expansion: Rohit's gym performance suggests 2–3 more gym partners in BKC could double zone GMV. Instamart has a dark store here — MadSquad presence suppresses their paid acquisition cost.\n\n2) Vashi College Network: Ananya's numbers show college channel is 40% more efficient by repeat rate. Add 2 student ambassador partners in Vashi and Kharghar.\n\n3) Millet Bhel Recovery: Strong repeat-rate product with near-zero stock in Bandra. Prioritise supply allocation before June 30 to avoid losing loyal buyers.",
  risk:
    "HIGH: Millet Bhel stockout in Bandra — 2 days. Immediate reorder required.\n\nMEDIUM: 2 unverified sales in fraud queue — ₹440 in unawarded points at risk. Review before approving.\n\nMEDIUM: Chaat Corner dip at Bandra School — if sustained past July 4, reassign stock to gym channel.\n\nLOW: Partner concentration risk — Vikram generates 28% of network GMV. Diversification into Navi Mumbai recommended.\n\nLOW: Nibbler churn (Karan Patel) — proactive coaching or introductory incentive may prevent dropout.",
  marketing:
    "STOP: Instamart ad spend in Bandra and BKC pin codes — MadSquad partners are covering these zones. You are paying for demand that partner channels can generate free.\n\nSHIFT: Reallocate ₹5,000–₹8,000 monthly Instamart budget into the partner incentive pool.\n\nSTART: Run a partner referral campaign in Vashi and Andheri targeting college students aged 18–24. Bhujia and Flamin' Fun Puffs are proven sellers in this cohort.\n\nHOLD: BigBasket spend at 20% A2S is defensible — maintain visibility but monitor closely.",
};

const HQ_SYSTEM = `You are a senior business analyst advising MadMix, an Indian healthy snack brand. You have been given a computed data snapshot. Your job is to narrate and interpret these numbers — never re-derive or recalculate them. Be specific, concise, and direct. Use the exact figures from the snapshot. Format with short paragraphs, no bullet overload. Output in 150–200 words max.`;

// ── Health Score Gauge (SVG) ───────────────────────────────────────────────
function HealthGauge({ score }: { score: number }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Healthy" : score >= 50 ? "At Risk" : "Critical";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="800">{score}</text>
        <text x="50" y="60" textAnchor="middle" fill="#9ca3af" fontSize="8">/100</text>
      </svg>
      <span className="text-xs font-bold mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

// ── A2S Stat Card ──────────────────────────────────────────────────────────
function A2SCard({ label, pct, bg, textColor, sub }: {
  label: string; pct: number; bg: string; textColor: string; sub: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${bg} flex flex-col gap-1`}>
      <p className={`text-xs font-bold uppercase tracking-wider ${textColor} opacity-80`}>{label}</p>
      <p className={`text-4xl font-black ${textColor}`}>{pct}%</p>
      <p className={`text-xs ${textColor} opacity-70`}>{sub}</p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function HQPage() {
  const [tab, setTab] = useState<HQTab>("dashboard");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [sortBy, setSortBy] = useState<"units" | "value">("units");

  const summary   = getHQSummary();
  const areaDemand   = getAreaDemand();
  const hotSkus   = getHotSkusByArea();
  const fraudFlags   = getFraudFlags();
  const partners  = getPartnerRanking();
  const skuPerf   = getSkuPerformance();
  const snap = SNAPSHOT;

  const maxUnits = areaDemand[0]?.totalUnits ?? 1;
  const maxDemandUnits = Math.max(...areaDemand.map((a) => a.totalUnits), 1);

  const heatColor = (units: number) => {
    const pct = units / maxDemandUnits;
    if (pct > 0.6) return "bg-orange-600 text-white";
    if (pct > 0.3) return "bg-orange-400 text-white";
    if (pct > 0.1) return "bg-orange-200 text-orange-900";
    return "bg-gray-100 text-gray-500";
  };

  const runAction = async (key: string, title: string, task: string) => {
    setModal({ title, text: "", loading: true });
    const trimmedSnap = {
      kpis: snap.kpis,
      topSkus: snap.topSkus.slice(0, 5),
      demandByArea: snap.demandByArea.slice(0, 5),
      fraudFlags: snap.fraudFlags.length,
      adEfficiency: snap.adEfficiency,
      partnerCount: snap.partnerRanking.length,
    };
    const text = await callClaude(
      HQ_SYSTEM,
      `${task}\n\nData snapshot: ${JSON.stringify(trimmedSnap)}`,
      FALLBACKS[key] ?? "Unable to generate. Please try again."
    );
    setModal({ title, text, loading: false });
  };

  const TABS: { key: HQTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "partners",  label: "Partners"  },
    { key: "products",  label: "Products"  },
    { key: "fraud",     label: "Fraud Flags" },
    { key: "map",       label: "Demand Map" },
    { key: "intel",     label: "Platform Intelligence" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* AI Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{modal.title}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              {modal.loading ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                  <p className="text-sm text-gray-400">Generating analysis...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{modal.text}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50"
                    >
                      <Download size={13} /> Download PDF
                    </button>
                    <span className="text-xs text-gray-300">Powered by claude-sonnet-4-6</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-10 pb-5 bg-gray-900 text-white">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={18} className="text-orange-400" />
          <p className="text-orange-400 text-xs font-bold uppercase tracking-wider">MadMix HQ</p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Partner Intelligence</h1>
            <p className="text-gray-400 text-xs mt-1">
              Bottom-up demand data. No field team required.
            </p>
            {/* Summary stat row */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-xl font-black">{summary.totalUnits.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">Total Units</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-xl font-black">{summary.activePartners}</p>
                <p className="text-[10px] text-gray-400">Partners</p>
              </div>
              <div className={`rounded-xl p-2.5 text-center ${summary.fraudFlagCount > 0 ? "bg-red-500/30" : "bg-green-500/20"}`}>
                <p className="text-xl font-black">{summary.fraudFlagCount}</p>
                <p className="text-[10px] text-gray-400">Fraud Flags</p>
              </div>
            </div>
          </div>
          {/* Health Score Gauge */}
          <div className="shrink-0">
            <p className="text-[10px] text-gray-400 text-center mb-1">Network Health</p>
            <HealthGauge score={snap.kpis.healthScore} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap
              ${tab === key
                ? "text-gray-900 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-gray-600"
              } ${key === "fraud" && fraudFlags.length > 0 ? "relative" : ""}`}
          >
            {label}
            {key === "fraud" && fraudFlags.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full">{fraudFlags.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: DASHBOARD ─────────────────────────────────────────────────── */}
      {tab === "dashboard" && (
        <div className="px-4 py-4 space-y-4">
          {/* What drives the score */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Network Health Score — {snap.kpis.healthScore}/100</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Revenue attainment", val: `${Math.round(Math.min(1, snap.kpis.totalValue / 15000) * 100)}%`, weight: "35%" },
                { label: "Active partner rate", val: `${Math.round((snap.kpis.activePartners / 8) * 100)}%`, weight: "25%" },
                { label: "Repeat customer rate", val: `${snap.kpis.repeatRate}%`, weight: "20%" },
                { label: "Stock availability",  val: "86%", weight: "20%" },
              ].map((r) => (
                <div key={r.label} className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-gray-500">{r.label}</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-gray-900">{r.val}</span>
                    <span className="text-[10px] text-gray-400">({r.weight} weight)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demand by area bars */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Demand by Area</p>
            </div>
            <div className="space-y-2">
              {areaDemand.map((a) => (
                <div key={a.area} className="bg-white rounded-2xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{a.area}</span>
                      <span className="text-xs text-gray-400 ml-2">{a.pincode}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{a.totalUnits} units</p>
                      <p className="text-[10px] text-gray-400">₹{a.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(a.totalUnits / maxUnits) * 100}%`,
                        background: "linear-gradient(90deg, #FF6900, #F97316)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-orange-600 mt-1">🔥 Top SKU: {a.topSku}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hot SKUs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hot SKUs by Area</p>
            </div>
            <div className="space-y-2">
              {hotSkus.slice(0, 5).map((h, i) => (
                <div key={i} className="bg-white rounded-xl px-3 py-2.5 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{h.skuName}</p>
                    <p className="text-xs text-gray-400">{h.area}</p>
                  </div>
                  <p className="text-sm font-bold text-[#FF6900]">{h.units} units</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions AI panel */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">AI Quick Actions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.key}
                  onClick={() => runAction(qa.key, qa.label, qa.task)}
                  className="bg-white border border-gray-100 rounded-2xl p-3 text-left hover:border-orange-200 hover:bg-orange-50 transition-colors active:scale-95"
                >
                  <span className="text-xl">{qa.icon}</span>
                  <p className="text-xs font-semibold text-gray-800 mt-1 leading-tight">{qa.label}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              All Quick Actions use the same pre-computed data snapshot — results stay consistent.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: PARTNERS ──────────────────────────────────────────────────── */}
      {tab === "partners" && (
        <div className="px-4 py-4 space-y-4">
          {/* Approval queue (0 pending for demo) */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-sm">✅</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-green-700">Approval queue: 0 pending</p>
              <p className="text-[10px] text-green-600">All partner applications are up to date</p>
            </div>
            <button className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl">
              Approve
            </button>
          </div>

          <div className="space-y-2">
            {partners.map((p) => {
              const isMe = p.sellerId === "seller-01";
              return (
                <div
                  key={p.sellerId}
                  className={`bg-white rounded-2xl border p-3 flex items-center gap-3
                    ${isMe ? "border-orange-200 bg-orange-50" : "border-gray-100"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0
                    ${p.rank === 1 ? "bg-yellow-400 text-yellow-900" : p.rank === 2 ? "bg-gray-300 text-gray-700" : p.rank === 3 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {p.rank <= 3 ? ["🥇", "🥈", "🥉"][p.rank - 1] : p.rank}
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isMe ? "bg-[#FF6900]" : "bg-gray-500"}`}>
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <TierBadge tier={p.tier} size="sm" />
                    </div>
                    <p className="text-[10px] text-gray-400">{p.area} · {p.verifiedUnits} verified units</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{p.points.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">pts</p>
                    {p.fraudFlagCount > 0 && (
                      <p className="text-[10px] text-red-500 font-bold">{p.fraudFlagCount} flags</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab: PRODUCTS ──────────────────────────────────────────────────── */}
      {tab === "products" && (
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex-1">SKU Performance — All 14 Products</p>
            <div className="flex gap-1">
              {(["units", "value"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors
                    ${sortBy === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {s === "units" ? "By Units" : "By Value"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {[...skuPerf]
              .sort((a, b) => sortBy === "units" ? b.totalUnits - a.totalUnits : b.totalValue - a.totalValue)
              .map((sku, i) => (
                <div key={sku.skuId} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
                  <span className="text-sm font-black text-gray-300 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{sku.skuName}</p>
                    <p className="text-[10px] text-gray-400">{sku.line} · {sku.size} · ₹{sku.price}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{sku.totalUnits} units</p>
                    <p className="text-[10px] text-gray-400">₹{sku.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="hidden sm:block text-right shrink-0 min-w-[80px]">
                    <p className="text-xs text-gray-600 font-medium">{sku.topArea}</p>
                    <p className="text-[10px] text-gray-400">{sku.topChannel}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Tab: FRAUD FLAGS ───────────────────────────────────────────────── */}
      {tab === "fraud" && (
        <div className="px-4 py-4 space-y-3">
          {/* Policy card */}
          <details className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
            <summary className="px-4 py-3 text-xs font-bold text-gray-500 cursor-pointer select-none">
              Anti-Fraud Policy (tap to expand)
            </summary>
            <div className="px-4 pb-3 space-y-1.5 text-xs text-gray-600">
              <p>1. <strong>Photo proof required</strong> — no photo = automatic flag, zero points awarded</p>
              <p>2. <strong>Quantity cap</strong>: single sale &gt;50 units → flagged for manual review</p>
              <p>3. <strong>Duplicate detection</strong>: same seller + SKU + channel within 2 hours → flag</p>
              <p>4. <strong>Reward cap</strong>: seller rewards cannot exceed 15% of their GMV contribution</p>
              <p>5. <strong>No recruitment rewards</strong>: points earned only for selling product and logging data</p>
            </div>
          </details>

          {fraudFlags.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-bold text-gray-700">No fraud flags</p>
              <p className="text-sm text-gray-400">All sales have photo proof</p>
            </div>
          ) : (
            <>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-700">
                  <span className="font-bold">{fraudFlags.length} unverified sales</span> — no photo proof. Review before approving points.
                </p>
              </div>
              {fraudFlags.map((f) => (
                <div key={f.saleId} className="bg-white rounded-2xl border border-red-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.sellerName}</p>
                      <p className="text-xs text-gray-500">{f.skuName} · {f.units} units · ₹{f.value}</p>
                      <p className="text-xs text-gray-400">{f.channel} · {f.area}</p>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full shrink-0">No Photo</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(f.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Tab: DEMAND MAP ────────────────────────────────────────────────── */}
      {tab === "map" && (
        <div className="px-4 py-4 space-y-4">
          {/* Heat legend */}
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Demand Heat</p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-3 h-3 rounded bg-orange-600 inline-block" /> High
              <span className="w-3 h-3 rounded bg-orange-400 inline-block ml-2" /> Medium
              <span className="w-3 h-3 rounded bg-orange-200 inline-block ml-2" /> Low
              <span className="w-3 h-3 rounded bg-gray-100 inline-block ml-2" /> Minimal
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {areaDemand.map((a) => (
              <div
                key={a.area}
                className={`rounded-2xl p-4 ${heatColor(a.totalUnits)} transition-all`}
              >
                <p className="font-bold text-sm">{a.area}</p>
                <p className="text-[10px] opacity-70">{a.pincode}</p>
                <p className="text-2xl font-black mt-2">{a.totalUnits}</p>
                <p className="text-[10px] opacity-70">units</p>
                <p className="text-[10px] font-semibold mt-1 opacity-90">🔥 {a.topSku}</p>
              </div>
            ))}
          </div>

          {/* AI Targeting Recommendation */}
          <div className="bg-white border border-orange-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-orange-500" />
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Ad Targeting Recommendation</p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">High-demand areas with active MadSquad partners</span> (Thane, Bandra, BKC): run organic partner campaigns here — no paid spend needed.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mt-1">
              <span className="font-semibold text-gray-900">High-demand areas without partners</span> (Andheri West, Navi Mumbai): priority for new partner recruitment.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: PLATFORM INTELLIGENCE ─────────────────────────────────────── */}
      {tab === "intel" && (
        <div className="px-4 py-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ad-to-Sales Ratio — April 2026</p>
            <p className="text-sm text-gray-500">₹X spent in ads per ₹100 earned. Lower is better.</p>
          </div>

          {/* A2S cards */}
          <div className="grid grid-cols-1 gap-3">
            <A2SCard
              label="BigBasket A2S"
              pct={20}
              bg="bg-green-600"
              textColor="text-white"
              sub="₹20 in ads per ₹100 earned · 3× more efficient than Instamart"
            />
            <A2SCard
              label="Instamart A2S"
              pct={50}
              bg="bg-red-600"
              textColor="text-white"
              sub="₹50 in ads per ₹100 earned · burning half your revenue on acquisition"
            />
            <A2SCard
              label="MadSquad A2S"
              pct={0}
              bg="bg-purple-600"
              textColor="text-white"
              sub="₹0 in ad spend · partner sales are pure margin contribution"
            />
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm text-gray-700 leading-relaxed">
              In April 2026, MadMix spent <span className="font-bold">₹1 in Instamart ads for every ₹2 earned</span> — a 50% A2S. BigBasket was 3× more efficient at 20%. MadSquad partners operate in the same pin codes as quick-commerce dark stores, sell the same SKUs, and cost MadMix <span className="font-bold text-purple-600">₹0 in ad spend</span>. Scaling this network directly reduces dependence on high-cost platforms.
            </p>
          </div>

          {/* Action card */}
          <div className="border-2 border-orange-400 rounded-2xl p-4 bg-orange-50">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">Instamart A2S is 50% — you're burning ad budget</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Pause Instamart ads in pin codes where MadSquad partners are already active. Let partner organic pull replace paid acquisition. Fix stock visibility before scaling spend further.
                </p>
                <button
                  onClick={() => setTab("map")}
                  className="flex items-center gap-1 mt-3 text-xs font-bold text-orange-600"
                >
                  See understocked pin codes <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Source note */}
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            A2S data sourced from MadMix platform analytics, April 2026.
            Partner A2S is structural — no ad spend model by design.
          </p>

          {/* AI Analysis button */}
          <button
            onClick={() => runAction("marketing", "Marketing Recommendations", "Write marketing recommendations based on the A2S data and partner network performance")}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #FF6900, #F97316)" }}
          >
            <Zap size={16} fill="white" /> Generate AI Marketing Plan
          </button>
        </div>
      )}
    </div>
  );
}
