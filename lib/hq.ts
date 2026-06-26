import { SEED_SALES, type SaleRecord } from "./sales";
import { SELLERS } from "./sellers";
import { SKUS, getSKU } from "./skus";
// NOTE: In production, access control would be enforced at the data layer (row-level security),
// not at the prompt or component layer. HQ functions return full network data to authorised admins only.
import { calcPointsForSale } from "./points";
import { getTier } from "./sellers";

// ─────────────────────────────────────────────────────────────────────────────
// DEMAND BY AREA
// ─────────────────────────────────────────────────────────────────────────────
export type AreaDemand = {
  area: string;
  pincode: string;
  totalUnits: number;
  totalValue: number;
  topSku: string;
};

export const getAreaDemand = (): AreaDemand[] => {
  const byArea: Record<
    string,
    { pincode: string; units: number; value: number; skuUnits: Record<string, number> }
  > = {};

  for (const s of SEED_SALES) {
    if (!byArea[s.area]) {
      byArea[s.area] = { pincode: s.pincode, units: 0, value: 0, skuUnits: {} };
    }
    byArea[s.area].units += s.units;
    byArea[s.area].value += s.value;
    byArea[s.area].skuUnits[s.skuId] =
      (byArea[s.area].skuUnits[s.skuId] ?? 0) + s.units;
  }

  return Object.entries(byArea)
    .map(([area, data]) => {
      const topSkuId = Object.entries(data.skuUnits).sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        area,
        pincode: data.pincode,
        totalUnits: data.units,
        totalValue: data.value,
        topSku: getSKU(topSkuId)?.shortName ?? topSkuId,
      };
    })
    .sort((a, b) => b.totalUnits - a.totalUnits);
};

// ─────────────────────────────────────────────────────────────────────────────
// HOT SKUs BY AREA
// ─────────────────────────────────────────────────────────────────────────────
export type HotSku = {
  skuName: string;
  area: string;
  units: number;
};

export const getHotSkusByArea = (): HotSku[] => {
  const byAreaSku: Record<string, number> = {};
  for (const s of SEED_SALES) {
    const key = `${s.area}__${s.skuId}`;
    byAreaSku[key] = (byAreaSku[key] ?? 0) + s.units;
  }

  return Object.entries(byAreaSku)
    .map(([key, units]) => {
      const [area, skuId] = key.split("__");
      return { skuName: getSKU(skuId)?.shortName ?? skuId, area, units };
    })
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);
};

// ─────────────────────────────────────────────────────────────────────────────
// FRAUD FLAGS
// ─────────────────────────────────────────────────────────────────────────────
export type FraudFlag = {
  saleId: string;
  sellerName: string;
  skuName: string;
  units: number;
  value: number;
  channel: string;
  area: string;
  reason: string;
  timestamp: Date;
};

export const getFraudFlags = (): FraudFlag[] => {
  const flags: FraudFlag[] = [];

  for (const s of SEED_SALES) {
    if (!s.photoProof) {
      const seller = SELLERS.find((sel) => sel.id === s.sellerId);
      const sku = getSKU(s.skuId);
      flags.push({
        saleId: s.id,
        sellerName: seller?.name ?? s.sellerId,
        skuName: sku?.shortName ?? s.skuId,
        units: s.units,
        value: s.value,
        channel: s.channel,
        area: s.area,
        reason: "No photo proof submitted",
        timestamp: s.timestamp,
      });
    }
  }

  return flags.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// ─────────────────────────────────────────────────────────────────────────────
// PARTNER RANKING
// ─────────────────────────────────────────────────────────────────────────────
export type PartnerRank = {
  rank: number;
  sellerId: string;
  name: string;
  area: string;
  partnerType: string;
  points: number;
  tier: ReturnType<typeof getTier>;
  verifiedUnits: number;
  totalSales: number;
  fraudFlagCount: number;
  avatar: string;
};

export const getPartnerRanking = (): PartnerRank[] => {
  return SELLERS.map((seller) => {
    const sellerSales = SEED_SALES.filter((s) => s.sellerId === seller.id);
    const verifiedSales = sellerSales.filter((s) => s.photoProof);
    const points = sellerSales.reduce((sum, s) => sum + calcPointsForSale(s), 0) + seller.points;
    const fraudCount = sellerSales.filter((s) => !s.photoProof).length;

    return {
      sellerId: seller.id,
      name: seller.name,
      area: seller.area,
      partnerType: seller.partnerType,
      points,
      tier: getTier(points),
      verifiedUnits: verifiedSales.reduce((sum, s) => sum + s.units, 0),
      totalSales: sellerSales.length,
      fraudFlagCount: fraudCount,
      avatar: seller.avatar,
    };
  })
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ ...r, rank: i + 1 }));
};

// ─────────────────────────────────────────────────────────────────────────────
// SKU PERFORMANCE (Products tab)
// ─────────────────────────────────────────────────────────────────────────────
export type SkuPerformance = {
  skuId: string;
  skuName: string;
  line: string;
  size: string;
  price: number;
  totalUnits: number;
  totalValue: number;
  topArea: string;
  topChannel: string;
};

export const getSkuPerformance = (): SkuPerformance[] => {
  const map: Record<string, {
    units: number; value: number;
    areas: Record<string, number>; channels: Record<string, number>;
  }> = {};

  for (const s of SEED_SALES) {
    if (!map[s.skuId]) map[s.skuId] = { units: 0, value: 0, areas: {}, channels: {} };
    map[s.skuId].units += s.units;
    map[s.skuId].value += s.value;
    map[s.skuId].areas[s.area] = (map[s.skuId].areas[s.area] ?? 0) + s.units;
    map[s.skuId].channels[s.channel] = (map[s.skuId].channels[s.channel] ?? 0) + s.units;
  }

  return SKUS.map((sku) => {
    const d = map[sku.id] ?? { units: 0, value: 0, areas: {}, channels: {} };
    const topArea = Object.entries(d.areas).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const topChannel = Object.entries(d.channels).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return {
      skuId: sku.id,
      skuName: sku.shortName,
      line: sku.line,
      size: sku.size,
      price: sku.price,
      totalUnits: d.units,
      totalValue: d.value,
      topArea,
      topChannel,
    };
  }).sort((a, b) => b.totalUnits - a.totalUnits);
};

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY STATS (top of HQ page)
// ─────────────────────────────────────────────────────────────────────────────
export const getHQSummary = () => {
  const totalUnits = SEED_SALES.reduce((s, r) => s + r.units, 0);
  const totalValue = SEED_SALES.reduce((s, r) => s + r.value, 0);
  const verifiedSales = SEED_SALES.filter((s) => s.photoProof);
  const fraudFlags = SEED_SALES.filter((s) => !s.photoProof);
  const activePartners = SELLERS.length;

  const skuUnits: Record<string, number> = {};
  for (const s of SEED_SALES) {
    skuUnits[s.skuId] = (skuUnits[s.skuId] ?? 0) + s.units;
  }
  const topSkuId = Object.entries(skuUnits).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topSku = getSKU(topSkuId)?.shortName ?? "";

  return {
    totalUnits,
    totalValue,
    verifiedSalesCount: verifiedSales.length,
    fraudFlagCount: fraudFlags.length,
    activePartners,
    topSku,
  };
};
