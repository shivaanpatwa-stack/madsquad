"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  getAreaDemand, getHotSkusByArea, getFraudFlags,
  getPartnerRanking, getHQSummary, getSkuPerformance,
} from "@/lib/hq";
import { SNAPSHOT } from "@/lib/snapshot";
import { SEED_SALES } from "@/lib/sales";
import { callClaude } from "@/lib/claude";
import { getNetworkSummary } from "@/lib/territory";
import TierBadge from "@/components/ui/TierBadge";
import type { MapAreaData } from "@/components/map/MumbaiMap";
import {
  BarChart2, AlertTriangle, Users, TrendingUp, MapPin,
  Package, Zap, X, Download, ChevronRight, Home,
  Volume2, VolumeX,
} from "lucide-react";

const MumbaiMap = dynamic(() => import("@/components/map/MumbaiMap"), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-2xl flex items-center justify-center" style={{ background: "#F0E6D8" }}>
      <p className="text-sm" style={{ color: "#9C8870" }}>Loading map...</p>
    </div>
  ),
});

type HQTab = "dashboard" | "partners" | "products" | "fraud" | "map" | "network" | "intel" | "summary" | "performers" | "swot" | "risk";

type ModalState = { title: string; text: string; loading: boolean };

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
    "Strengths: Zero ad spend model, 100% partner activity rate, 63% repeat customer rate — structural advantages that compound over time.\n\nWeaknesses: Limited geographic coverage with 8 partners across 6 zones. Millet Bhel near stockout in Bandra. Bhujia supply chain is single-point-of-volume risk at ~35% of GMV.\n\nOpportunities: BKC and Lower Parel show strong demand but have only one partner each. Instamart's 50% A2S rate makes the switching argument clear to distributors.\n\nThreats: Revenue concentration in Thane (Vikram) creates single-partner risk at 28% of GMV. Continued Instamart spend in covered pin codes erodes margin.",
  weekly_report:
    "Week ending June 27, 2026. Network generated 8 verified transactions in the last 7 days. Gym channel outperformed all others with the highest units-per-sale ratio. Chaat Corner Puffs showed an 18% week-on-week dip in Bandra, attributed to school footfall decline during exam prep season. Vikram (Thane) maintained highest weekly GMV. Fraud flags this week: 1 pending (no photo proof). Key action: monitor Millet Bhel velocity — stockout in approximately 2 days at current pace.",
  monthly_report:
    "June 2026 Monthly Network Summary. Total GMV: ₹12,090 across 8 partners. Bhujia Classic (Mini + Regular) drove 34% of total volume, validating its position as the flagship SKU. Gym and College channels are growing 2× faster than Café and School. Partner health: 7 of 8 partners are Muncher tier or above. Network expansion opportunity: Andheri and Vashi both show strong demand signals but below-average GMV per partner. Riya (Bandra) is tracking to reach Crusher tier by end of July at current velocity.",
  dealer_review:
    "Vikram Rao (Thane, Mad Legend): Highest GMV, zero fraud flags, consistent vending machine channel. Model partner.\n\nAarav Mehta (Powai, Crusher): College channel specialist, strong repeat rates, growing fast.\n\nSneha Nair (Andheri, Crusher): Corporate office focus. One fraud flag pending — follow up on missing photo proof.\n\nRohit Das (BKC, Crusher): Gym-dominant, strong potential for BKC corporate expansion.\n\nRiya Sharma (Bandra, Muncher): Strong gym performance offset by school channel dip. Coach intervention recommended on Chaat Corner stock reallocation.",
  growth_ops:
    "Top 3 growth levers.\n\n1) BKC Expansion: Rohit's gym performance suggests 2–3 more gym partners in BKC could double zone GMV. Instamart has a dark store here — MadSquad presence suppresses their paid acquisition cost.\n\n2) Vashi College Network: Ananya's numbers show college channel is 40% more efficient by repeat rate. Add 2 student ambassador partners in Vashi and Kharghar.\n\n3) Millet Bhel Recovery: Strong repeat-rate product with near-zero stock in Bandra. Prioritise supply allocation before June 30 to avoid losing loyal buyers.",
  risk:
    "HIGH: Instamart A2S at 50% — burning margin in covered zones. Pause spend in Bandra & BKC immediately.\n\nHIGH: Millet Bhel stockout in Bandra — 2 days. Immediate restock required.\n\nMEDIUM: 2 unverified sales in fraud queue — ₹440 in unawarded points at risk. Review before approving.\n\nMEDIUM: Revenue concentration — Vikram generates 28% of network GMV. Diversification into Navi Mumbai recommended within 30 days.\n\nLOW: Chaat Corner dip at Bandra School — monitor velocity through July 4 before reallocating stock.",
  network_growth:
    "Bandra and Thane have strong demand with only 1 seller each — both zones can support 3–4 more sellers without cannibalisation. Prioritise Bandra West for gym-focused partners (Flamin' Fun Mini is the top mover there) and Thane for vending-machine operators. Adding 2 sellers per zone = estimated +₹15,000/month GMV uplift with zero overlap risk.\n\nBorivali and Lower Parel are saturated at current demand levels — hold off on recruitment there until demand grows. Consider activating a Vashi college referral campaign using Ananya as the anchor partner.",
  marketing:
    "STOP: Instamart ad spend in Bandra and BKC pin codes — MadSquad partners are covering these zones. You are paying for demand that partner channels can generate free.\n\nSHIFT: Reallocate ₹5,000–₹8,000 monthly Instamart budget into the partner incentive pool.\n\nSTART: Run a partner referral campaign in Vashi and Andheri targeting college students aged 18–24. Bhujia and Flamin' Fun Puffs are proven sellers in this cohort.\n\nHOLD: BigBasket spend at 20% A2S is defensible — maintain visibility but monitor closely.",
};

const HQ_SYSTEM = `You are a senior business analyst advising MadMix, an Indian healthy snack brand. You have been given a computed data snapshot. Your job is to narrate and interpret these numbers — never re-derive or recalculate them. Be specific, concise, and direct. Use the exact figures from the snapshot. Format with short paragraphs, no bullet overload. Output in 150–200 words max.`;

const RISK_BRIEFING = `MadMix network risk briefing as of June 2026. Priority one: Instamart ad-to-sales ratio is 50 percent — that is 50 rupees spent for every 100 rupees earned. MadSquad partners in the same pin codes cost zero in ad spend. Recommend pausing Instamart in Bandra and BKC immediately. Priority two: two unverified sales are in the verification queue. Clear the queue before approving rewards this week. On concentration risk: Vikram in Thane generates 28 percent of network GMV. Recruiting one to two new partners in Navi Mumbai within 30 days is the recommended mitigation. On the opportunity side: Andheri and Vashi have strong demand with low partner coverage — prime zones for new partner recruitment. Network Health Score is 83 out of 100, green. End of briefing.`;

// ── Export to PDF ─────────────────────────────────────────────────────────────
async function exportToPDF(elementId: string, title: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element as HTMLElement, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFillColor(255, 105, 0);
  pdf.rect(0, 0, pageWidth, 18, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.text(`MadMix HQ — ${title}`, 10, 12);
  pdf.setTextColor(210, 210, 210);
  pdf.setFontSize(7);
  pdf.text(new Date().toLocaleDateString("en-IN"), pageWidth - 10, 14, { align: "right" });
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 10, 23, imgWidth, Math.min(imgHeight, pageHeight - 33));
  pdf.save(`madmix-${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

// ── Health Score Gauge ─────────────────────────────────────────────────────────
function HealthGauge({ score }: { score: number }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Healthy" : score >= 50 ? "At Risk" : "Critical";
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-28 h-28 md:w-36 md:h-36">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#2D1F00" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="800">{score}</text>
        <text x="50" y="60" textAnchor="middle" fill="#9C8870" fontSize="8">/100</text>
      </svg>
      <span className="text-xs font-bold mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Risk Spider Chart ─────────────────────────────────────────────────────────
function SpiderChart({ scores }: { scores: number[] }) {
  const cx = 60; const cy = 60; const R = 46; const n = scores.length;
  const toXY = (pct: number, i: number): [number, number] => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const r = (pct / 100) * R;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  const gridPts = (pct: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const r = (pct / 100) * R;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
  const filledPts = scores.map((s, i) => toXY(s, i).join(",")).join(" ");
  return (
    <svg viewBox="0 0 120 120" className="w-44 h-44 mx-auto">
      {[25, 50, 75, 100].map((p) => (
        <polygon key={p} points={gridPts(p)} fill="none" stroke="#F0E6D8" strokeWidth="0.8" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = toXY(100, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#F0E6D8" strokeWidth="0.8" />;
      })}
      <polygon points={filledPts} fill="rgba(255,105,0,0.18)" stroke="#FF6900" strokeWidth="1.5" />
      {scores.map((s, i) => {
        const [x, y] = toXY(s, i);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#FF6900" />;
      })}
    </svg>
  );
}

// ── SWOT static content ───────────────────────────────────────────────────────
const SWOT_DATA = {
  strengths: [
    "Zero ad spend model — MadSquad A2S is 0%",
    "100% partner activity rate this period",
    "63% repeat customer rate across the network",
    "Bhujia Classic is a proven high-volume anchor SKU",
  ],
  weaknesses: [
    "8 partners across 6 zones — limited geographic spread",
    "Millet Bhel near stockout in Bandra (~2 days)",
    "Bhujia concentration risk: ~35% of GMV from one SKU",
  ],
  opportunities: [
    "Andheri & Vashi have high demand, low partner coverage",
    "Instamart's 50% A2S makes the partner case obvious to brands",
    "College channel repeat rate is 40% above gym channel",
    "Mumbai playbook can replicate to Pune, Bangalore, Delhi NCR",
  ],
  threats: [
    "Revenue concentration — Vikram (Thane) at 28% of GMV",
    "Instamart spend in covered zones is eroding blended margin",
    "School channel velocity dip in Bandra (exam season effect)",
  ],
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HQPage() {
  const [tab, setTab]       = useState<HQTab>("dashboard");
  const [modal, setModal]   = useState<ModalState | null>(null);
  const [sortBy, setSortBy] = useState<"units" | "value">("units");
  const [speaking, setSpeaking] = useState(false);
  const [exporting, setExporting] = useState(false);

  const summary    = getHQSummary();
  const areaDemand = getAreaDemand();
  const hotSkus    = getHotSkusByArea();
  const fraudFlags = getFraudFlags();
  const partners   = getPartnerRanking();
  const skuPerf    = getSkuPerformance();
  const snap       = SNAPSHOT;
  const networkSummary = getNetworkSummary();

  const maxUnits = areaDemand[0]?.totalUnits ?? 1;
  const maxDemandUnits = Math.max(...areaDemand.map((a) => a.totalUnits), 1);

  // ── AOV ───────────────────────────────────────────────────────────────────
  const networkAOV = SEED_SALES.length > 0
    ? Math.round(SEED_SALES.reduce((s, r) => s + r.value, 0) / SEED_SALES.length)
    : 0;

  // ── Scalability projection ────────────────────────────────────────────────
  const unitsPerPartner = snap.kpis.activePartners > 0
    ? Math.round(snap.kpis.totalUnits / snap.kpis.activePartners)
    : 0;
  const projectedGMV = unitsPerPartner * 8 * 5 * 10; // 5 cities × 8 partners × ₹10/unit

  // ── Risk data ─────────────────────────────────────────────────────────────
  const risks = [
    { id: "a2s",    label: "Instamart Ad Efficiency", severity: "high"   as const, metric: `A2S: ${snap.adEfficiency.instamartA2S}% — ₹${snap.adEfficiency.instamartA2S} per ₹100 earned`, action: "Pause Instamart in Bandra & BKC — partners already cover those zones.", score: 72 },
    { id: "fraud",  label: "Verification Queue",      severity: snap.kpis.fraudFlagCount > 2 ? "high" as const : "medium" as const, metric: `${snap.kpis.fraudFlagCount} sale${snap.kpis.fraudFlagCount !== 1 ? "s" : ""} unverified`, action: "Clear fraud queue before approving any pending points.", score: snap.kpis.fraudFlagCount > 2 ? 65 : 45 },
    { id: "conc",   label: "Revenue Concentration",   severity: "medium" as const, metric: "Vikram (Thane) = ~28% of network GMV", action: "Recruit 1–2 partners in Navi Mumbai within 30 days.", score: 48 },
    { id: "sat",    label: "Zone Saturation",         severity: networkSummary.saturatedCount > 1 ? "medium" as const : "low" as const, metric: `${networkSummary.saturatedCount} zone${networkSummary.saturatedCount !== 1 ? "s" : ""} at saturation limit`, action: "Hold Borivali recruitment. Redirect to Andheri and Vashi.", score: networkSummary.saturatedCount > 1 ? 40 : 20 },
    { id: "stock",  label: "Stock Availability",      severity: "low"    as const, metric: "Millet Bhel ~2 days remaining in Bandra", action: "Prioritise Bandra Millet Bhel restock before June 30.", score: 32 },
  ];
  const SEV_COLOR = { high: "#D62828", medium: "#f59e0b", low: "#22c55e" };
  const SEV_BG    = { high: "#fee2e2", medium: "#fef3c7", low: "#dcfce7" };

  // ── Demand map data ───────────────────────────────────────────────────────
  const demandMapAreas: MapAreaData[] = areaDemand.map((a) => ({
    area: a.area,
    value: a.totalUnits,
    label: `${a.totalUnits} units · ₹${a.totalValue.toLocaleString()}`,
    topSku: a.topSku,
  }));

  // ── Network map data ──────────────────────────────────────────────────────
  const networkMapAreas: MapAreaData[] = networkSummary.areas.map((a) => ({
    area: a.area,
    value: a.saturationScore,
    label: `${a.status === "white-space" ? "White Space" : a.status === "healthy" ? "Healthy" : "Saturated"} · ${a.saturationScore}/100`,
    status: a.status,
    topSku: a.topSku,
    sellerCount: a.sellerCount,
  }));

  // ── Helpers ───────────────────────────────────────────────────────────────
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
      networkAOV,
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

  const speakBriefing = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(RISK_BRIEFING);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = "en-IN";
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((v) => v.lang.startsWith("en")) ?? null;
    if (v) utterance.voice = v;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const handleExport = async (elementId: string, title: string) => {
    setExporting(true);
    await exportToPDF(elementId, title);
    setExporting(false);
  };

  const TABS: { key: HQTab; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard",      icon: "📊" },
    { key: "partners",  label: "Partners",        icon: "👥" },
    { key: "products",  label: "Products",        icon: "📦" },
    { key: "fraud",     label: "Fraud Flags",     icon: "🚨" },
    { key: "map",       label: "Demand Map",      icon: "🗺️" },
    { key: "network",   label: "Network Map",     icon: "📍" },
    { key: "intel",     label: "Platform Intel",  icon: "📡" },
    { key: "summary",   label: "Exec Summary",    icon: "📋" },
    { key: "performers",label: "Performers",      icon: "🏆" },
    { key: "swot",      label: "SWOT",            icon: "🎯" },
    { key: "risk",      label: "Risk Radar",      icon: "⚠️" },
  ];

  const PDF_BTN = (elementId: string, title: string) => (
    <button
      onClick={() => handleExport(elementId, title)}
      disabled={exporting}
      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors"
      style={{ color: "#6B5B45", borderColor: "#F0E6D8", background: "white" }}
    >
      <Download size={13} /> {exporting ? "Generating..." : "Export PDF"}
    </button>
  );

  return (
    <div className="min-h-screen md:flex" style={{ background: "#FFF8F0" }}>

      {/* ── AI Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5" style={{ borderBottom: "1px solid #F0E6D8" }}>
              <h3 className="text-base font-bold" style={{ color: "#1A1200" }}>{modal.title}</h3>
              <button onClick={() => setModal(null)} className="p-1" style={{ color: "#9C8870" }}><X size={18} /></button>
            </div>
            <div className="p-5">
              {modal.loading ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
                        style={{ background: "#FF6900", animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: "#9C8870" }}>Generating analysis...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#1A1200" }}>{modal.text}</p>
                  <p className="text-[10px] italic mt-3" style={{ color: "#9C8870" }}>Computed from your last 14 days of sales data</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={() => window.print()}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl hover:bg-gray-50 border"
                      style={{ color: "#6B5B45", borderColor: "#F0E6D8" }}>
                      <Download size={13} /> Export PDF
                    </button>
                    <span className="text-xs" style={{ color: "#9C8870" }}>Powered by Gemini</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 bg-white shrink-0 sticky top-0 h-screen" style={{ borderRight: "1px solid #F0E6D8" }}>
        <div className="px-5 py-6" style={{ borderBottom: "1px solid #F0E6D8" }}>
          <div className="flex items-center gap-2">
            <BarChart2 size={18} style={{ color: "#FF6900" }} />
            <div>
              <p className="text-base font-black" style={{ color: "#1A1200" }}>MadMix HQ</p>
              <p className="text-[10px]" style={{ color: "#9C8870" }}>Partner Intelligence</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {/* Core tabs */}
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-1 pt-1" style={{ color: "#9C8870" }}>Operations</p>
          {TABS.slice(0, 7).map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors"
              style={{ background: tab === key ? "#FFF3E6" : "transparent", color: tab === key ? "#FF6900" : "#6B5B45" }}>
              <span>{icon}</span>
              {label}
              {key === "fraud" && fraudFlags.length > 0 && (
                <span className="ml-auto text-white text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#D62828" }}>
                  {fraudFlags.length}
                </span>
              )}
            </button>
          ))}
          {/* Intelligence tabs */}
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-1 pt-3" style={{ color: "#9C8870" }}>Intelligence Suite</p>
          {TABS.slice(7).map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors"
              style={{ background: tab === key ? "#FFF3E6" : "transparent", color: tab === key ? "#FF6900" : "#6B5B45" }}>
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid #F0E6D8" }}>
          <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full text-sm font-medium hover:bg-gray-50" style={{ color: "#6B5B45" }}>
            <Home size={16} /> Seller View
          </Link>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <div className="px-5 pt-10 md:pt-8 pb-5 text-white" style={{ background: "#1A1200" }}>
          <div className="flex items-center gap-2 mb-1 md:hidden">
            <BarChart2 size={18} style={{ color: "#FF6900" }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#FF6900" }}>MadMix HQ</p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-extrabold">Partner Intelligence</h1>
              <p className="text-xs mt-1" style={{ color: "#9C8870" }}>Bottom-up demand data. No field team required.</p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <p className="text-xl font-black">{summary.totalUnits.toLocaleString()}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>Total Units</p>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <p className="text-xl font-black">{summary.activePartners}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>Partners</p>
                </div>
                <div className="rounded-xl p-2.5 text-center"
                  style={{ background: summary.fraudFlagCount > 0 ? "rgba(214,40,40,0.25)" : "rgba(34,197,94,0.15)" }}>
                  <p className="text-xl font-black">{summary.fraudFlagCount}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>Fraud Flags</p>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <p className="text-[10px] text-center mb-1" style={{ color: "#9C8870" }}>Network Health</p>
              <HealthGauge score={snap.kpis.healthScore} />
            </div>
          </div>
        </div>

        {/* Mobile tab strip */}
        <div className="md:hidden flex bg-white overflow-x-auto" style={{ borderBottom: "1px solid #F0E6D8" }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-shrink-0 px-4 py-3 text-xs font-semibold whitespace-nowrap relative"
              style={{ color: tab === key ? "#1A1200" : "#9C8870", borderBottom: tab === key ? "2px solid #FF6900" : undefined }}>
              {label}
              {key === "fraud" && fraudFlags.length > 0 && (
                <span className="ml-1 text-white text-[9px] px-1 py-0.5 rounded-full" style={{ background: "#D62828" }}>{fraudFlags.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div className="px-4 py-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>
                Network Health Score — {snap.kpis.healthScore}/100
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  { label: "Revenue attainment", val: `${Math.round(Math.min(1, snap.kpis.totalValue / 15000) * 100)}%`, weight: "35%" },
                  { label: "Active partner rate", val: `${Math.round((snap.kpis.activePartners / 8) * 100)}%`, weight: "25%" },
                  { label: "Repeat customer rate", val: `${snap.kpis.repeatRate}%`, weight: "20%" },
                  { label: "Stock availability",  val: "86%", weight: "20%" },
                ].map((r) => (
                  <div key={r.label} className="rounded-xl p-2.5" style={{ background: "#FFF8F0" }}>
                    <p style={{ color: "#6B5B45" }}>{r.label}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold" style={{ color: "#FF6900" }}>{r.val}</span>
                      <span className="text-[10px]" style={{ color: "#9C8870" }}>({r.weight})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} style={{ color: "#9C8870" }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>Demand by Area</p>
                </div>
                <div className="space-y-2">
                  {areaDemand.map((a) => (
                    <div key={a.area} className="bg-white rounded-2xl p-3 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm font-semibold" style={{ color: "#1A1200" }}>{a.area}</span>
                          <span className="text-xs ml-2" style={{ color: "#9C8870" }}>{a.pincode}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{a.totalUnits} units</p>
                          <p className="text-[10px]" style={{ color: "#9C8870" }}>₹{a.totalValue.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${(a.totalUnits / maxUnits) * 100}%`, background: "linear-gradient(90deg, #FF6900, #FFB800)" }} />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: "#FF6900" }}>🔥 Top SKU: {a.topSku}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} style={{ color: "#9C8870" }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>Hot SKUs by Area</p>
                </div>
                <div className="space-y-2">
                  {hotSkus.slice(0, 8).map((h, i) => (
                    <div key={i} className="bg-white rounded-xl px-3 py-2.5 flex items-center justify-between shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#1A1200" }}>{h.skuName}</p>
                        <p className="text-xs" style={{ color: "#9C8870" }}>{h.area}</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: "#FF6900" }}>{h.units} units</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>AI Quick Actions</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {QUICK_ACTIONS.map((qa) => (
                  <button key={qa.key} onClick={() => runAction(qa.key, qa.label, qa.task)}
                    className="bg-white rounded-2xl p-3 text-left transition-colors active:scale-95"
                    style={{ border: "1px solid #F0E6D8" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FFF3E6"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}>
                    <span className="text-xl">{qa.icon}</span>
                    <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: "#1A1200" }}>{qa.label}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] mt-2 text-center" style={{ color: "#9C8870" }}>
                All Quick Actions use the same pre-computed data snapshot — results stay consistent.
              </p>
            </div>
          </div>
        )}

        {/* ── PARTNERS ── */}
        {tab === "partners" && (
          <div className="px-4 py-4 space-y-4">
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0"><span className="text-sm">✅</span></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-green-700">Approval queue: 0 pending</p>
                <p className="text-[10px] text-green-600">All partner applications are up to date</p>
              </div>
              <button className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl">Approve</button>
            </div>
            <div className="hidden md:grid md:grid-cols-[2rem_2.5rem_1fr_auto_auto] gap-3 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9C8870" }}>
              <span>#</span><span></span><span>Partner</span><span>Units</span><span>Points</span>
            </div>
            <div className="space-y-2">
              {partners.map((p) => {
                const isMe = p.sellerId === "seller-01";
                return (
                  <div key={p.sellerId} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm"
                    style={{ border: `1px solid ${isMe ? "#FF6900" : "#F0E6D8"}`, background: isMe ? "#FFF3E6" : "white" }}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${p.rank === 1 ? "bg-yellow-400 text-yellow-900" : p.rank === 2 ? "bg-gray-300 text-gray-700" : p.rank === 3 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {p.rank <= 3 ? ["🥇", "🥈", "🥉"][p.rank - 1] : p.rank}
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: isMe ? "#FF6900" : "#9C8870" }}>{p.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1A1200" }}>{p.name}</p>
                        <TierBadge tier={p.tier} size="sm" />
                      </div>
                      <p className="text-[10px]" style={{ color: "#9C8870" }}>{p.area} · {p.verifiedUnits} verified units</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{p.points.toLocaleString()}</p>
                      <p className="text-[10px]" style={{ color: "#9C8870" }}>pts</p>
                      {p.fraudFlagCount > 0 && (
                        <p className="text-[10px] font-bold" style={{ color: "#D62828" }}>{p.fraudFlagCount} flags</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider flex-1" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>SKU Performance — All 14 Products</p>
              <div className="flex gap-1">
                {(["units", "value"] as const).map((s) => (
                  <button key={s} onClick={() => setSortBy(s)} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: sortBy === s ? "#1A1200" : "#F0E6D8", color: sortBy === s ? "white" : "#6B5B45" }}>
                    {s === "units" ? "By Units" : "By Value"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
              {[...skuPerf].sort((a, b) => sortBy === "units" ? b.totalUnits - a.totalUnits : b.totalValue - a.totalValue).map((sku, i) => (
                <div key={sku.skuId} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
                  <span className="text-sm font-black w-5 shrink-0" style={{ color: "#F0E6D8" }}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1A1200" }}>{sku.skuName}</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>{sku.line} · {sku.size} · ₹{sku.price}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{sku.totalUnits} units</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>₹{sku.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="hidden lg:block text-right shrink-0 min-w-[80px]">
                    <p className="text-xs font-medium" style={{ color: "#6B5B45" }}>{sku.topArea}</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>{sku.topChannel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FRAUD FLAGS ── */}
        {tab === "fraud" && (
          <div className="px-4 py-4 space-y-3">
            <details className="rounded-2xl overflow-hidden" style={{ background: "#FFF8F0", border: "1px solid #F0E6D8" }}>
              <summary className="px-4 py-3 text-xs font-bold cursor-pointer select-none" style={{ color: "#6B5B45" }}>Anti-Fraud Policy (tap to expand)</summary>
              <div className="px-4 pb-3 space-y-1.5 text-xs" style={{ color: "#6B5B45" }}>
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
                <p className="font-bold" style={{ color: "#1A1200" }}>No fraud flags</p>
                <p className="text-sm" style={{ color: "#9C8870" }}>All sales have photo proof</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: "#fee2e2", border: "1px solid #fecaca" }}>
                  <AlertTriangle size={16} style={{ color: "#D62828" }} className="shrink-0" />
                  <p className="text-xs text-red-700">
                    <span className="font-bold">{fraudFlags.length} unverified sales</span> — no photo proof. Review before approving points.
                  </p>
                </div>
                <div className="md:grid md:grid-cols-2 md:gap-3 space-y-3 md:space-y-0">
                  {fraudFlags.map((f) => (
                    <div key={f.saleId} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #fecaca" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#1A1200" }}>{f.sellerName}</p>
                          <p className="text-xs" style={{ color: "#6B5B45" }}>{f.skuName} · {f.units} units · ₹{f.value}</p>
                          <p className="text-xs" style={{ color: "#9C8870" }}>{f.channel} · {f.area}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: "#fee2e2", color: "#D62828" }}>No Photo</span>
                      </div>
                      <p className="text-[10px] mt-2" style={{ color: "#9C8870" }}>
                        {new Date(f.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── DEMAND MAP ── */}
        {tab === "map" && (
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>Demand Heat — Mumbai</p>
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#6B5B45" }}>
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#FF6900" }} /> High
                <span className="w-3 h-3 rounded-full inline-block ml-2" style={{ background: "#FFB800" }} /> Medium
                <span className="w-3 h-3 rounded-full inline-block ml-2" style={{ background: "#9C8870" }} /> Low
              </div>
            </div>

            <MumbaiMap mode="demand" areas={demandMapAreas} maxValue={maxDemandUnits} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {areaDemand.map((a) => (
                <div key={a.area} className={`rounded-2xl p-4 ${heatColor(a.totalUnits)} transition-all`}>
                  <p className="font-bold text-sm">{a.area}</p>
                  <p className="text-[10px] opacity-70">{a.pincode}</p>
                  <p className="text-2xl font-black mt-2">{a.totalUnits}</p>
                  <p className="text-[10px] opacity-70">units</p>
                  <p className="text-[10px] font-semibold mt-1 opacity-90">🔥 {a.topSku}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} style={{ color: "#FF6900" }} />
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#FF6900", letterSpacing: "0.06em" }}>Ad Targeting Recommendation</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#6B5B45" }}>
                <span className="font-semibold" style={{ color: "#1A1200" }}>High-demand areas with active partners</span> (Thane, Bandra, BKC): run organic partner campaigns — no paid spend needed.
              </p>
              <p className="text-xs leading-relaxed mt-1" style={{ color: "#6B5B45" }}>
                <span className="font-semibold" style={{ color: "#1A1200" }}>High-demand areas without partners</span> (Andheri, Vashi): priority for new partner recruitment.
              </p>
              <p className="text-[10px] italic mt-2" style={{ color: "#9C8870" }}>Click any circle on the map for zone details · Based on demand-to-seller ratio</p>
            </div>
          </div>
        )}

        {/* ── NETWORK MAP ── */}
        {tab === "network" && (
          <div className="px-4 py-4 space-y-4">
            <div className="rounded-2xl p-4" style={{ background: "#1A1200" }}>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-black text-white">{networkSummary.coveragePct}%</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>Demand captured</p>
                </div>
                <div>
                  <p className="text-2xl font-black" style={{ color: "#FFB800" }}>{networkSummary.whiteSpaceCount}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>White-space zones</p>
                </div>
                <div>
                  <p className="text-2xl font-black" style={{ color: "#D62828" }}>{networkSummary.saturatedCount}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>Saturated zones</p>
                </div>
              </div>
              <p className="text-[10px] text-center mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                {100 - networkSummary.coveragePct}% of demand is uncaptured — growth opportunity
              </p>
            </div>

            <div className="flex items-center gap-4 text-[10px]" style={{ color: "#6B5B45" }}>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#FFB800" }} /> White Space</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#22c55e" }} /> Healthy</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#D62828" }} /> Saturated</span>
            </div>

            <MumbaiMap mode="network" areas={networkMapAreas} maxValue={100} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {networkSummary.areas.map((a) => {
                const bg    = a.status === "white-space" ? "#FFF3E6" : a.status === "healthy" ? "#dcfce7" : "#fee2e2";
                const color = a.status === "white-space" ? "#FF6900" : a.status === "healthy" ? "#15803d" : "#D62828";
                const dot   = a.status === "white-space" ? "🟡" : a.status === "healthy" ? "🟢" : "🔴";
                return (
                  <div key={a.area} className="rounded-2xl p-4" style={{ background: bg }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{a.area}</p>
                      <span>{dot}</span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color }}>
                      {a.status === "white-space" ? "White Space" : a.status === "healthy" ? "Healthy" : "Saturated"}
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black" style={{ color }}>{a.saturationScore}</span>
                      <span className="text-[10px]" style={{ color: "#9C8870" }}>/ 100</span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "#9C8870" }}>
                      {a.demand} units · {a.sellerCount} seller{a.sellerCount !== 1 ? "s" : ""}
                    </p>
                    {a.status === "white-space" && a.demand > 0 && (
                      <p className="text-[10px] font-bold mt-1" style={{ color }}>Recruit here →</p>
                    )}
                    {a.status === "saturated" && (
                      <p className="text-[10px] font-bold mt-1" style={{ color }}>Hold recruitment</p>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={() => runAction("network_growth", "Network Growth Plan", "Generate a network expansion plan")}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm active:scale-95 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}>
              <Zap size={16} fill="white" /> Generate AI Network Growth Plan
            </button>
            <p className="text-[10px] text-center italic" style={{ color: "#9C8870" }}>
              Saturation = (sellers × 50 units) ÷ zone demand. Under 35 = white space. Over 85 = saturated.
            </p>
          </div>
        )}

        {/* ── PLATFORM INTEL ── */}
        {tab === "intel" && (
          <div className="px-4 py-6 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>Ad-to-Sales Ratio — April 2026</p>
              <p className="text-sm" style={{ color: "#6B5B45" }}>₹X spent in ads per ₹100 earned. Lower is better.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: "#dcfce7" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-800 opacity-80">BigBasket A2S</p>
                <p className="text-3xl font-black text-green-800">20%</p>
                <p className="text-[10px] text-green-700 opacity-70">₹20 per ₹100 · 3× better than Instamart</p>
              </div>
              <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: "#fee2e2" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-800 opacity-80">Instamart A2S</p>
                <p className="text-3xl font-black text-red-800">50%</p>
                <p className="text-[10px] text-red-700 opacity-70">₹50 per ₹100 · burning margin</p>
              </div>
            </div>
            <div className="rounded-2xl flex flex-col gap-2" style={{ background: "#FFF3E6", border: "3px solid #FF6900", padding: "28px 24px" }}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: "#FF6900" }}>MadSquad A2S</p>
              <p className="text-6xl font-black" style={{ color: "#FF6900" }}>0%</p>
              <p className="text-sm font-semibold" style={{ color: "#FF6900" }}>₹0 in ad spend · partner sales are pure margin contribution</p>
              <div className="mt-2 bg-white rounded-xl px-3 py-2 inline-block">
                <p className="text-xs font-bold" style={{ color: "#FF6900" }}>The zero-cost channel 🔥 — every partner sale saves you ₹50 vs Instamart</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
              <p className="text-sm leading-relaxed" style={{ color: "#1A1200" }}>
                In April 2026, MadMix spent <span className="font-bold">₹1 in Instamart ads for every ₹2 earned</span> — a 50% A2S. BigBasket was 3× more efficient at 20%. MadSquad partners operate in the same pin codes as quick-commerce dark stores, sell the same SKUs, and cost MadMix{" "}
                <span className="font-bold" style={{ color: "#FF6900" }}>₹0 in ad spend</span>. Scaling this network directly reduces dependence on high-cost platforms.
              </p>
              <p className="text-[10px] italic mt-2" style={{ color: "#9C8870" }}>A2S data sourced from MadMix platform analytics, April 2026.</p>
            </div>
            <div className="rounded-2xl p-4" style={{ border: "2px solid #FFB800", background: "#FFF3E6" }}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} style={{ color: "#FF6900" }} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: "#1A1200" }}>Instamart A2S is 50% — ad budget is burning</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B5B45" }}>
                    Pause Instamart ads in pin codes where MadSquad partners are already active. Let partner organic pull replace paid acquisition.
                  </p>
                  <button onClick={() => setTab("map")} className="flex items-center gap-1 mt-3 text-xs font-bold" style={{ color: "#FF6900" }}>
                    See zone coverage <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => runAction("marketing", "Marketing Recommendations", "Write marketing recommendations based on the A2S data")}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm active:scale-95 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}>
              <Zap size={16} fill="white" /> Generate AI Marketing Plan
            </button>
          </div>
        )}

        {/* ── EXECUTIVE SUMMARY ── */}
        {tab === "summary" && (
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>Executive Summary</p>
              {PDF_BTN("hq-summary", "Executive Summary")}
            </div>

            <div id="hq-summary" className="space-y-4">
              {/* Headline KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Total GMV",           val: `₹${snap.kpis.totalValue.toLocaleString("en-IN")}`, sub: "All verified sales" },
                  { label: "Network AOV",          val: `₹${networkAOV}`,                                   sub: "Per transaction avg" },
                  { label: "MadSquad Ad Cost",     val: "₹0",                                               sub: "vs ₹50/₹100 Instamart" },
                  { label: "Active Partners",       val: `${snap.kpis.activePartners}`,                      sub: "Last 14 days" },
                  { label: "Health Score",          val: `${snap.kpis.healthScore}/100`,                     sub: snap.kpis.healthScore >= 70 ? "🟢 Green" : "🟡 Watch" },
                  { label: "Repeat Customer Rate", val: `${snap.kpis.repeatRate}%`,                          sub: "Network average" },
                ].map((k) => (
                  <div key={k.label} className="bg-white rounded-2xl p-3 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
                    <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: "#9C8870" }}>{k.label}</p>
                    <p className="text-xl font-black mt-0.5" style={{ color: "#FF6900" }}>{k.val}</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Scalability projection */}
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #1A1200, #3D2B00)", border: "none" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#FF6900" }}>📈 Scalability Projection</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-black text-white">{unitsPerPartner}</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>Units / partner</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black" style={{ color: "#FFB800" }}>×5 cities</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>Pune · Delhi · Blr · Hyd · Che</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black" style={{ color: "#22c55e" }}>₹{projectedGMV.toLocaleString("en-IN")}</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>Projected GMV / period</p>
                  </div>
                </div>
                <p className="text-[10px] mt-3 text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                  At current run rate with 8 partners per city × 5 cities = 40 partners · ₹0 ad spend
                </p>
              </div>

              {/* AOV by channel */}
              <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>Revenue by Channel</p>
                {(() => {
                  const byChannel: Record<string, number> = {};
                  SEED_SALES.forEach((s) => { byChannel[s.channel] = (byChannel[s.channel] ?? 0) + s.value; });
                  const total = Object.values(byChannel).reduce((a, b) => a + b, 0);
                  const sorted = Object.entries(byChannel).sort((a, b) => b[1] - a[1]).slice(0, 5);
                  return (
                    <div className="space-y-2">
                      {sorted.map(([ch, val]) => (
                        <div key={ch}>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: "#1A1200", fontWeight: 600 }}>{ch}</span>
                            <span style={{ color: "#FF6900", fontWeight: 700 }}>₹{val.toLocaleString()} ({Math.round((val / total) * 100)}%)</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
                            <div className="h-full rounded-full" style={{ width: `${(val / total) * 100}%`, background: "linear-gradient(90deg, #FF6900, #FFB800)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* AI narrative */}
              <button onClick={() => runAction("executive_summary", "Executive Summary", "Write an executive summary")}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm active:scale-95 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}>
                <Zap size={16} fill="white" /> Generate Full AI Narrative
              </button>
            </div>
          </div>
        )}

        {/* ── TOP PERFORMERS + OPPORTUNITIES ── */}
        {tab === "performers" && (
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>Network Performers</p>
              {PDF_BTN("hq-performers", "Performer Report")}
            </div>

            <div id="hq-performers" className="space-y-4">
              {/* Top performers */}
              <div>
                <p className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: "#22c55e" }}>
                  🏆 Top Performers
                </p>
                <div className="space-y-2">
                  {partners.slice(0, 3).map((p, i) => (
                    <div key={p.sellerId} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                      style={{ border: "2px solid #dcfce7" }}>
                      <span className="text-xl shrink-0">{["🥇", "🥈", "🥉"][i]}</span>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: "#22c55e" }}>{p.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{p.name}</p>
                          <TierBadge tier={p.tier} size="sm" />
                        </div>
                        <p className="text-xs" style={{ color: "#6B5B45" }}>{p.area} · {p.verifiedUnits} verified units · {p.points.toLocaleString()} pts</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black" style={{ color: "#22c55e" }}>#{i + 1}</p>
                        <p className="text-[10px]" style={{ color: "#9C8870" }}>Network</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth opportunity partners */}
              <div>
                <p className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: "#7C3AED" }}>
                  🚀 Growth Opportunities — Partners ready to level up
                </p>
                <p className="text-[10px] mb-2" style={{ color: "#9C8870" }}>
                  A quick coaching nudge could unlock their next stage.
                </p>
                <div className="space-y-2">
                  {partners.slice(-3).reverse().map((p) => {
                    const coaching = p.tier === "Nibbler"
                      ? "Log your next 3 sales with photo proof to unlock Muncher tier."
                      : p.tier === "Muncher"
                        ? "Try a new channel this week — your top SKU may have untapped demand."
                        : "Expand to a second spot this week and double your daily sales window.";
                    return (
                      <div key={p.sellerId} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1.5px solid #ede9fe" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                            style={{ background: "#7C3AED" }}>{p.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{p.name}</p>
                              <TierBadge tier={p.tier} size="sm" />
                            </div>
                            <p className="text-xs" style={{ color: "#6B5B45" }}>{p.area} · {p.verifiedUnits} verified units</p>
                          </div>
                        </div>
                        <div className="mt-2 rounded-xl px-3 py-2" style={{ background: "#faf5ff" }}>
                          <p className="text-xs font-medium" style={{ color: "#7C3AED" }}>💡 {coaching}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button onClick={() => runAction("dealer_review", "Dealer Review", "Write a dealer performance review")}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm active:scale-95 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                <Users size={16} /> Generate Full Partner Report
              </button>
            </div>
          </div>
        )}

        {/* ── SWOT ANALYSIS ── */}
        {tab === "swot" && (
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>SWOT Analysis</p>
              {PDF_BTN("hq-swot", "SWOT Analysis")}
            </div>

            <div id="hq-swot" className="grid grid-cols-2 gap-3">
              {/* Strengths */}
              <div className="rounded-2xl p-4" style={{ background: "#dcfce7", border: "1.5px solid #bbf7d0" }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3 text-green-800">💪 Strengths</p>
                <div className="space-y-2">
                  {SWOT_DATA.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                      <p className="text-xs text-green-900 leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="rounded-2xl p-4" style={{ background: "#fee2e2", border: "1.5px solid #fecaca" }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3 text-red-800">⚠️ Weaknesses</p>
                <div className="space-y-2">
                  {SWOT_DATA.weaknesses.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 shrink-0">•</span>
                      <p className="text-xs text-red-900 leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunities */}
              <div className="rounded-2xl p-4" style={{ background: "#FFF3E6", border: "1.5px solid #FFB800" }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "#FF6900" }}>🚀 Opportunities</p>
                <div className="space-y-2">
                  {SWOT_DATA.opportunities.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0" style={{ color: "#FF6900" }}>→</span>
                      <p className="text-xs leading-snug" style={{ color: "#6B5B45" }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threats */}
              <div className="rounded-2xl p-4" style={{ background: "#fef3c7", border: "1.5px solid #fde68a" }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3 text-amber-800">🎯 Threats</p>
                <div className="space-y-2">
                  {SWOT_DATA.threats.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5 shrink-0">!</span>
                      <p className="text-xs text-amber-900 leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => runAction("swot", "SWOT Analysis", "Write a SWOT analysis based on the snapshot")}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm active:scale-95 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}>
              <Zap size={16} fill="white" /> Regenerate with AI
            </button>
          </div>
        )}

        {/* ── RISK RADAR ── */}
        {tab === "risk" && (
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>Risk Radar</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={speaking ? stopSpeaking : speakBriefing}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold transition-all"
                  style={{
                    background: speaking ? "#fee2e2" : "#FFF3E6",
                    color: speaking ? "#D62828" : "#FF6900",
                    border: `1px solid ${speaking ? "#fecaca" : "#FFB800"}`,
                  }}
                >
                  {speaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  {speaking ? "Stop" : "Hear Briefing"}
                </button>
                {PDF_BTN("hq-risk", "Risk Radar")}
              </div>
            </div>

            <div id="hq-risk" className="space-y-4">
              {/* Spider chart + risk scores */}
              <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3 text-center" style={{ color: "#6B5B45" }}>
                  Risk Profile (lower = better)
                </p>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <SpiderChart scores={risks.map((r) => r.score)} />
                  <div className="flex-1 space-y-2">
                    {risks.map((r, i) => {
                      const labels = ["Ad Efficiency", "Fraud Risk", "Concentration", "Saturation", "Stock"];
                      return (
                        <div key={r.id} className="flex items-center gap-3">
                          <span className="text-[10px] w-24 shrink-0 font-medium" style={{ color: "#9C8870" }}>{labels[i]}</span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${r.score}%`, background: SEV_COLOR[r.severity] }} />
                          </div>
                          <span className="text-[10px] w-6 text-right font-bold" style={{ color: SEV_COLOR[r.severity] }}>{r.score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Risk cards */}
              <div className="space-y-2">
                {risks.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: `1.5px solid ${SEV_COLOR[r.severity]}20` }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-black px-2 py-1 rounded-full shrink-0"
                        style={{ background: SEV_BG[r.severity], color: SEV_COLOR[r.severity] }}>
                        {r.severity.toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{r.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B5B45" }}>{r.metric}</p>
                        <div className="mt-2 rounded-xl px-3 py-2" style={{ background: "#FFF8F0" }}>
                          <p className="text-xs font-medium" style={{ color: "#FF6900" }}>→ {r.action}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall risk score */}
              <div className="rounded-2xl p-4 text-center" style={{ background: "#1A1200" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#9C8870" }}>Overall Risk Score</p>
                <p className="text-5xl font-black" style={{ color: "#FFB800" }}>
                  {Math.round(risks.reduce((s, r) => s + r.score, 0) / risks.length)}
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>/ 100 — Medium risk · 2 items need immediate action</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
