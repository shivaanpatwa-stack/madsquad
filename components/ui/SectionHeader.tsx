import type { ReactNode } from "react";

export default function SectionHeader({
  label,
  action,
  className = "",
}: {
  label: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <p
        className="text-[11px] font-bold uppercase tracking-[0.06em]"
        style={{ color: "#6B5B45" }}
      >
        {label}
      </p>
      {action && (
        <span className="text-xs font-semibold" style={{ color: "#FF6900" }}>
          {action}
        </span>
      )}
    </div>
  );
}
