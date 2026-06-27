"use client";
import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { SELLERS, TIER_CONFIG, getTier } from "@/lib/sellers";
import { SEED_SALES } from "@/lib/sales";
import { calcPointsForSale } from "@/lib/points";
import TierBadge from "@/components/ui/TierBadge";
import PointsPill from "@/components/ui/PointsPill";
import { Gift, Users, CheckCircle, Lock } from "lucide-react";

type Tab = "progress" | "leaderboard";

// ── Reward catalog (new: reachable early wins + ~₹0-cost growth/elite) ──────
type RewardItem = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  points: number;
  minTier: "Nibbler" | "Muncher" | "Crusher" | "Mad Legend";
  group: "early" | "growth" | "elite";
  cashCost?: string;
};

const REWARD_CATALOG: RewardItem[] = [
  // Early wins — reachable in first days
  { id: "rwd-first-sale",  emoji: "🏅", name: "First Sale Badge",        desc: "Unlocks on your very first sale. Instant celebration.",             points: 50,   minTier: "Nibbler",    group: "early"  },
  { id: "rwd-cashback-50", emoji: "💰", name: "₹50 Back on Starter",     desc: "Real money back on your starter pack investment.",                  points: 100,  minTier: "Nibbler",    group: "early"  },
  { id: "rwd-verified",    emoji: "✅", name: "Verified Seller Badge",    desc: "Show a ✅ on your profile. Builds trust with buyers.",              points: 150,  minTier: "Nibbler",    group: "early"  },
  { id: "rwd-zone",        emoji: "📍", name: "Unlock Next Territory",    desc: "Expand to a second zone near your current patch. Free.",            points: 200,  minTier: "Nibbler",    group: "early"  },
  // Growth — moderate points, mostly ₹0 cost
  { id: "rwd-consignment", emoji: "📦", name: "Bigger Consignment",       desc: "Get 10% more stock on your next MadMix reorder.",                   points: 350,  minTier: "Muncher",    group: "growth" },
  { id: "rwd-priority",    emoji: "⚡", name: "Priority Delivery",        desc: "Your next reorder ships before standard partners.",                 points: 500,  minTier: "Muncher",    group: "growth" },
  { id: "rwd-early",       emoji: "🍿", name: "New Flavour Early Access", desc: "Try new MadMix flavours before launch. First pick.",               points: 600,  minTier: "Muncher",    group: "growth" },
  { id: "rwd-spotlight",   emoji: "⭐", name: "MadSquad Star",            desc: "Profile spotlight on the MadSquad network page for 7 days.",        points: 800,  minTier: "Crusher",    group: "growth" },
  // Elite — high points, mostly ₹0 cost
  { id: "rwd-vote",        emoji: "🗳️", name: "Flavour Vote",             desc: "Vote on the next MadMix flavour. Your choice shapes the product.",  points: 1200, minTier: "Crusher",    group: "elite"  },
  { id: "rwd-captain",     emoji: "🏙️", name: "Territory Captain",        desc: "Manage a prime zone and mentor 2 sellers in your patch.",           points: 2000, minTier: "Mad Legend", group: "elite"  },
  { id: "rwd-bonus",       emoji: "💵", name: "Cash Bonus (₹500)",        desc: "Rare cash bonus funded from MadMix marketing budget.",              points: 2500, minTier: "Mad Legend", group: "elite", cashCost: "₹500" },
  { id: "rwd-direct",      emoji: "📞", name: "Direct Line to MadMix",   desc: "Feedback line to the MadMix team. Your voice heard by the founder.", points: 3000, minTier: "Mad Legend", group: "elite"  },
];

const GROUP_META: Record<string, { label: string; note: string; bg: string; color: string }> = {
  early:  { label: "Early Wins",       note: "Achievable in your first few days",           bg: "#dcfce7", color: "#15803d" },
  growth: { label: "Growth Rewards",   note: "~₹0 cost to MadMix · unlocks with progress", bg: "#ede9fe", color: "#7C3AED" },
  elite:  { label: "Elite Rewards",    note: "High impact · mostly ₹0 cost",               bg: "#FFF3E6", color: "#FF6900" },
};

const TIER_ORDER: Record<string, number> = { Nibbler: 0, Muncher: 1, Crusher: 2, "Mad Legend": 3 };

const buildLeaderboard = () =>
  SELLERS.map((s) => {
    const pts = SEED_SALES.filter((sale) => sale.sellerId === s.id)
      .reduce((sum, sale) => sum + calcPointsForSale(sale), 0) + s.points;
    return { ...s, totalPoints: pts, tier: getTier(pts) };
  })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((s, i) => ({ ...s, rank: i + 1 }));

export default function RewardsPage() {
  const { state, redeemReward } = useApp();
  const [tab, setTab] = useState<Tab>("progress");
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null);

  const lb = buildLeaderboard()
    .map((s) => s.id === state.seller.id ? { ...s, totalPoints: state.points, tier: getTier(state.points) } : s)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const myRank = lb.find((s) => s.id === state.seller.id)?.rank ?? "-";

  const handleRedeem = (id: string, cost: number) => {
    if (state.points >= cost && !state.redeemedRewardIds.includes(id)) {
      redeemReward(id, cost);
      setJustRedeemed(id);
      setTimeout(() => setJustRedeemed(null), 2000);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: "linear-gradient(135deg, #3B0764 0%, #7C3AED 100%)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(167,139,250,0.6)" }}>
              {tab === "progress" ? "Rewards Store" : "Mumbai Rankings"}
            </p>
            <h1 className="text-white font-black text-2xl" style={{ letterSpacing: "-0.01em" }}>
              {tab === "progress" ? "Your Rewards" : "Rankings 👑"}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 mt-1">
            <PointsPill points={state.points} size="md" />
            <div className="flex items-center gap-2">
              <TierBadge tier={state.seller.tier} size="sm" />
              <span className="text-xs font-bold" style={{ color: "rgba(167,139,250,0.8)" }}>#{myRank} Mumbai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — progress is default, leaderboard secondary */}
      <div className="flex bg-white border-b" style={{ borderColor: "#F0E6D8" }}>
        <button
          onClick={() => setTab("progress")}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ color: tab === "progress" ? "#7C3AED" : "#9C8870", borderBottom: tab === "progress" ? "2px solid #7C3AED" : "2px solid transparent" }}
        >
          <Gift size={14} /> Rewards Store
        </button>
        <button
          onClick={() => setTab("leaderboard")}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ color: tab === "leaderboard" ? "#7C3AED" : "#9C8870", borderBottom: tab === "leaderboard" ? "2px solid #7C3AED" : "2px solid transparent" }}
        >
          <Users size={14} /> Rankings
        </button>
      </div>

      {/* STORE */}
      {tab === "progress" && (
        <div className="px-4 py-4 max-w-5xl mx-auto space-y-5">
          {(["early", "growth", "elite"] as const).map((group) => {
            const meta = GROUP_META[group];
            const items = REWARD_CATALOG.filter((r) => r.group === group);
            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  <span className="text-xs" style={{ color: "#9C8870" }}>{meta.note}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {items.map((r) => {
                    const meetsPoints = state.points >= r.points;
                    const meetsTier = (TIER_ORDER[state.seller.tier] ?? 0) >= (TIER_ORDER[r.minTier] ?? 0);
                    const canRedeem = meetsPoints && meetsTier;
                    const done = state.redeemedRewardIds.includes(r.id);
                    const pct = Math.min(100, Math.round((state.points / r.points) * 100));

                    return (
                      <div
                        key={r.id}
                        className="bg-white rounded-2xl p-4 flex gap-3"
                        style={{
                          border: `1px solid ${done ? "#dcfce7" : canRedeem ? "#FF6900" : "#F0E6D8"}`,
                          opacity: done ? 0.75 : 1,
                        }}
                      >
                        <span className="text-2xl shrink-0">{r.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{r.name}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6B5B45" }}>{r.desc}</p>
                          {/* Progress bar */}
                          {!done && (
                            <div className="mt-2">
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    background: canRedeem ? "#22c55e" : "#FF6900",
                                  }}
                                />
                              </div>
                              <p className="text-[10px] mt-0.5" style={{ color: "#9C8870" }}>
                                {state.points.toLocaleString()} / {r.points.toLocaleString()} pts
                                {!meetsTier && ` · Requires ${r.minTier}`}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col items-end justify-between">
                          <span className="text-xs font-bold" style={{ color: "#6B5B45" }}>{r.points.toLocaleString()} pts</span>
                          {done ? (
                            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "#22c55e" }}>
                              <CheckCircle size={12} /> Done
                            </div>
                          ) : canRedeem ? (
                            <button
                              onClick={() => handleRedeem(r.id, r.points)}
                              className="text-xs font-black px-3 py-1.5 rounded-xl text-white active:scale-95 transition-all"
                              style={{ background: justRedeemed === r.id ? "#22c55e" : "#FF6900" }}
                            >
                              {justRedeemed === r.id ? "Unlocked!" : "Redeem"}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px]" style={{ color: "#9C8870" }}>
                              <Lock size={10} /> {!meetsTier ? r.minTier : "Keep going"}
                            </div>
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

      {/* LEADERBOARD — demoted, personal progress first */}
      {tab === "leaderboard" && (
        <div className="px-4 py-4 max-w-5xl mx-auto space-y-2">
          <div className="rounded-xl px-3 py-2 mb-3" style={{ background: "#FFF3E6", border: "1px solid #F0E6D8" }}>
            <p className="text-xs" style={{ color: "#6B5B45" }}>
              <span className="font-bold">Your progress vs your own past</span> is what matters most. The ranking is just for context.
            </p>
          </div>
          {lb.map((s) => {
            const isMe = s.id === state.seller.id;
            const medal = s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : null;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{
                  background: isMe ? "#FFF3E6" : "white",
                  border: `1px solid ${isMe ? "#FF6900" : "#F0E6D8"}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                  style={{
                    background: s.rank === 1 ? "#FFB800" : s.rank <= 3 ? "#F0E6D8" : "#F9F5F0",
                    color: s.rank === 1 ? "#1A1200" : "#6B5B45",
                  }}
                >
                  {medal ?? s.rank}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: isMe ? "#FF6900" : "#9C8870" }}>
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: isMe ? "#FF6900" : "#1A1200" }}>
                      {isMe ? `${s.shortName} (You)` : s.shortName}
                    </p>
                    <TierBadge tier={s.tier} size="sm" />
                  </div>
                  <p className="text-xs" style={{ color: "#9C8870" }}>{s.area}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "#1A1200" }}>{s.totalPoints.toLocaleString("en-IN")}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
