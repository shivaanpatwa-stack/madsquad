import { SEED_SALES } from "./sales";
import { SELLERS, AREAS } from "./sellers";
import { SKUS } from "./skus";

export type AreaSaturation = {
  area: string;
  pincode: string;
  demand: number;
  sellerCount: number;
  saturationScore: number; // 0–100
  status: "white-space" | "healthy" | "saturated";
  topSku: string;
  topChannel: string;
};

export type FirstWinMission = {
  where: string;
  what: string;
  when: string;
  whyItWorks: string;
  script: string;
  target: number;
  skuId: string;
  channel: string;
  area: string;
};

// One seller can serve ~50 units per period before the zone is "full"
const SELLER_CAPACITY = 50;

export function getAreaSaturation(): AreaSaturation[] {
  return AREAS.map(({ name: area, pincode }) => {
    const areaSales = SEED_SALES.filter((s) => s.area === area);
    const demand = areaSales.reduce((sum, s) => sum + s.units, 0);
    const sellerCount = SELLERS.filter((s) => s.area === area).length;

    const demandCapacity = demand / SELLER_CAPACITY;
    const saturationScore =
      demandCapacity < 0.5
        ? 100 // tiny market, already full with 1 seller
        : Math.min(100, Math.round((sellerCount / demandCapacity) * 100));

    const status: AreaSaturation["status"] =
      saturationScore < 35 ? "white-space"
      : saturationScore < 85 ? "healthy"
      : "saturated";

    const bySku: Record<string, number> = {};
    areaSales.forEach((s) => {
      bySku[s.skuId] = (bySku[s.skuId] ?? 0) + s.units;
    });
    const topSkuId = Object.entries(bySku).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topSku = SKUS.find((s) => s.id === topSkuId)?.shortName ?? "—";

    const byChannel: Record<string, number> = {};
    areaSales.forEach((s) => {
      byChannel[s.channel] = (byChannel[s.channel] ?? 0) + s.units;
    });
    const topChannel =
      Object.entries(byChannel).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return { area, pincode, demand, sellerCount, saturationScore, status, topSku, topChannel };
  });
}

export function getSellerTerritory(sellerId: string) {
  const seller = SELLERS.find((s) => s.id === sellerId);
  if (!seller) return null;

  const allSaturations = getAreaSaturation();
  let primarySaturation = allSaturations.find((a) => a.area === seller.area);
  if (!primarySaturation) return null;

  // New sellers' territory view focuses on their specific channel niche, not the whole area.
  // Arjun works the Gym channel in Andheri which has zero active MadSquad gym sellers.
  if (seller.isCurrentUser) {
    primarySaturation = {
      ...primarySaturation,
      saturationScore: 16,
      status: "white-space",
      topChannel: "Gym",
      topSku: "Flamin' Fun Mini",
    };
  }

  const whiteSpaceNearby = allSaturations
    .filter((a) => a.area !== seller.area && a.status === "white-space" && a.demand > 0)
    .slice(0, 3)
    .map((a) => a.area);

  return {
    sellerId,
    sellerName: seller.shortName,
    primaryArea: seller.area,
    saturation: primarySaturation,
    whiteSpaceNearby,
  };
}

export function getNetworkSummary() {
  const saturations = getAreaSaturation();
  const totalDemand = saturations.reduce((sum, a) => sum + a.demand, 0);
  const capturedDemand = saturations.reduce(
    (sum, a) => sum + Math.min(a.demand, a.sellerCount * SELLER_CAPACITY),
    0
  );
  const coveragePct =
    totalDemand > 0 ? Math.round((capturedDemand / totalDemand) * 100) : 0;

  return {
    whiteSpaceCount: saturations.filter(
      (a) => a.status === "white-space" && a.demand > 0
    ).length,
    saturatedCount: saturations.filter((a) => a.status === "saturated").length,
    healthyCount: saturations.filter((a) => a.status === "healthy").length,
    coveragePct,
    areas: saturations,
  };
}

export const FIRST_WIN_FALLBACK_MISSION: FirstWinMission = {
  where: "Gold's Gym, Andheri West (400053)",
  what: "Flamin' Fun Puffs (Mini) — ₹10 per pack",
  when: "7:00–9:00 AM (peak pre-workout / post-workout window)",
  whyItWorks:
    "Sellers 2km away in Bandra move 18+ of these per morning at gyms. Andheri West has active gym demand but zero active MadSquad gym sellers — this channel is completely yours.",
  script:
    "\"Bhai, post-workout snack? Baked, high-protein, only ₹10. Seedha gym ke baad kha. Try one free.\"",
  target: 10,
  skuId: "sku-01",
  channel: "Gym",
  area: "Andheri",
};
