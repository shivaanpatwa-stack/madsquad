"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { getSellerTerritory, getAreaSaturation } from "@/lib/territory";
import { MapPin, TrendingUp, Users, Zap } from "lucide-react";

type DemoSeller = "riya" | "arjun";

const STATUS_CONFIG = {
  "white-space": { label: "White Space 🟡", bg: "#FFF3E6", color: "#FF6900", desc: "Room to grow — demand exceeds seller coverage." },
  healthy:       { label: "Healthy 🟢",     bg: "#dcfce7", color: "#15803d", desc: "Well-covered zone. Keep the momentum." },
  saturated:     { label: "Saturated 🔴",   bg: "#fee2e2", color: "#D62828", desc: "Adding more sellers here creates competition without new demand." },
};

export default function TerritoryPage() {
  const [demoSeller, setDemoSeller] = useState<DemoSeller>("riya");

  const sellerId = demoSeller === "riya" ? "seller-01" : "seller-09";
  const sellerName = demoSeller === "riya" ? "Riya" : "Arjun";

  const territory = useMemo(() => getSellerTerritory(sellerId), [sellerId]);
  const allAreas = useMemo(() => getAreaSaturation(), []);

  if (!territory) return null;
  const { saturation, whiteSpaceNearby } = territory;
  const statusCfg = STATUS_CONFIG[saturation.status];

  const maxDemand = Math.max(...allAreas.map((a) => a.demand), 1);

  return (
    <div className="min-h-screen md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-5" style={{ background: "#1A1200" }}>
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={16} style={{ color: "#FF6900" }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#FF6900" }}>My Territory</p>
        </div>
        <h1 className="text-xl font-extrabold text-white">{sellerName}'s Zone</h1>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          Territory intelligence · No-cannibalisation zones
        </p>
      </div>

      {/* Demo toggle */}
      <div className="flex bg-white" style={{ borderBottom: "1px solid #F0E6D8" }}>
        {(["riya", "arjun"] as DemoSeller[]).map((s) => (
          <button
            key={s}
            onClick={() => setDemoSeller(s)}
            className="flex-1 py-3 text-sm font-semibold capitalize transition-colors"
            style={{
              color: demoSeller === s ? "#FF6900" : "#9C8870",
              borderBottom: demoSeller === s ? "2px solid #FF6900" : "2px solid transparent",
            }}
          >
            {s === "riya" ? "Riya (Bandra)" : "Arjun (Andheri) — New"}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #F0E6D8" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: statusCfg.bg }}>
            <div>
              <p className="text-xs font-bold" style={{ color: statusCfg.color }}>{statusCfg.label}</p>
              <p className="font-extrabold text-lg" style={{ color: "#1A1200" }}>{saturation.area}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black" style={{ color: statusCfg.color }}>{saturation.saturationScore}</p>
              <p className="text-[10px]" style={{ color: "#9C8870" }}>/ 100 saturation</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs leading-relaxed" style={{ color: "#6B5B45" }}>{statusCfg.desc}</p>
          </div>
        </div>

        {/* Zone stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Demand (units)", value: saturation.demand, icon: TrendingUp, color: "#FF6900" },
            { label: "Sellers here",   value: saturation.sellerCount, icon: Users, color: "#7C3AED" },
            { label: "Top Channel",    value: saturation.topChannel,  icon: Zap,   color: "#FFB800" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
              <Icon size={14} style={{ color }} />
              <p className="text-sm font-black mt-1" style={{ color: "#1A1200" }}>{value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#9C8870" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Top SKU */}
        <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#6B5B45" }}>Top SKU in zone</p>
          <p className="text-base font-bold" style={{ color: "#1A1200" }}>{saturation.topSku || "No data yet"}</p>
          {saturation.demand === 0 && (
            <p className="text-xs mt-1" style={{ color: "#9C8870" }}>
              No sales recorded yet — your mission data will populate this.
            </p>
          )}
        </div>

        {/* Demand bar vs network */}
        <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#6B5B45" }}>
            Your zone vs Mumbai average
          </p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] mb-1" style={{ color: "#9C8870" }}>
                <span>{saturation.area}</span>
                <span>{saturation.demand} units</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((saturation.demand / maxDemand) * 100)}%`,
                    background: "linear-gradient(90deg, #FF6900, #FFB800)",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1" style={{ color: "#9C8870" }}>
                <span>Network avg</span>
                <span>{Math.round(allAreas.reduce((s, a) => s + a.demand, 0) / allAreas.length)} units</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((allAreas.reduce((s, a) => s + a.demand, 0) / allAreas.length / maxDemand) * 100)}%`,
                    background: "#F0E6D8",
                    outline: "1.5px solid #9C8870",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* White space nearby / First Win CTA */}
        {demoSeller === "arjun" ? (
          <div className="rounded-2xl p-4" style={{ background: "#FFF3E6", border: "2px solid #FF6900" }}>
            <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: "#FF6900" }}>
              🎯 Opportunity Detected
            </p>
            <p className="text-sm font-bold" style={{ color: "#1A1200" }}>
              Gym channel in Andheri West — ZERO active sellers
            </p>
            <p className="text-xs mt-1 mb-3" style={{ color: "#6B5B45" }}>
              Sellers 2km away in Bandra move 18+ Flamin' Fun Puffs per morning at gyms. That demand is unserved here.
            </p>
            <Link
              href="/onboarding"
              className="block w-full py-3 rounded-xl font-bold text-white text-sm text-center active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
            >
              Get First Win Mission →
            </Link>
          </div>
        ) : whiteSpaceNearby.length > 0 ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#6B5B45" }}>
              White Space Nearby
            </p>
            <div className="space-y-2">
              {whiteSpaceNearby.map((area) => (
                <div key={area} className="flex items-center gap-2 py-1.5 px-3 rounded-xl" style={{ background: "#FFF3E6" }}>
                  <span className="text-xs font-bold" style={{ color: "#FF6900" }}>🟡</span>
                  <p className="text-sm font-medium" style={{ color: "#1A1200" }}>{area}</p>
                  <span className="text-[10px] ml-auto" style={{ color: "#9C8870" }}>Room to grow</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: "#9C8870" }}>
              HQ can recruit new partners in these zones. Zero risk to your turf.
            </p>
          </div>
        ) : null}

        {/* Why this matters */}
        <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#6B5B45" }}>💡 Why territory intelligence matters</p>
          <p className="text-xs leading-relaxed" style={{ color: "#9C8870" }}>
            Saturation + recruitment focus is the #1 reason MLMs collapse. MadSquad tracks demand per zone
            so every new partner gets their own uncrowded territory. You keep your customers.
          </p>
        </div>
      </div>
    </div>
  );
}
