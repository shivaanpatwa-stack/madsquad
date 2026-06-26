import { SEED_SALES, RIYA_STOCK, type SaleRecord } from "./sales";
import { SKUS, getSKU } from "./skus";

const TODAY = new Date("2026-06-27T10:00:00");

// Helpers
const daysSince = (d: Date) =>
  (TODAY.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

const getSellerSales = (sellerId: string): SaleRecord[] =>
  SEED_SALES.filter((s) => s.sellerId === sellerId);

const getRecentSales = (sales: SaleRecord[], days: number): SaleRecord[] =>
  sales.filter((s) => daysSince(s.timestamp) <= days);

// ─────────────────────────────────────────────────────────────────────────────
// RULE 1 — Best channel per SKU
// ─────────────────────────────────────────────────────────────────────────────
export const ruleBestChannel = (sellerId: string) => {
  const sales = getSellerSales(sellerId);
  const bySkuChannel: Record<string, Record<string, number>> = {};

  for (const s of sales) {
    if (!bySkuChannel[s.skuId]) bySkuChannel[s.skuId] = {};
    bySkuChannel[s.skuId][s.channel] =
      (bySkuChannel[s.skuId][s.channel] ?? 0) + s.units;
  }

  let bestInsight: {
    skuName: string;
    bestChannel: string;
    ratio: number;
    worstChannel: string;
  } | null = null;

  for (const [skuId, channels] of Object.entries(bySkuChannel)) {
    const entries = Object.entries(channels).sort((a, b) => b[1] - a[1]);
    if (entries.length < 2) continue;
    const [bestCh, bestVal] = entries[0];
    const [worstCh, worstVal] = entries[entries.length - 1];
    if (worstVal === 0) continue;
    const ratio = bestVal / worstVal;
    if (ratio > 2 && (!bestInsight || ratio > bestInsight.ratio)) {
      const sku = getSKU(skuId);
      if (sku)
        bestInsight = {
          skuName: sku.shortName,
          bestChannel: bestCh,
          ratio: Math.round(ratio),
          worstChannel: worstCh,
        };
    }
  }

  if (!bestInsight) return null;

  return {
    type: "best_channel" as const,
    priority: 2,
    title: `${bestInsight.skuName} sells ${bestInsight.ratio}x faster at ${bestInsight.bestChannel}`,
    body: `Your ${bestInsight.skuName} moves ${bestInsight.ratio}x faster at the ${bestInsight.bestChannel} than the ${bestInsight.worstChannel}. Shift more stock to ${bestInsight.bestChannel} this week.`,
    action: `Move stock to ${bestInsight.bestChannel}`,
    emoji: "📍",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// RULE 2 — Falling sales detector
// ─────────────────────────────────────────────────────────────────────────────
export const ruleFallingSales = (sellerId: string) => {
  const sales = getSellerSales(sellerId);
  const last7 = getRecentSales(sales, 7);
  const prior7 = sales.filter(
    (s) => daysSince(s.timestamp) > 7 && daysSince(s.timestamp) <= 14
  );

  const sumUnits = (arr: SaleRecord[]) => arr.reduce((t, s) => t + s.units, 0);
  const last7Units = sumUnits(last7);
  const prior7Units = sumUnits(prior7);

  if (prior7Units === 0) return null;
  const drop = ((prior7Units - last7Units) / prior7Units) * 100;
  if (drop < 10) return null;

  // Find the SKU+channel combo that dropped most
  const byComboLast: Record<string, number> = {};
  const byComboP: Record<string, number> = {};
  for (const s of last7) {
    const k = `${s.skuId}__${s.channel}`;
    byComboLast[k] = (byComboLast[k] ?? 0) + s.units;
  }
  for (const s of prior7) {
    const k = `${s.skuId}__${s.channel}`;
    byComboP[k] = (byComboP[k] ?? 0) + s.units;
  }

  let worstKey = "";
  let worstDrop = 0;
  for (const [k, pVal] of Object.entries(byComboP)) {
    const lVal = byComboLast[k] ?? 0;
    const d = pVal - lVal;
    if (d > worstDrop) { worstDrop = d; worstKey = k; }
  }

  let skuName = "a key SKU";
  let channel = "that channel";
  if (worstKey) {
    const [skuId, ch] = worstKey.split("__");
    skuName = getSKU(skuId)?.shortName ?? skuId;
    channel = ch;
  }

  return {
    type: "falling_sales" as const,
    priority: 1,
    title: `Sales down ~${Math.round(drop)}% this week`,
    body: `Your overall sales fell about ${Math.round(drop)}% this week. The main drop is ${skuName} at the ${channel}. Try a one-day sample drive there to rebuild momentum.`,
    action: `Run a sample drive — ${skuName} at ${channel}`,
    emoji: "📉",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// RULE 3 — Stockout predictor
// ─────────────────────────────────────────────────────────────────────────────
export const ruleStockout = (sellerId: string) => {
  if (sellerId !== "seller-01") return null; // only have stock data for Riya

  const sales = getSellerSales(sellerId);
  const last7 = getRecentSales(sales, 7);

  const dailyVelocity: Record<string, number> = {};
  for (const s of last7) {
    dailyVelocity[s.skuId] = (dailyVelocity[s.skuId] ?? 0) + s.units / 7;
  }

  let lowestDays = Infinity;
  let criticalSku = "";

  for (const [skuId, vel] of Object.entries(dailyVelocity)) {
    if (vel === 0) continue;
    const stock = RIYA_STOCK[skuId] ?? 0;
    const days = stock / vel;
    if (days < lowestDays) { lowestDays = days; criticalSku = skuId; }
  }

  if (!criticalSku || lowestDays > 4) return null;

  const sku = getSKU(criticalSku);
  const daysLabel = lowestDays < 1 ? "less than 1 day" : `about ${Math.round(lowestDays)} day${Math.round(lowestDays) !== 1 ? "s" : ""}`;

  return {
    type: "stockout" as const,
    priority: 0, // highest priority
    title: `${sku?.shortName ?? criticalSku} runs out in ${daysLabel}`,
    body: `At your current pace you'll run out of ${sku?.shortName} in ${daysLabel}. Reorder at least 3 boxes now to avoid losing sales.`,
    action: `Reorder ${sku?.shortName} now`,
    emoji: "⚠️",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// RULE 4 — Top mover
// ─────────────────────────────────────────────────────────────────────────────
export const ruleTopMover = (sellerId: string) => {
  const sales = getSellerSales(sellerId);
  const last14 = getRecentSales(sales, 14);

  const bySkuUnits: Record<string, number> = {};
  for (const s of last14) {
    bySkuUnits[s.skuId] = (bySkuUnits[s.skuId] ?? 0) + s.units;
  }

  const sorted = Object.entries(bySkuUnits).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return null;

  const [topSkuId, topUnits] = sorted[0];
  const sku = getSKU(topSkuId);
  if (!sku) return null;

  return {
    type: "top_mover" as const,
    priority: 3,
    title: `${sku.shortName} is your top mover`,
    body: `${sku.shortName} moved ${topUnits} units in the last 14 days — your fastest seller. Ask for a bigger allocation on your next restock cycle.`,
    action: `Request bigger ${sku.shortName} allocation`,
    emoji: "🚀",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// RULE 5 — Repeat customer rate
// ─────────────────────────────────────────────────────────────────────────────
export const ruleRepeatCustomers = (sellerId: string) => {
  const sales = getSellerSales(sellerId);
  if (!sales.length) return null;

  const repeatCount = sales.filter((s) => s.repeatCustomer).length;
  const pct = Math.round((repeatCount / sales.length) * 100);

  return {
    type: "repeat_customers" as const,
    priority: 4,
    title: `${pct}% of your buyers are repeat customers`,
    body: `${pct}% of your sales this month came from repeat buyers. Push the Mad Variety Pack and Nardana Raisins to them — they're proven loyalists who'll spend more per visit.`,
    action: "Upsell Mad Variety Pack to repeat buyers",
    emoji: "💛",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// RULE 6 — Demographic insight
// ─────────────────────────────────────────────────────────────────────────────
export const ruleDemographics = (sellerId: string) => {
  const sales = getSellerSales(sellerId);
  if (!sales.length) return null;

  const byChannelAge: Record<string, Record<string, number>> = {};
  for (const s of sales) {
    if (!byChannelAge[s.channel]) byChannelAge[s.channel] = {};
    byChannelAge[s.channel][s.ageBand] =
      (byChannelAge[s.channel][s.ageBand] ?? 0) + s.units;
  }

  let bestChannel = "";
  let bestAge = "";
  let bestCount = 0;

  for (const [channel, ageMap] of Object.entries(byChannelAge)) {
    for (const [age, count] of Object.entries(ageMap)) {
      if (count > bestCount) {
        bestCount = count;
        bestChannel = channel;
        bestAge = age;
      }
    }
  }

  if (!bestChannel) return null;

  // Find the spiciest puff for that demo
  const spicyRec = bestAge === "18-25" ? "Flamin' Fun and Mighty Masala" : "Chaat Corner and Pizza Party";

  return {
    type: "demographics" as const,
    priority: 5,
    title: `Your ${bestChannel} buyers are mostly ${bestAge}`,
    body: `Most of your ${bestChannel} sales come from the ${bestAge} age group — they prefer bold flavours. Stock more ${spicyRec} there for faster turns.`,
    action: `Stock ${spicyRec} at ${bestChannel}`,
    emoji: "🎯",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PRESET Q HARDCODED FALLBACK — always safe for the demo
// ─────────────────────────────────────────────────────────────────────────────
export const HARDCODED_ANSWERS: Record<string, string> = {
  why_falling:
    "Your sales fell about 18% this week. The main drop is Chaat Corner Puffs at the Bandra school — footfall dips during exam prep. Two moves: shift 60% of that Chaat Corner stock to your Bandra gym where your spicy packs sell fastest, and run a one-day free-sample drive at the school next week. Gym sales are still strong, so don't pull stock from there.",
  what_restock:
    "Reorder Millet Bhel first — you'll run out in about 2 days at your current pace. After that, top up Flamin' Fun Mini and Mighty Masala Mini for the gym. Those two are your fastest movers and you don't want a stockout during peak gym hours (6–9 AM and 5–8 PM).",
  where_next:
    "Your gym channel is your strongest — 18–25 buyers, high repeat rate, spicy SKUs fly. Try expanding to one more gym in Andheri or BKC where MadMix already has traction from other partners. Avoid adding more café or school slots until the Chaat Corner dip recovers.",
  best_product:
    "Flamin' Fun Puffs (Mini) is your #1 by units. Mighty Masala Jowar Puffs is #2. Both are gym best-sellers with 18–25 buyers who keep coming back. Prioritise these two on every restock order.",
};

// ─────────────────────────────────────────────────────────────────────────────
// MASTER COACH — run all rules, return top 3 + today's move
// ─────────────────────────────────────────────────────────────────────────────
export type CoachTip = {
  type: string;
  priority: number;
  title: string;
  body: string;
  action: string;
  emoji: string;
};

export const runCoach = (sellerId: string): { tips: CoachTip[]; todayMove: CoachTip } => {
  const rawRules = [
    ruleStockout(sellerId),
    ruleFallingSales(sellerId),
    ruleBestChannel(sellerId),
    ruleTopMover(sellerId),
    ruleRepeatCustomers(sellerId),
    ruleDemographics(sellerId),
  ];

  const rules: CoachTip[] = rawRules.filter((r): r is NonNullable<typeof r> => r !== null).map((r) => r as CoachTip);

  // Sort by priority (0 = most urgent)
  rules.sort((a: CoachTip, b: CoachTip) => a.priority - b.priority);

  const top3 = rules.slice(0, 3);
  const todayMove = rules[0] ?? {
    type: "fallback",
    priority: 99,
    title: "Keep logging sales for better tips",
    body: "The more you log, the smarter your coach gets. Add photo proof and age info for bonus points.",
    action: "Log a sale",
    emoji: "📊",
  };

  return { tips: top3, todayMove };
};
