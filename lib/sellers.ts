export type PartnerType =
  | "Home-based seller"
  | "Student ambassador"
  | "Institutional connector"
  | "Hub partner"
  | "Retail staff promoter";

export type Tier = "Nibbler" | "Muncher" | "Crusher" | "Mad Legend";

export type Seller = {
  id: string;
  name: string;
  shortName: string;
  partnerType: PartnerType;
  area: string;
  pincode: string;
  tier: Tier;
  points: number;
  avatar: string; // initials fallback
  isCurrentUser?: boolean;
};

export const SELLERS: Seller[] = [
  {
    id: "seller-01",
    name: "Riya Sharma",
    shortName: "Riya",
    partnerType: "Home-based seller",
    area: "Bandra",
    pincode: "400050",
    tier: "Muncher",
    points: 1240,
    avatar: "RS",
    isCurrentUser: true,
  },
  {
    id: "seller-02",
    name: "Aarav Mehta",
    shortName: "Aarav",
    partnerType: "Student ambassador",
    area: "Powai",
    pincode: "400076",
    tier: "Crusher",
    points: 1820,
    avatar: "AM",
  },
  {
    id: "seller-03",
    name: "Sneha Nair",
    shortName: "Sneha",
    partnerType: "Institutional connector",
    area: "Andheri",
    pincode: "400053",
    tier: "Crusher",
    points: 1650,
    avatar: "SN",
  },
  {
    id: "seller-04",
    name: "Vikram Rao",
    shortName: "Vikram",
    partnerType: "Hub partner",
    area: "Thane",
    pincode: "400601",
    tier: "Mad Legend",
    points: 3100,
    avatar: "VR",
  },
  {
    id: "seller-05",
    name: "Fatima Khan",
    shortName: "Fatima",
    partnerType: "Retail staff promoter",
    area: "Lower Parel",
    pincode: "400013",
    tier: "Muncher",
    points: 980,
    avatar: "FK",
  },
  {
    id: "seller-06",
    name: "Karan Patel",
    shortName: "Karan",
    partnerType: "Home-based seller",
    area: "Borivali",
    pincode: "400066",
    tier: "Nibbler",
    points: 420,
    avatar: "KP",
  },
  {
    id: "seller-07",
    name: "Ananya Iyer",
    shortName: "Ananya",
    partnerType: "Student ambassador",
    area: "Vashi",
    pincode: "400703",
    tier: "Muncher",
    points: 1100,
    avatar: "AI",
  },
  {
    id: "seller-08",
    name: "Rohit Das",
    shortName: "Rohit",
    partnerType: "Institutional connector",
    area: "BKC",
    pincode: "400051",
    tier: "Crusher",
    points: 1470,
    avatar: "RD",
  },
];

export const CHANNELS = [
  "School",
  "College",
  "Corporate Office",
  "Gym",
  "Café",
  "Hospital",
  "Vending Machine",
  "Metro Stall",
] as const;

export type Channel = (typeof CHANNELS)[number];

export const AREAS = [
  { name: "Bandra", pincode: "400050" },
  { name: "Andheri", pincode: "400053" },
  { name: "Powai", pincode: "400076" },
  { name: "Lower Parel", pincode: "400013" },
  { name: "BKC", pincode: "400051" },
  { name: "Borivali", pincode: "400066" },
  { name: "Thane", pincode: "400601" },
  { name: "Vashi", pincode: "400703" },
];

export type AgeBand = "Under 18" | "18-25" | "26-40" | "41+";
export const AGE_BANDS: AgeBand[] = ["Under 18", "18-25", "26-40", "41+"];

export const TIER_CONFIG: Record<
  Tier,
  {
    label: Tier;
    minPoints: number;
    maxPoints: number;
    color: string;
    bg: string;
    perks: string[];
    emoji: string;
  }
> = {
  Nibbler: {
    label: "Nibbler",
    minPoints: 0,
    maxPoints: 499,
    color: "text-gray-600",
    bg: "bg-gray-100",
    perks: ["Basic app access", "Standard consignment size"],
    emoji: "🐭",
  },
  Muncher: {
    label: "Muncher",
    minPoints: 500,
    maxPoints: 1499,
    color: "text-orange-600",
    bg: "bg-orange-100",
    perks: [
      "Verified badge",
      "10% larger consignment",
      "Early new flavour access",
    ],
    emoji: "🐹",
  },
  Crusher: {
    label: "Crusher",
    minPoints: 1500,
    maxPoints: 2999,
    color: "text-red-600",
    bg: "bg-red-100",
    perks: [
      "Priority delivery",
      "25% larger consignment",
      "Profile spotlight on leaderboard",
      "Cash voucher access (₹100)",
    ],
    emoji: "🦊",
  },
  "Mad Legend": {
    label: "Mad Legend",
    minPoints: 3000,
    maxPoints: 999999,
    color: "text-purple-600",
    bg: "bg-purple-100",
    perks: [
      "Priority delivery + biggest consignment",
      "Cash vouchers (up to ₹500)",
      "🗳️ Flavour Vote — vote on the next MadMix flavour",
      "Personal shoutout from Gaurav",
    ],
    emoji: "👑",
  },
};

export const getTier = (points: number): Tier => {
  if (points >= 3000) return "Mad Legend";
  if (points >= 1500) return "Crusher";
  if (points >= 500) return "Muncher";
  return "Nibbler";
};

export const getNextTier = (
  tier: Tier
): { tier: Tier; pointsNeeded: number } | null => {
  const next: Record<Tier, Tier | null> = {
    Nibbler: "Muncher",
    Muncher: "Crusher",
    Crusher: "Mad Legend",
    "Mad Legend": null,
  };
  const nextTier = next[tier];
  if (!nextTier) return null;
  return {
    tier: nextTier,
    pointsNeeded: TIER_CONFIG[nextTier].minPoints,
  };
};

export const getCurrentSeller = (): Seller =>
  SELLERS.find((s) => s.isCurrentUser)!;
