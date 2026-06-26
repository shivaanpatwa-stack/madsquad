import type { SaleRecord } from "./sales";

// ─────────────────────────────────────────────────────────────────────────────
// POINTS RULES
// ─────────────────────────────────────────────────────────────────────────────
// 1 point per ₹10 of sale value (verified sales only)
// +5 bonus if all data fields are complete (channel, area, ageBand, repeat, photo)
// Streak bonus handled in app state

export const calcPointsForSale = (sale: SaleRecord): number => {
  if (!sale.photoProof) return 0; // unverified = zero points

  const base = Math.floor(sale.value / 10);

  const isComplete =
    !!sale.channel &&
    !!sale.area &&
    !!sale.ageBand &&
    sale.repeatCustomer !== undefined &&
    sale.photoProof;

  const bonus = isComplete ? 5 : 0;

  return base + bonus;
};

export const totalPointsFromSales = (sales: SaleRecord[]): number =>
  sales.reduce((sum, s) => sum + calcPointsForSale(s), 0);

// ─────────────────────────────────────────────────────────────────────────────
// REWARDS STORE CATALOG
// ─────────────────────────────────────────────────────────────────────────────
export type RewardTier = "zero-cost" | "influence" | "cash";

export type Reward = {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  bucket: RewardTier;
  minTier: "Nibbler" | "Muncher" | "Crusher" | "Mad Legend";
  emoji: string;
  note?: string;
};

export const REWARDS: Reward[] = [
  // ── Zero-cost (status + access) ──────────────────────────────────────────
  {
    id: "rwd-01",
    name: "Verified Badge",
    description: "Show a ✅ badge on your leaderboard profile",
    pointsCost: 100,
    bucket: "zero-cost",
    minTier: "Nibbler",
    emoji: "✅",
  },
  {
    id: "rwd-02",
    name: "10% Bigger Consignment",
    description: "Get 10% more stock on your next MadMix reorder",
    pointsCost: 200,
    bucket: "zero-cost",
    minTier: "Muncher",
    emoji: "📦",
  },
  {
    id: "rwd-03",
    name: "Priority Delivery",
    description: "Your next reorder ships before standard partners",
    pointsCost: 350,
    bucket: "zero-cost",
    minTier: "Muncher",
    emoji: "⚡",
  },
  {
    id: "rwd-04",
    name: "Profile Spotlight",
    description: "Your profile is highlighted on the city leaderboard for 7 days",
    pointsCost: 500,
    bucket: "zero-cost",
    minTier: "Crusher",
    emoji: "⭐",
  },
  {
    id: "rwd-05",
    name: "Early Flavour Access",
    description: "Try new MadMix flavours before they go live",
    pointsCost: 400,
    bucket: "zero-cost",
    minTier: "Muncher",
    emoji: "🆕",
  },
  {
    id: "rwd-06",
    name: "25% Bigger Consignment",
    description: "Get 25% more stock on your next MadMix reorder",
    pointsCost: 600,
    bucket: "zero-cost",
    minTier: "Crusher",
    emoji: "📦",
  },

  // ── Influence (the smart one — zero margin cost) ──────────────────────────
  {
    id: "rwd-07",
    name: "🗳️ Flavour Vote",
    description:
      "Vote on the next MadMix flavour. Your choice goes directly to Gaurav. Exclusively for Mad Legends.",
    pointsCost: 2500,
    bucket: "influence",
    minTier: "Mad Legend",
    emoji: "🗳️",
    note: "Costs MadMix ₹0. Builds loyalty that money can't buy.",
  },

  // ── Cash (kept small, funded from marketing budget) ───────────────────────
  {
    id: "rwd-08",
    name: "₹100 Cash Voucher",
    description: "Redeemable on your next MadMix order",
    pointsCost: 800,
    bucket: "cash",
    minTier: "Crusher",
    emoji: "💸",
    note: "Funded from marketing budget. Capped per seller per month.",
  },
  {
    id: "rwd-09",
    name: "₹250 Cash Voucher",
    description: "Redeemable on your next MadMix order",
    pointsCost: 1800,
    bucket: "cash",
    minTier: "Crusher",
    emoji: "💸",
    note: "Funded from marketing budget. Capped per seller per month.",
  },
  {
    id: "rwd-10",
    name: "₹500 Cash Voucher",
    description: "Redeemable on your next MadMix order",
    pointsCost: 3500,
    bucket: "cash",
    minTier: "Mad Legend",
    emoji: "💰",
    note: "Funded from marketing budget. Capped per seller per month.",
  },
];

export const BUCKET_LABELS: Record<RewardTier, { label: string; note: string; color: string }> = {
  "zero-cost": {
    label: "Status & Access",
    note: "Costs MadMix ₹0 — pure retention fuel",
    color: "bg-green-100 text-green-700",
  },
  influence: {
    label: "Influence",
    note: "Zero margin cost, maximum loyalty",
    color: "bg-purple-100 text-purple-700",
  },
  cash: {
    label: "Cash Rewards",
    note: "Funded from marketing budget, not contribution margin",
    color: "bg-orange-100 text-orange-700",
  },
};
