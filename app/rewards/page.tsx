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

const buildLeaderboard = () =>
  SELLERS.map((s) => {
    const sales = SEED_SALES.filter((sale) => sale.sellerId === s.id);
    const earnedPts = sales.reduce((sum, sale) => sum + calcPointsForSale(sale), 0);
    const total = s.points + earnedPts;
    return { ...s, totalPoints: total, tier: getTier(total) };
  }).sort((a, b) => b.totalPoints - a.totalPoints)
    .map((s, i) => ({ ...s, rank: i + 1 }));

const BUCKETS: RewardTier[] = ["zero-cost", "influence", "cash"];

const BUCKET_PILL: Record<RewardTier, { bg: string; color: string }> = {
  "zero-cost": { bg: "#dcfce7", color: "#15803d" },
  influence:   { bg: "#ede9fe", color: "#7C3AED" },
  cash:        { bg: "#FFF3E6", color: "#FF6900" },
};

export default function RewardsPage() {
  const { state, redeemReward } = useApp();
  const [tab, setTab] = useState<Tab>("store");
  const [redeemed, setRedeemed] = useState<string | null>(null);

  const TIER_ORDER: Record<string, number> = { Nibbler: 0, Muncher: 1, Crusher: 2, "Mad Legend": 3 };
  const leaderboard = buildLeaderboard();
  const lb = leaderboard
    .map((s) => s.id === "seller-01" ? { ...s, totalPoints: state.points, tier: getTier(state.points) } : s)
    .sort((a, b) => b.totalPoints - a.totalPoints)
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
    <div className="min-h-screen md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
      {/* Header — purple gradient differentiates Rewards */}
      <div className="px-5 pt-10 pb-4" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
        <h1 className="text-white text-xl font-extrabold mb-0.5">
          {tab === "store" ? "Points Kharch Karo, Mast Fayda Pao" : "Mumbai Rankings 👑"}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <PointsPill points={state.points} size="md" />
          <TierBadge tier={state.seller.tier} size="sm" />
          <span className="text-purple-200 text-sm ml-auto">#{riyaRank} in Mumbai</span>
        </div>
      </div>

      {/* Tabs — Store is default, Leaderboard is secondary */}
      <div className="flex bg-white" style={{ borderBottom: "1px solid #F0E6D8" }}>
        <button
          onClick={() => setTab("store")}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: tab === "store" ? "#7C3AED" : "#9C8870", borderBottom: tab === "store" ? "2px solid #7C3AED" : "2px solid transparent" }}
        >
          <Gift size={15} /> Points Store
        </button>
        <button
          onClick={() => setTab("leaderboard")}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: tab === "leaderboard" ? "#7C3AED" : "#9C8870", borderBottom: tab === "leaderboard" ? "2px solid #7C3AED" : "2px solid transparent" }}
        >
          <Users size={15} /> Rankings
        </button>
      </div>

      {/* LEADERBOARD */}
      {tab === "leaderboard" && (
        <div className="px-4 py-4 space-y-2">
          <p className="text-xs font-bold text-center mb-3" style={{ color: "#6B5B45" }}>
            Mumbai Ka Number 1 Kaun? 👑
          </p>
          {lb.map((s) => {
            const isMe = s.id === "seller-01";
            const rankEmoji = s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : null;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-2xl border transition-all"
                style={{
                  background: isMe ? "#FFF3E6" : "white",
                  borderColor: isMe ? "#FF6900" : "#F0E6D8",
                  borderLeft: isMe ? "3px solid #FF6900" : undefined,
                  boxShadow: isMe ? "0 2px 8px rgba(255,105,0,0.08)" : undefined,
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0
                  ${s.rank === 1 ? "bg-yellow-400 text-yellow-900" : s.rank === 2 ? "bg-gray-300 text-gray-700" : s.rank === 3 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {rankEmoji ?? s.rank}
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
                  style={{ background: isMe ? "#FF6900" : "#9C8870" }}
                >
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate" style={{ color: isMe ? "#FF6900" : "#1A1200" }}>
                      {isMe ? `${s.shortName} (You)` : s.shortName}
                    </p>
                    <TierBadge tier={s.tier} size="sm" />
                  </div>
                  <p className="text-xs" style={{ color: "#9C8870" }}>{s.area} · {s.partnerType}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{s.totalPoints.toLocaleString("en-IN")}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STORE */}
      {tab === "store" && (
        <div className="px-4 py-4 space-y-5">
          <div className="rounded-2xl p-3" style={{ background: "#EFF6FF", border: "1px solid #DBEAFE" }}>
            <p className="text-xs text-blue-700">
              <span className="font-bold">How rewards are designed:</span> Most rewards cost MadMix ₹0. Cash rewards are small, capped, and funded from the marketing budget — not the 6% contribution margin.
            </p>
          </div>

          {BUCKETS.map((bucket) => {
            const cfg = BUCKET_LABELS[bucket];
            const pill = BUCKET_PILL[bucket];
            const bucketRewards = REWARDS.filter((r) => r.bucket === bucket);
            return (
              <div key={bucket}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: pill.bg, color: pill.color }}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs" style={{ color: "#9C8870" }}>{cfg.note}</span>
                </div>
                <div className="space-y-2">
                  {bucketRewards.map((r) => {
                    const meetsPoints = state.points >= r.pointsCost;
                    const meetsTier = (TIER_ORDER[state.seller.tier] ?? 0) >= (TIER_ORDER[r.minTier] ?? 0);
                    const canAfford = meetsPoints && meetsTier;
                    const isRedeemed = state.redeemedRewardIds.includes(r.id);
                    const justRedeemed = redeemed === r.id;
                    return (
                      <div
                        key={r.id}
                        className={`bg-white rounded-2xl p-4 flex items-center gap-3 ${isRedeemed ? "opacity-50" : ""}`}
                        style={{ border: `1px solid ${canAfford ? "#F0E6D8" : "#F9F5F0"}` }}
                      >
                        <span className="text-2xl shrink-0">{r.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: "#1A1200" }}>{r.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#6B5B45" }}>{r.description}</p>
                          {r.note && <p className="text-[10px] text-green-600 mt-1">{r.note}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold mb-1" style={{ color: "#1A1200" }}>{r.pointsCost.toLocaleString()} pts</p>
                          {isRedeemed ? (
                            <span className="text-xs text-green-600 font-bold">✓ Done</span>
                          ) : (
                            <button
                              onClick={() => handleRedeem(r.id, r.pointsCost)}
                              disabled={!canAfford}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                              style={{
                                background: canAfford
                                  ? justRedeemed ? "#22c55e" : "#FF6900"
                                  : "#F0E6D8",
                                color: canAfford ? "white" : "#9C8870",
                                cursor: canAfford ? "pointer" : "not-allowed",
                              }}
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
