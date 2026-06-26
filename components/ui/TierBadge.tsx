import type { Tier } from "@/lib/sellers";

const TIER_STYLES: Record<Tier, { bg: string; color: string; glow: boolean }> = {
  Nibbler:      { bg: "#F3F4F6", color: "#6B7280", glow: false },
  Muncher:      { bg: "#FFF3E6", color: "#FF6900", glow: false },
  Crusher:      { bg: "#FEE2E2", color: "#D62828", glow: false },
  "Mad Legend": { bg: "#EDE9FE", color: "#7C3AED", glow: true  },
};

const TIER_EMOJI: Record<Tier, string> = {
  Nibbler:      "🐭",
  Muncher:      "🐹",
  Crusher:      "🦊",
  "Mad Legend": "👑",
};

export default function TierBadge({
  tier,
  size = "md",
}: {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}) {
  const s = TIER_STYLES[tier];
  const sizeClass =
    size === "sm" ? "text-[10px] px-2 py-0.5" :
    size === "lg" ? "text-sm px-4 py-1.5 font-bold" :
    "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass} ${s.glow ? "animate-tier-glow" : ""}`}
      style={{ background: s.bg, color: s.color }}
    >
      <span>{TIER_EMOJI[tier]}</span>
      <span>{tier}</span>
    </span>
  );
}
