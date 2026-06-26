"use client";
import { useApp } from "@/store/AppContext";
import { TIER_CONFIG, getNextTier } from "@/lib/sellers";
import { runCoach } from "@/lib/coach";
import TierBadge from "@/components/ui/TierBadge";
import PointsPill from "@/components/ui/PointsPill";
import Link from "next/link";
import { Zap, TrendingUp, ShoppingBag, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { state } = useApp();
  const { seller, points } = state;
  const tierCfg = TIER_CONFIG[seller.tier];
  const nextTier = getNextTier(seller.tier);
  const progress = nextTier
    ? Math.min(100, ((points - tierCfg.minPoints) / (nextTier.pointsNeeded - tierCfg.minPoints)) * 100)
    : 100;

  const { todayMove } = runCoach("seller-01");

  const today = new Date("2026-06-27");
  const todaySales = state.sales.filter((s) => {
    const d = new Date(s.timestamp);
    return s.sellerId === "seller-01" &&
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  });
  const todayUnits = todaySales.reduce((t, s) => t + s.units, 0);
  const todayValue = todaySales.reduce((t, s) => t + s.value, 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8] md:max-w-2xl md:mx-auto">
      <div className="px-5 pt-10 pb-6" style={{ background: "linear-gradient(135deg, #E63012 0%, #F97316 100%)" }}>
        <p className="text-orange-100 text-sm font-medium mb-1">Aaj kitna becha? 🌶️</p>
        <h1 className="text-white text-2xl font-bold">Hey {seller.shortName} 👋</h1>
        <div className="flex items-center gap-3 mt-4">
          <PointsPill points={points} size="lg" />
          <TierBadge tier={seller.tier} size="md" />
        </div>
        {nextTier && (
          <div className="mt-4">
            <div className="flex justify-between text-orange-100 text-xs mb-1">
              <span>{seller.tier}</span>
              <span>{nextTier.tier} at {nextTier.pointsNeeded.toLocaleString("en-IN")} pts</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-medium">Today's Units</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{todayUnits}</p>
            <div className="flex items-center gap-1 mt-1">
              <ShoppingBag size={12} className="text-orange-500" />
              <span className="text-xs text-orange-500">{todaySales.length} sales logged</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-medium">Today's Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{todayValue}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-green-500" />
              <span className="text-xs text-green-500">Crazy good!</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{todayMove.emoji}</span>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Today's Move</p>
          </div>
          <p className="text-sm font-semibold text-gray-900">{todayMove.title}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{todayMove.body}</p>
          <Link href="/coach" className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#E63012]">
            See all tips <ArrowRight size={12} />
          </Link>
        </div>

        <Link
          href="/log-sale"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #E63012, #F97316)" }}
        >
          <Zap size={20} fill="white" />
          Log a Sale — Earn Points
        </Link>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-bold text-gray-900">{state.streak}-day streak!</p>
            <p className="text-xs text-gray-500">Log a sale today to keep it alive</p>
          </div>
        </div>

        <div className={`rounded-2xl p-4 ${tierCfg.bg}`}>
          <p className={`text-xs font-bold uppercase tracking-wide ${tierCfg.color} mb-2`}>
            {tierCfg.emoji} Your {seller.tier} Perks
          </p>
          <ul className="space-y-1">
            {tierCfg.perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500">✓</span> {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
