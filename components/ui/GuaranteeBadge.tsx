import { Shield } from "lucide-react";

type Variant = "hero" | "card" | "mini";

const STYLES: Record<Variant, {
  wrapper: string;
  iconColor: string;
  textColor: string;
  bg: string;
  border: string;
  iconSize: number;
  textSize: string;
  animate: boolean;
}> = {
  hero: {
    wrapper: "inline-flex items-center gap-2 rounded-2xl px-4 py-2",
    bg:      "rgba(255,255,255,0.22)",
    border:  "1px solid rgba(255,255,255,0.35)",
    iconColor: "#fff",
    textColor: "#fff",
    iconSize: 15,
    textSize: "text-xs font-bold tracking-wide",
    animate: false,
  },
  card: {
    wrapper: "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5",
    bg:      "#FFF3E6",
    border:  "1.5px solid #FFB800",
    iconColor: "#FF6900",
    textColor: "#FF6900",
    iconSize: 16,
    textSize: "text-sm font-bold",
    animate: true,
  },
  mini: {
    wrapper: "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5",
    bg:      "#FFF3E6",
    border:  "1px solid #F0E6D8",
    iconColor: "#FF6900",
    textColor: "#6B5B45",
    iconSize: 13,
    textSize: "text-xs font-semibold",
    animate: false,
  },
};

export default function GuaranteeBadge({
  variant = "card",
  label = "MadMix Guarantee — Sell it or we buy it back",
}: {
  variant?: Variant;
  label?: string;
}) {
  const s = STYLES[variant];
  return (
    <span
      className={`${s.wrapper} ${s.animate ? "animate-shield-pulse" : ""}`}
      style={{ background: s.bg, border: s.border }}
    >
      <Shield size={s.iconSize} fill={s.iconColor} color={s.iconColor} />
      <span className={s.textSize} style={{ color: s.textColor }}>{label}</span>
    </span>
  );
}
