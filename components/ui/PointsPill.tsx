import { Zap } from "lucide-react";

export default function PointsPill({
  points,
  size = "md",
}: {
  points: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "text-xs px-2 py-0.5 gap-1" :
    size === "lg" ? "text-lg px-4 py-2 gap-2 font-bold" :
    "text-sm px-3 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full bg-yellow-400 text-yellow-900 font-semibold ${sizeClass}`}
    >
      <Zap size={size === "lg" ? 18 : 13} fill="currentColor" />
      {points.toLocaleString("en-IN")} pts
    </span>
  );
}
