import { TIER_CONFIG, type Tier } from "@/lib/sellers";

export default function TierBadge({
  tier,
  size = "md",
}: {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}) {
  const cfg = TIER_CONFIG[tier];
  const sizeClass =
    size === "sm" ? "text-[10px] px-2 py-0.5" :
    size === "lg" ? "text-sm px-4 py-1.5 font-bold" :
    "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${cfg.bg} ${cfg.color} ${sizeClass}`}
    >
      <span>{cfg.emoji}</span>
      <span>{tier}</span>
    </span>
  );
}
