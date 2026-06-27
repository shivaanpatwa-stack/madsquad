"use client";
import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getSellerTerritory, getAreaSaturation } from "@/lib/territory";
import type { MapAreaData } from "@/components/map/MumbaiMap";
import { MapPin, TrendingUp, Users, Zap, Shield, Map } from "lucide-react";

type DemoSeller = "riya" | "arjun";

const DynamicMap = dynamic(() => import("@/components/map/TerritoryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl" style={{ height: 340, background: "#F0E6D8" }}>
      <div className="text-center">
        <Map size={28} style={{ color: "#9C8870", margin: "0 auto 8px" }} />
        <p className="text-sm font-medium" style={{ color: "#9C8870" }}>Loading map…</p>
      </div>
    </div>
  ),
});

const STATUS_CONFIG = {
  "white-space": {
    label: "White Space",
    emoji: "🟡",
    gradient: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)",
    desc: "Room to grow — demand here exceeds how many sellers are covering it.",
  },
  healthy: {
    label: "Healthy Zone",
    emoji: "🟢",
    gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
    desc: "Well-covered zone. Keep the momentum going.",
  },
  saturated: {
    label: "Saturated",
    emoji: "🔴",
    gradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
    desc: "High seller density here. Nearby zones have more room to grow.",
  },
};

export default function TerritoryPage() {
  const [demoSeller, setDemoSeller] = useState<DemoSeller>("arjun");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { setMapReady(true); }, []);

  const sellerId = demoSeller === "riya" ? "seller-01" : "seller-09";
  const sellerName = demoSeller === "riya" ? "Riya" : "Arjun";

  const territory = useMemo(() => getSellerTerritory(sellerId), [sellerId]);
  const allAreas = useMemo(() => getAreaSaturation(), []);

  if (!territory) return null;
  const { saturation, whiteSpaceNearby } = territory;
  const cfg = STATUS_CONFIG[saturation.status];

  // Build map data for all areas
  const mapAreas: MapAreaData[] = allAreas.map((a) => ({
    area: a.area,
    value: a.demand,
    label: `${a.sellerCount} seller${a.sellerCount !== 1 ? "s" : ""} · ${a.topChannel}`,
    status: a.status,
    topSku: a.topSku,
    sellerCount: a.sellerCount,
  }));
  const maxDemand = Math.max(...allAreas.map((a) => a.demand));

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* Header */}
      <div style={{ background: "#1A1200", padding: "48px 20px 24px" }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} style={{ color: "#FF6900" }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF6900" }}>Territory</p>
            </div>
            <h1 className="text-white font-black" style={{ fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {sellerName}&apos;s Zone
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Protected patch · no-cannibalisation guarantee
            </p>
          </div>
          <div className="flex gap-1.5 mt-1">
            {(["arjun", "riya"] as DemoSeller[]).map((s) => (
              <button key={s} onClick={() => setDemoSeller(s)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                style={{ background: demoSeller === s ? "#FF6900" : "rgba(255,255,255,0.08)", color: demoSeller === s ? "white" : "rgba(255,255,255,0.4)" }}>
                {s === "arjun" ? "Arjun" : "Riya"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Zone status card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: cfg.gradient }}>
          <div style={{ padding: "24px 24px 20px" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                {cfg.emoji} {cfg.label}
              </span>
              <div className="text-right">
                <p className="font-black text-white" style={{ fontSize: 32, lineHeight: 1 }}>{saturation.saturationScore}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>/ 100 score</p>
              </div>
            </div>
            <h2 className="text-white font-black" style={{ fontSize: 24, letterSpacing: "-0.01em", marginBottom: 8 }}>
              {saturation.area}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.5 }}>{cfg.desc}</p>
          </div>
          <div style={{ background: "rgba(0,0,0,0.15)", padding: "16px 24px" }}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { Icon: TrendingUp, label: "Demand",      value: `${saturation.demand}` },
                { Icon: Users,      label: "Sellers",     value: `${saturation.sellerCount}` },
                { Icon: Zap,        label: "Top Channel", value: saturation.topChannel },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon size={14} style={{ color: "rgba(255,255,255,0.5)" }} className="mx-auto mb-1" />
                  <p className="text-white font-black text-base">{value}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LEAFLET MAP */}
        {mapReady && (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #F0E6D8" }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#1A1200" }}>
              <Map size={13} style={{ color: "#FF6900" }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF6900" }}>Mumbai Network Map</p>
              <p className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.3)" }}>Tap a circle for details</p>
            </div>
            <DynamicMap
              areas={mapAreas}
              maxValue={maxDemand}
              highlightArea={saturation.area}
              sellerId={sellerId}
            />
            <div className="flex gap-4 px-4 py-3" style={{ background: "#F8F4F0" }}>
              {[
                { color: "#FFB800", label: "White Space" },
                { color: "#22c55e", label: "Healthy" },
                { color: "#D62828", label: "Saturated" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#6B5B45" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunity card */}
        {demoSeller === "arjun" ? (
          <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid #F0E6D8" }}>
            <div style={{ background: "#FFF3E6", padding: "16px 20px 12px" }}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "#FF6900" }}>
                🎯 Opportunity Detected
              </p>
              <p className="font-black text-lg leading-tight" style={{ color: "#1A1200" }}>
                Gym channel in Andheri West — zero active sellers
              </p>
            </div>
            <div style={{ padding: "16px 20px 20px" }}>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B5B45" }}>
                Sellers 2km away in Bandra move 18+ Flamin&apos; Fun Puffs per morning at gyms. That demand is completely unserved in Andheri — you&apos;re first in.
              </p>
              <Link href="/mentor"
                className="block w-full py-3.5 rounded-xl font-bold text-white text-sm text-center active:scale-95 transition-transform"
                style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}>
                Get your First Win plan →
              </Link>
            </div>
          </div>
        ) : whiteSpaceNearby.length > 0 ? (
          <div className="rounded-2xl" style={{ background: "white", border: "1px solid #F0E6D8" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #F0E6D8" }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#6B5B45" }}>Nearby White Space</p>
            </div>
            <div style={{ padding: "12px 20px 20px" }}>
              {whiteSpaceNearby.map((area) => (
                <div key={area} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid #F0E6D8" }}>
                  <span className="text-base">🟡</span>
                  <p className="text-sm font-semibold flex-1" style={{ color: "#1A1200" }}>{area}</p>
                  <p className="text-xs" style={{ color: "#9C8870" }}>Room to grow</p>
                </div>
              ))}
              <p className="text-xs mt-3" style={{ color: "#9C8870" }}>
                HQ recruits for these zones separately — your turf stays protected.
              </p>
            </div>
          </div>
        ) : null}

        {/* Protection */}
        <div className="rounded-2xl flex items-start gap-3"
          style={{ background: "#FFF3E6", border: "1.5px solid #FFB800", padding: "16px 20px" }}>
          <Shield size={18} style={{ color: "#FF6900", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-bold text-sm" style={{ color: "#1A1200" }}>Your zone is locked for you</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B5B45" }}>
              MadSquad maps demand before placing sellers. No one else gets placed in {saturation.area} while you&apos;re active here.
            </p>
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
