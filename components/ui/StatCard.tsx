import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  sub?: string;
  trend?: number;       // positive = up, negative = down
  accent?: string;      // color for the value, defaults to #FF6900
  dark?: boolean;       // dark surface variant
  className?: string;
};

export default function StatCard({
  label, value, sub, trend, accent = "#FF6900", dark = false, className = "",
}: StatCardProps) {
  const trendUp = trend !== undefined && trend > 0;
  const trendDn = trend !== undefined && trend < 0;

  return (
    <div
      className={`rounded-[20px] px-4 py-4 ${className}`}
      style={{
        background: dark ? "rgba(255,255,255,0.08)" : "#fff",
        border: dark ? "none" : "1px solid #F0E6D8",
        boxShadow: dark ? "none" : "0 2px 8px rgba(26,18,0,0.04)",
      }}
    >
      <p
        className="text-[11px] font-600 uppercase tracking-widest mb-1"
        style={{ color: dark ? "rgba(255,255,255,0.5)" : "#9C8870", letterSpacing: "0.05em" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-extrabold leading-none"
        style={{ color: dark ? "#fff" : accent }}
      >
        {value}
      </p>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-1.5">
          {sub && (
            <p className="text-[11px]" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#9C8870" }}>
              {sub}
            </p>
          )}
          {trend !== undefined && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: trendUp ? "#DCFCE7" : trendDn ? "#FEE2E2" : "#F3F4F6",
                color: trendUp ? "#16A34A" : trendDn ? "#DC2626" : "#6B7280",
              }}
            >
              {trendUp ? <TrendingUp size={9} /> : trendDn ? <TrendingDown size={9} /> : null}
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
