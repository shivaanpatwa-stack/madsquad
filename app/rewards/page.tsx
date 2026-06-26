"use client";
import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { SELLERS, TIER_CONFIG, getTier } from "@/lib/sellers";
import { REWARDS, BUCKET_LABELS, type RewardTier } from "@/lib/points";
import { SEED_SALES } from "@/lib/sales";
import { calcPointsForSale } from "@/lib/points";
import TierBadge from "@/components/ui/TierBadge";
import PointsPill from "@/components/ui/PointsPill";
import { Trophy, Gift, Users } from "lucide-react";

type Tab = "leaderboard" | "store";

// Build leaderboard from seed data + base points
const buildLeaderboard = () =>
  SELLERS.map((s) => {
    const sales = SEED_SALES.filter((sale) => sale.sellerId === s.id);
    const earnedPts = sales.reduce((sum, sale) => sum + calcPointsForSale(sale), 0);
    const total = s.points + earnedPts;
    return { ...s, totalPoints: total, tier: getTier(total) };
  }).sort((a, b) => b.totalPoints - a.totalPoints)
    .map((s, i) => ({ ...s, rank: i + 1 }));

const BUCKETS: RewardTier[] = ["zero-cost", "influence", "cash"];

export default function RewardsPage() {
  const { state, redeemReward } = useApp();
  const [tab, setTab] = useState<Tab>("leaderboard");
  const [redeemed, setRedeemed] = useState<string | null>(null);

  const TIER_ORDER: Record<string, number> = { Nibbler: 0, Muncher: 1, Crusher: 2, "Mad Legend": 3 };
  const leaderboard = buildLeaderboard();
  // update Riya's live points
  const lb = leaderboard.map((s) =>
    s.id === "seller-01" ? { ...s, totalPoints: state.points, tier: getTier(state.points) } : s
  ).sort((a, b) => b.totalPoints - a.totalPoints)
   .map((s, i) => ({ ...s, rank: i + 1 }));

  const riyaRank = lb.find((s) => s.id === "seller-01")?.rank ?? "-";

  const handleRedeem = (rewardId: string, cost: number) => {
    if (state.points >= cost) {
      redeemReward(rewardId, cost);
      setRedeemed(rewardId);
      setTimeout(() => setRedeemed(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="px-5 pt-10 pb-4" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
        <h1 className="text-white text-xl font-bold mb-1">Rewards & Ranking</h1>
        <div className="flex items-center gap-3">
          <PointsPill points={state.points} size="md" />
          <TierBadge tier={state.seller.tier} size="sm" />
          <span className="text-purple-200 text-sm ml-auto">#{riyaRank} in Mumbai</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        <button
          onClick={() => setTab("leaderboard")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors
            ${tab === "leaderboard" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-400"}`}
        >
          <Users size={15} /> Leaderboard
        </button>
        <button
          onClick={() => setTab("store")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors
            ${tab === "store" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-400"}`}
        >
          <Gift size={15} /> Points Store
        </button>
      </div>

      {/* LEADERBOARD */}
      {tab === "leaderboard" && (
        <div className="px-4 py-4 space-y-2">
          {lb.map((s) => {
            const isMe = s.id === "seller-01";
            const tierCfg = TIER_CONFIG[s.tier];
            return (
              <div key={s.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all
                  ${isMe ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-white border-gray-100"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0
                  ${s.rank === 1 ? "bg-yellow-400 text-yellow-900" : s.rank === 2 ? "bg-gray-300 text-gray-700" : s.rank === 3 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : s.rank}
                </div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white
                  ${isMe ? "bg-[#E63012]" : "bg-gray-400"}`}>
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-semibold truncate ${isMe ? "text-[#E63012]" : "text-gray-900"}`}>
                      {isMe ? `${s.shortName} (You)` : s.shortName}
                    </p>
                    <TierBadge tier={s.tier} size="sm" />
                  </div>
                  <p className="text-xs text-gray-400">{s.area} · {s.partnerType}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{s.totalPoints.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-gray-400">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STORE */}
      {tab === "store" && (
        <div className="px-4 py-4 space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
            <p className="text-xs text-blue-700">
              <span className="font-bold">How rewards are designed:</span> Most rewards cost MadMix ₹0. Cash rewards are small, capped, and funded from the marketing budget — not the 6% contribution margin.
            </p>
          </div>

          {BUCKETS.map((bucket) => {
            const cfg = BUCKET_LABELS[bucket];
            const bucketRewards = REWARDS.filter((r) => r.bucket === bucket);
            return (
              <div key={bucket}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-xs text-gray-400">{cfg.note}</span>
                </div>
                <div className="space-y-2">
                  {bucketRewards.map((r) => {
                    const meetsPoints = state.points >= r.pointsCost;
                    const meetsTier = (TIER_ORDER[state.seller.tier] ?? 0) >= (TIER_ORDER[r.minTier] ?? 0);
                    const canAfford = meetsPoints && meetsTier;
                    const isRedeemed = state.redeemedRewardIds.includes(r.id);
                    const justRedeemed = redeemed === r.id;
                    return (
                      <div key={r.id}
                        className={`bg-white rounded-2xl border p-4 flex items-center gap-3
                          ${isRedeemed ? "opacity-50" : ""} ${canAfford ? "border-gray-100" : "border-gray-50"}`}>
                        <span className="text-2xl shrink-0">{r.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                          {r.note && <p className="text-[10px] text-green-600 mt-1">{r.note}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold text-gray-700 mb-1">{r.pointsCost.toLocaleString()} pts</p>
                          {isRedeemed ? (
                            <span className="text-xs text-green-600 font-bold">✓ Done</span>
                          ) : (
                            <button
                              onClick={() => handleRedeem(r.id, r.pointsCost)}
                              disabled={!canAfford}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all
                                ${canAfford
                                  ? justRedeemed ? "bg-green-500 text-white" : "bg-[#E63012] text-white active:scale-95"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                            >
                              {justRedeemed ? "Unlocked!" : canAfford ? "Redeem" : !meetsTier ? `${r.minTier}+` : "Need more pts"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
