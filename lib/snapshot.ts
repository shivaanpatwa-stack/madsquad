// lib/snapshot.ts
// Single source of truth for all analytics. Computed once from seeded data.
// All AI calls receive this object and narrate it — they NEVER re-derive numbers.

import { SEED_SALES, RIYA_STOCK } from "./sales";
import { SELLERS, getTier } from "./sellers";
import { getSKU } from "./skus";
import { calcPointsForSale } from "./points";

const TODAY = new Date("2026-06-27T10:00:00");
const daysSince = (d: Date) =>
  (TODAY.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

export type AppSnapshot = {
  computedAt: Date;
  kpis: {
    totalUnits: number;
    totalValue: number;
    activePartners: number;
    fraudFlagCount: number;
    repeatRate: number;
    healthScore: number; // deterministic formula — never AI-computed
  };
  topSkus: Array<{ skuId: string; skuName: string; units: number; topArea: string }>;
  demandByArea: Array<{
    area: string;
    pincode: string;
    units: number;
    totalValue: number;
    topSku: string;
  }>;
  partnerRanking: Array<{
    name: string;
    area: string;
    points: number;
    tier: string;
    fraudFlags: number;
    verifiedUnits: number;
  }>;
  adEfficiency: {
    bigbasketA2S: number; // 20 — sourced from real April 2026 MadMix platform data
    instamartA2S: number; // 50 — sourced from real April 2026 MadMix platform data
    madSquadA2S: number;  // 0  — structural, no ad spend model
  };
  fraudFlags: Array<{
    saleId: string;
    sellerName: string;
    skuName: string;
    channel: string;
    area: string;
    value: number;
    reason: string;
  }>;
  riyaContext: {
    name: string;
    area: string;
    topSku: string;
    fastestChannel: string;
    trendPct: number;
    bhelStockDays: number;
    repeatRate: number;
  };
};

export const computeSnapshot = (): AppSnapshot => {
  const allSales = SEED_SALES;

  // ── Basic KPIs ─────────────────────────────────────────────────────────────
  const totalUnits = allSales.reduce((s, r) => s + r.units, 0);
  const totalValue = allSales.reduce((s, r) => s + r.value, 0);
  const fraudFlagCount = allSales.filter((s) => !s.photoProof).length;
  const repeatCount = allSales.filter((s) => s.repeatCustomer).length;
  const repeatRate = Math.round((repeatCount / allSales.length) * 100);

  const activePartners = SELLERS.filter((seller) =>
    allSales.some((s) => s.sellerId === seller.id && daysSince(s.timestamp) <= 14)
  ).length;

  // ── Health Score — deterministic formula, NEVER computed by AI ─────────────
  // (35% × revenue attainment) + (25% × active partner %) +
  // (20% × repeat rate)       + (20% × stock availability)
  const REVENUE_TARGET = 15000;
  const revenueAttainment = Math.min(1, totalValue / REVENUE_TARGET);
  const activePct = activePartners / SELLERS.length;
  const stockAvailability = 12 / 14; // 12 of 14 SKUs above critical threshold
  const healthScore = Math.round(
    0.35 * revenueAttainment * 100 +
    0.25 * activePct * 100 +
    0.20 * (repeatRate / 100) * 100 +
    0.20 * stockAvailability * 100
  );

  // ── Top SKUs ───────────────────────────────────────────────────────────────
  const skuMap: Record<string, { units: number; areas: Record<string, number> }> = {};
  for (const s of allSales) {
    if (!skuMap[s.skuId]) skuMap[s.skuId] = { units: 0, areas: {} };
    skuMap[s.skuId].units += s.units;
    skuMap[s.skuId].areas[s.area] = (skuMap[s.skuId].areas[s.area] ?? 0) + s.units;
  }
  const topSkus = Object.entries(skuMap)
    .sort((a, b) => b[1].units - a[1].units)
    .slice(0, 5)
    .map(([skuId, data]) => ({
      skuId,
      skuName: getSKU(skuId)?.shortName ?? skuId,
      units: data.units,
      topArea: Object.entries(data.areas).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "",
    }));

  // ── Demand by area ─────────────────────────────────────────────────────────
  const areaMap: Record<string, { pincode: string; units: number; value: number; skuUnits: Record<string, number> }> = {};
  for (const s of allSales) {
    if (!areaMap[s.area]) areaMap[s.area] = { pincode: s.pincode, units: 0, value: 0, skuUnits: {} };
    areaMap[s.area].units += s.units;
    areaMap[s.area].value += s.value;
    areaMap[s.area].skuUnits[s.skuId] = (areaMap[s.area].skuUnits[s.skuId] ?? 0) + s.units;
  }
  const demandByArea = Object.entries(areaMap)
    .map(([area, data]) => {
      const topSkuId = Object.entries(data.skuUnits).sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        area,
        pincode: data.pincode,
        units: data.units,
        totalValue: data.value,
        topSku: getSKU(topSkuId)?.shortName ?? "",
      };
    })
    .sort((a, b) => b.units - a.units);

  // ── Partner ranking ────────────────────────────────────────────────────────
  const partnerRanking = SELLERS.map((seller) => {
    const ss = allSales.filter((s) => s.sellerId === seller.id);
    const pts = ss.reduce((sum, s) => sum + calcPointsForSale(s), 0) + seller.points;
    return {
      name: seller.name,
      area: seller.area,
      points: pts,
      tier: getTier(pts),
      fraudFlags: ss.filter((s) => !s.photoProof).length,
      verifiedUnits: ss.filter((s) => s.photoProof).reduce((sum, s) => sum + s.units, 0),
    };
  }).sort((a, b) => b.points - a.points);

  // ── Fraud flags ────────────────────────────────────────────────────────────
  const fraudFlags = allSales
    .filter((s) => !s.photoProof)
    .map((s) => ({
      saleId: s.id,
      sellerName: SELLERS.find((sel) => sel.id === s.sellerId)?.name ?? s.sellerId,
      skuName: getSKU(s.skuId)?.shortName ?? s.skuId,
      channel: s.channel,
      area: s.area,
      value: s.value,
      reason: "No photo proof submitted",
    }));

  // ── Riya context (used by Coach AI prompt) ─────────────────────────────────
  const riyaSales = allSales.filter((s) => s.sellerId === "seller-01");
  const riyaLast7 = riyaSales.filter((s) => daysSince(s.timestamp) <= 7);
  const riyaPrior7 = riyaSales.filter((s) => daysSince(s.timestamp) > 7 && daysSince(s.timestamp) <= 14);

  const riyaSkuUnits: Record<string, number> = {};
  const riyaChannelUnits: Record<string, number> = {};
  for (const s of riyaSales) {
    riyaSkuUnits[s.skuId] = (riyaSkuUnits[s.skuId] ?? 0) + s.units;
    riyaChannelUnits[s.channel] = (riyaChannelUnits[s.channel] ?? 0) + s.units;
  }

  const riyaTopSkuId = Object.entries(riyaSkuUnits).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "sku-01";
  const fastestChannel = Object.entries(riyaChannelUnits).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Gym";
  const last7Units = riyaLast7.reduce((s, r) => s + r.units, 0);
  const prior7Units = riyaPrior7.reduce((s, r) => s + r.units, 0);
  const trendPct = prior7Units > 0 ? Math.round(((last7Units - prior7Units) / prior7Units) * 100) : 0;

  const bhelVelocityPerDay = riyaLast7.filter((s) => s.skuId === "sku-11").reduce((s, r) => s + r.units, 0) / 7;
  const bhelStockDays = bhelVelocityPerDay > 0 ? Math.round(RIYA_STOCK["sku-11"] / bhelVelocityPerDay) : 99;

  const riyaRepeatRate = Math.round(
    (riyaSales.filter((s) => s.repeatCustomer).length / riyaSales.length) * 100
  );

  return {
    computedAt: TODAY,
    kpis: { totalUnits, totalValue, activePartners, fraudFlagCount, repeatRate, healthScore },
    topSkus,
    demandByArea,
    partnerRanking,
    adEfficiency: { bigbasketA2S: 20, instamartA2S: 50, madSquadA2S: 0 },
    fraudFlags,
    riyaContext: {
      name: "Riya Sharma",
      area: "Bandra",
      topSku: getSKU(riyaTopSkuId)?.shortName ?? "Flamin' Fun Mini",
      fastestChannel,
      trendPct,
      bhelStockDays,
      repeatRate: riyaRepeatRate,
    },
  };
};

export const SNAPSHOT = computeSnapshot();
