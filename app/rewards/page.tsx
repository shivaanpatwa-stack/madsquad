"use client";
import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { SELLERS, TIER_CONFIG, getTier } from "@/lib/sellers";
import { SEED_SALES } from "@/lib/sales";
import { calcPointsForSale } from "@/lib/points";
import TierBadge from "@/components/ui/TierBadge";
import PointsPill from "@/components/ui/PointsPill";
import { Gift, Zap, CheckCircle, Lock, Star, Trophy, Crown } from "lucide-react";

type Tab = "points" | "perks" | "community";

type PointsReward = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  points: number;
  minTier: "Nibbler" | "Muncher" | "Crusher" | "Mad Legend";
};

const POINTS_REWARDS: PointsReward[] = [
  { id: "rwd-first-sale",   emoji: "🏅", name: "First Sale Badge",       desc: "Earned on your very first sale. Permanent profile badge.",              points: 50,   minTier: "Nibbler"    },
  { id: "rwd-verified",     emoji: "✅", name: "Verified Seller Badge",  desc: "Show a ✅ on your profile. Builds trust with every buyer.",             points: 150,  minTier: "Nibbler"    },
  { id: "rwd-zone",         emoji: "📍", name: "Territory Unlock",       desc: "Expand into a second zone near your current patch.",                    points: 200,  minTier: "Nibbler"    },
  { id: "rwd-certified",    emoji: "🎓", name: "Certified MadSquad",     desc: "Complete the Academy + 50 sales. Highest seller credential.",           points: 400,  minTier: "Muncher"    },
  { id: "rwd-spotlight",    emoji: "⭐", name: "MadSquad Star",          desc: "Profile spotlight on the MadSquad network page for 7 days.",            points: 800,  minTier: "Crusher"    },
  { id: "rwd-vote",         emoji: "🗳️", name: "Flavour Vote",           desc: "Vote on the next MadMix flavour. Your choice shapes the product.",      points: 1200, minTier: "Crusher"    },
  { id: "rwd-captain",      emoji: "🏙️", name: "Territory Captain",      desc: "Lead a prime zone. Mentor 2 sellers in your patch.",                    points: 2000, minTier: "Mad Legend" },
  { id: "rwd-founder-call", emoji: "📞", name: "Direct Line to MadMix",  desc: "Your feedback heard by the founder. A seat at the table.",              points: 3000, minTier: "Mad Legend" },
];

type Perk = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  tier: "Nibbler" | "Muncher" | "Crusher" | "Mad Legend";
  detail: string;
};

const PERKS: Perk[] = [
  { id: "p-1", emoji: "📦",   name: "Standard Consignment",    desc: "Starter packs at partner pricing.",                 tier: "Nibbler",    detail: "50 packs · ₹500 cost · ₹10 sell price"  },
  { id: "p-2", emoji: "🌟",   name: "Early Flavour Access",    desc: "Try new flavours 2 weeks before general launch.",       tier: "Muncher",    detail: "New flavour samples shipped directly"     },
  { id: "p-3", emoji: "📦+",  name: "10% Bigger Consignment",  desc: "More stock per order — better coverage for your zone.", tier: "Muncher",    detail: "55 packs at same ₹500 cost"              },
  { id: "p-4", emoji: "⚡",   name: "Priority Delivery",       desc: "Your reorders ship before standard partners.",          tier: "Crusher",    detail: "2–3 day turnaround vs 5–7 standard"       },
  { id: "p-5", emoji: "📦++", name: "25% Bigger Consignment",  desc: "Significant volume advantage over newer sellers.",      tier: "Crusher",    detail: "62 packs at same ₹500 cost"              },
  { id: "p-6", emoji: "💵",   name: "Cash Voucher Access",     desc: "Vouchers from MadMix marketing budget.",                tier: "Crusher",    detail: "₹100 voucher per milestone achieved"      },
  { id: "p-7", emoji: "👑",   name: "Max Consignment",         desc: "Largest possible stock allocation.",                    tier: "Mad Legend", detail: "75+ packs · bespoke pricing discussed"    },
  { id: "p-8", emoji: "💵💵", name: "Premium Cash Vouchers",   desc: "Premium vouchers — highest tier sellers only.",         tier: "Mad Legend", detail: "Up to ₹500 per milestone"                },
  { id: "p-9", emoji: "🤝",   name: "Founder Relationship",    desc: "Personal shoutout from Gaurav. Direct channel.",       tier: "Mad Legend", detail: "Monthly call with leadership team"         },
];

const TIER_ORDER: Record<string, number> = { Nibbler: 0, Muncher: 1, Crusher: 2, "Mad Legend": 3 };
const RANK_ICONS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

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
  const [tab, setTab] = useState<Tab>("points");
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null);
  const myTierOrder = TIER_ORDER[state.seller.tier];

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
      <div style={{ background: "linear-gradient(135deg, #3B0764 0%, #7C3AED 100%)", padding: "48px 20px 24px" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Rewards</p>
            <h1 className="text-white font-black leading-tight" style={{ fontSize: 26 }}>{state.seller.name}</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Rank #{myRank} in MadSquad</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PointsPill points={state.points} size="md" />
            <TierBadge tier={state.seller.tier} size="sm" />
          </div>
        </div>
        <div className="flex gap-2">
          {(["points", "perks", "community"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="text-xs font-bold px-3 py-1.5 rounded-full capitalize transition-all"
              style={{ background: tab === t ? "white" : "rgba(255,255,255,0.12)", color: tab === t ? "#7C3AED" : "rgba(255,255,255,0.55)" }}>
              {t === "points" ? "Points" : t === "perks" ? "Seller Perks" : "Community"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* POINTS TAB */}
        {tab === "points" && (
          <>
            <div className="rounded-2xl flex items-center gap-4"
              style={{ background: "white", border: "1px solid #F0E6D8", padding: "16px 20px" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF3E6" }}>
                <Zap size={18} style={{ color: "#FF6900" }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#9C8870" }}>Available Points</p>
                <p className="font-black text-2xl" style={{ color: "#1A1200" }}>{state.points.toLocaleString("en-IN")}</p>
              </div>
              <p className="text-xs text-right" style={{ color: "#9C8870" }}>Sales +<br />Academy +<br />Referrals</p>
            </div>

            {POINTS_REWARDS.map((reward) => {
              const redeemed = state.redeemedRewardIds.includes(reward.id);
              const canRedeem = state.points >= reward.points && !redeemed;
              const tierLocked = TIER_ORDER[reward.minTier] > myTierOrder;
              const justNow = justRedeemed === reward.id;
              return (
                <div key={reward.id} className="rounded-2xl overflow-hidden"
                  style={{ background: "white", border: `1.5px solid ${redeemed ? "#22c55e" : justNow ? "#FF6900" : "#F0E6D8"}`, opacity: tierLocked ? 0.55 : 1 }}>
                  <div className="flex items-start gap-3" style={{ padding: "16px 20px" }}>
                    <span style={{ fontSize: 28, lineHeight: 1 }}>{reward.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-black text-sm" style={{ color: "#1A1200" }}>{reward.name}</p>
                        {reward.minTier !== "Nibbler" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "#EDE9FE", color: "#7C3AED" }}>{reward.minTier}+</span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#6B5B45" }}>{reward.desc}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-black text-sm" style={{ color: redeemed ? "#22c55e" : "#FF6900" }}>
                        {reward.points.toLocaleString()} pts
                      </p>
                      {!redeemed && !tierLocked && (
                        <button onClick={() => handleRedeem(reward.id, reward.points)} disabled={!canRedeem}
                          className="mt-1.5 text-[10px] font-black px-2.5 py-1 rounded-full transition-all active:scale-95"
                          style={{ background: canRedeem ? "#FF6900" : "#F0E6D8", color: canRedeem ? "white" : "#9C8870", cursor: canRedeem ? "pointer" : "not-allowed" }}>
                          {canRedeem ? "Unlock" : `Need ${(reward.points - state.points).toLocaleString()} more`}
                        </button>
                      )}
                      {redeemed && <CheckCircle size={16} style={{ color: "#22c55e", marginTop: 6 }} />}
                      {tierLocked && <Lock size={13} style={{ color: "#9C8870", marginTop: 6 }} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* PERKS TAB */}
        {tab === "perks" && (
          <>
            <div className="rounded-2xl" style={{ background: "#EDE9FE", border: "1px solid #DDD6FE", padding: "14px 18px" }}>
              <p className="text-sm font-bold" style={{ color: "#7C3AED" }}>Perks unlock automatically with your tier — no points needed.</p>
            </div>
            {(["Nibbler", "Muncher", "Crusher", "Mad Legend"] as const).map((tier) => {
              const tierPerks = PERKS.filter((p) => p.tier === tier);
              const unlocked = TIER_ORDER[tier] <= myTierOrder;
              const cfg = TIER_CONFIG[tier];
              return (
                <div key={tier} className="rounded-2xl overflow-hidden"
                  style={{ background: "white", border: "1.5px solid #F0E6D8", opacity: unlocked ? 1 : 0.6 }}>
                  <div className="flex items-center gap-3 px-5 py-3"
                    style={{ background: unlocked ? (tier === "Mad Legend" ? "#1A1200" : "#FFF3E6") : "#F8F4F0" }}>
                    <span style={{ fontSize: 18 }}>{cfg.emoji}</span>
                    <p className="font-black text-sm flex-1"
                      style={{ color: unlocked ? (tier === "Mad Legend" ? "white" : "#1A1200") : "#9C8870" }}>{tier}</p>
                    {unlocked
                      ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#22c55e", color: "white" }}>Unlocked</span>
                      : <span className="text-[10px] font-bold" style={{ color: "#9C8870" }}>{cfg.minPoints.toLocaleString()} pts</span>
                    }
                  </div>
                  {tierPerks.map((perk) => (
                    <div key={perk.id} className="flex items-start gap-3 px-5 py-3.5" style={{ borderTop: "1px solid #F0E6D8" }}>
                      <span style={{ fontSize: 20 }}>{perk.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm" style={{ color: "#1A1200" }}>{perk.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B5B45" }}>{perk.desc}</p>
                        <p className="text-[10px] mt-1 font-semibold" style={{ color: "#9C8870" }}>{perk.detail}</p>
                      </div>
                      {unlocked ? <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0, marginTop: 2 }} /> : <Lock size={13} style={{ color: "#9C8870", flexShrink: 0, marginTop: 3 }} />}
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

        {/* COMMUNITY TAB */}
        {tab === "community" && (
          <>
            <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1A1200 0%, #2D2000 100%)" }}>
              <div style={{ padding: "20px 24px" }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
                    style={{ background: "rgba(255,105,0,0.2)", color: "#FF6900" }}>{state.seller.avatar}</div>
                  <div className="flex-1">
                    <p className="text-white font-black text-lg">{state.seller.name}</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{state.seller.area} · {state.seller.partnerType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Rank</p>
                    <p className="font-black text-3xl" style={{ color: "#FF6900" }}>#{myRank}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Builders */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
              <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F0E6D8" }}>
                <Gift size={14} style={{ color: "#FF6900" }} />
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Top Community Builders</p>
              </div>
              {[
                { name: "Vikram Rao",   area: "Thane",   referrals: 8,  pts: 3100 },
                { name: "Aarav Mehta",  area: "Powai",   referrals: 5,  pts: 1820 },
                { name: "Arjun Sharma", area: "Andheri", referrals: 3,  pts: state.points, isMe: true },
                { name: "Sneha Nair",   area: "Andheri", referrals: 2,  pts: 1650 },
                { name: "Rohit Das",    area: "BKC",     referrals: 2,  pts: 1470 },
              ].map(({ name, area, referrals, pts, isMe }, i) => (
                <div key={name} className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: "1px solid #F8F0E8", background: isMe ? "#FFF8F0" : "transparent" }}>
                  <span style={{ fontSize: 18, width: 24 }}>{RANK_ICONS[i + 1] ?? `${i + 1}.`}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: isMe ? "#FF6900" : "#F0E6D8", color: isMe ? "white" : "#6B5B45" }}>
                    {name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "#1A1200" }}>
                      {name}{isMe && <span className="text-[10px] font-bold" style={{ color: "#FF6900" }}> • you</span>}
                    </p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>{area}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black" style={{ color: "#1A1200" }}>{referrals} referrals</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>{pts.toLocaleString()} pts</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sales Leaderboard */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
              <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F0E6D8" }}>
                <Trophy size={14} style={{ color: "#7C3AED" }} />
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Sales Leaderboard</p>
              </div>
              {lb.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: "1px solid #F8F0E8", background: s.id === state.seller.id ? "#FFF8F0" : "transparent" }}>
                  <span style={{ fontSize: 16, width: 24 }}>{RANK_ICONS[s.rank] ?? `${s.rank}.`}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: s.id === state.seller.id ? "#FF6900" : "#F0E6D8", color: s.id === state.seller.id ? "white" : "#6B5B45" }}>
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "#1A1200" }}>
                      {s.name}{s.id === state.seller.id && <span className="text-[10px] font-bold" style={{ color: "#FF6900" }}> • you</span>}
                    </p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>{s.area}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black" style={{ color: "#1A1200" }}>{s.totalPoints.toLocaleString()} pts</p>
                    <p className="text-[10px]" style={{ color: "#9C8870" }}>{s.tier}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl" style={{ background: "#FFF3E6", border: "1px solid #F0E6D8", padding: "14px 18px" }}>
              <div className="flex items-start gap-2">
                <Star size={13} style={{ color: "#FF6900", flexShrink: 0, marginTop: 2 }} />
                <p className="text-xs leading-relaxed" style={{ color: "#6B5B45" }}>
                  <strong style={{ color: "#1A1200" }}>Community rankings are recognition only.</strong> Earnings come from the packs you sell — not from leaderboard position or referrals.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
              <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F0E6D8" }}>
                <Crown size={14} style={{ color: "#FFB800" }} />
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Tier Progress</p>
              </div>
              {(["Nibbler", "Muncher", "Crusher", "Mad Legend"] as const).map((tier) => {
                const cfg = TIER_CONFIG[tier];
                const unlocked = TIER_ORDER[tier] <= myTierOrder;
                const isCurrent = tier === state.seller.tier;
                return (
                  <div key={tier} className="flex items-center gap-3 px-5 py-3.5"
                    style={{ borderBottom: "1px solid #F8F0E8", background: isCurrent ? "#FFF3E6" : "transparent" }}>
                    <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: isCurrent ? "#FF6900" : unlocked ? "#1A1200" : "#9C8870" }}>
                        {tier}{isCurrent && " ← You"}
                      </p>
                      <p className="text-[10px]" style={{ color: "#9C8870" }}>{cfg.minPoints.toLocaleString()} pts</p>
                    </div>
                    {unlocked ? <CheckCircle size={16} style={{ color: "#22c55e" }} /> : <Lock size={13} style={{ color: "#9C8870" }} />}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
