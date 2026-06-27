import type { Channel, AgeBand } from "./sellers";

export type SaleRecord = {
  id: string;
  sellerId: string;
  skuId: string;
  units: number;
  channel: Channel;
  area: string;
  pincode: string;
  ageBand: AgeBand;
  repeatCustomer: boolean;
  photoProof: boolean;
  timestamp: Date; // relative to "today" = June 27 2026
  value: number; // units * price
};

// "Today" for the demo = June 27 2026
const TODAY = new Date("2026-06-27T10:00:00");

const daysAgo = (d: number, hour = 10): Date => {
  const dt = new Date(TODAY);
  dt.setDate(dt.getDate() - d);
  dt.setHours(hour);
  return dt;
};

// ---------- RIYA'S SALES (seller-01) ----------
// Story beats:
//   1. Spicy puffs (sku-01 Flamin Fun, sku-07 Mighty Masala) sell 3x faster at Gym vs Café
//   2. Sales dipped in last 7 days vs prior 7 — mainly Chaat Corner (sku-03) at School
//   3. Millet Bhel (sku-11) running low — ~2 days left based on velocity
//   4. Two sales with photoProof=false for fraud flags in HQ
//   5. 62% repeat customers

const RIYA_SALES: Omit<SaleRecord, "id">[] = [
  // --- PRIOR WEEK (days 8-14 ago) — strong performance ---
  { sellerId:"seller-01", skuId:"sku-01", units:18, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(14,9),  value:180 },
  { sellerId:"seller-01", skuId:"sku-07", units:15, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(13,11), value:150 },
  { sellerId:"seller-01", skuId:"sku-03", units:22, channel:"School", area:"Bandra", pincode:"400050", ageBand:"Under 18", repeatCustomer:false, photoProof:true, timestamp:daysAgo(13,14), value:220 },
  { sellerId:"seller-01", skuId:"sku-11", units:8,  channel:"Café",   area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(12,10), value:160 },
  { sellerId:"seller-01", skuId:"sku-01", units:20, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(12,16), value:200 },
  { sellerId:"seller-01", skuId:"sku-05", units:12, channel:"Café",   area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:false, photoProof:true,  timestamp:daysAgo(11,9),  value:120 },
  { sellerId:"seller-01", skuId:"sku-03", units:20, channel:"School", area:"Bandra", pincode:"400050", ageBand:"Under 18", repeatCustomer:true, photoProof:true, timestamp:daysAgo(11,13), value:200 },
  { sellerId:"seller-01", skuId:"sku-07", units:17, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(10,10), value:170 },
  { sellerId:"seller-01", skuId:"sku-11", units:7,  channel:"Café",   area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(10,15), value:140 },
  { sellerId:"seller-01", skuId:"sku-14", units:6,  channel:"Corporate Office", area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:true, photoProof:true, timestamp:daysAgo(9,11), value:120 },
  { sellerId:"seller-01", skuId:"sku-01", units:16, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(9,14),  value:160 },
  { sellerId:"seller-01", skuId:"sku-03", units:18, channel:"School", area:"Bandra", pincode:"400050", ageBand:"Under 18", repeatCustomer:false, photoProof:true, timestamp:daysAgo(8,12), value:180 },

  // --- LAST 7 DAYS — dip in Chaat Corner at School, gym still strong ---
  { sellerId:"seller-01", skuId:"sku-01", units:19, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(7,9),  value:190 },
  { sellerId:"seller-01", skuId:"sku-03", units:9,  channel:"School", area:"Bandra", pincode:"400050", ageBand:"Under 18", repeatCustomer:false, photoProof:true, timestamp:daysAgo(7,14), value:90 }, // DIP
  { sellerId:"seller-01", skuId:"sku-07", units:14, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(6,10), value:140 },
  { sellerId:"seller-01", skuId:"sku-11", units:4,  channel:"Café",   area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(6,13), value:80 },  // getting low
  { sellerId:"seller-01", skuId:"sku-05", units:8,  channel:"Café",   area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:true,  photoProof:false, timestamp:daysAgo(5,11), value:80 },  // NO PHOTO — fraud flag
  { sellerId:"seller-01", skuId:"sku-03", units:7,  channel:"School", area:"Bandra", pincode:"400050", ageBand:"Under 18", repeatCustomer:false, photoProof:true, timestamp:daysAgo(5,14), value:70 }, // DIP
  { sellerId:"seller-01", skuId:"sku-01", units:21, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(4,9),  value:210 },
  { sellerId:"seller-01", skuId:"sku-11", units:3,  channel:"Café",   area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(4,15), value:60 },  // almost gone
  { sellerId:"seller-01", skuId:"sku-07", units:16, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(3,10), value:160 },
  { sellerId:"seller-01", skuId:"sku-14", units:5,  channel:"Corporate Office", area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:true, photoProof:true, timestamp:daysAgo(2,11), value:100 },
  { sellerId:"seller-01", skuId:"sku-03", units:6,  channel:"School", area:"Bandra", pincode:"400050", ageBand:"Under 18", repeatCustomer:false, photoProof:true, timestamp:daysAgo(1,13), value:60 }, // DIP cont
  { sellerId:"seller-01", skuId:"sku-01", units:14, channel:"Gym",    area:"Bandra", pincode:"400050", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(1,10), value:140 },
  { sellerId:"seller-01", skuId:"sku-12", units:9,  channel:"Café",   area:"Bandra", pincode:"400050", ageBand:"26-40", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(0,9),  value:180 },
];

// ---------- OTHER SELLERS ----------
const OTHER_SALES: Omit<SaleRecord, "id">[] = [
  // Aarav — Powai college, heavy student crowd
  { sellerId:"seller-02", skuId:"sku-01", units:25, channel:"College", area:"Powai", pincode:"400076", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(13,12), value:250 },
  { sellerId:"seller-02", skuId:"sku-05", units:18, channel:"College", area:"Powai", pincode:"400076", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(10,11), value:180 },
  { sellerId:"seller-02", skuId:"sku-03", units:30, channel:"College", area:"Powai", pincode:"400076", ageBand:"18-25", repeatCustomer:false, photoProof:true,  timestamp:daysAgo(7,10),  value:300 },
  { sellerId:"seller-02", skuId:"sku-14", units:12, channel:"College", area:"Powai", pincode:"400076", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(4,14),  value:240 },
  { sellerId:"seller-02", skuId:"sku-07", units:22, channel:"College", area:"Powai", pincode:"400076", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(2,13),  value:220 },
  { sellerId:"seller-02", skuId:"sku-11", units:10, channel:"College", area:"Powai", pincode:"400076", ageBand:"18-25", repeatCustomer:true,  photoProof:true,  timestamp:daysAgo(1,10),  value:200 },

  // Sneha — Andheri corporate offices
  { sellerId:"seller-03", skuId:"sku-02", units:20, channel:"Corporate Office", area:"Andheri", pincode:"400053", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(12,10), value:400 },
  { sellerId:"seller-03", skuId:"sku-10", units:15, channel:"Corporate Office", area:"Andheri", pincode:"400053", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(9,11),  value:300 },
  { sellerId:"seller-03", skuId:"sku-14", units:18, channel:"Corporate Office", area:"Andheri", pincode:"400053", ageBand:"26-40", repeatCustomer:true,  photoProof:false, timestamp:daysAgo(6,10), value:360 }, // NO PHOTO — fraud flag
  { sellerId:"seller-03", skuId:"sku-12", units:14, channel:"Corporate Office", area:"Andheri", pincode:"400053", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(3,9),   value:280 },
  { sellerId:"seller-03", skuId:"sku-06", units:10, channel:"Corporate Office", area:"Andheri", pincode:"400053", ageBand:"26-40", repeatCustomer:false, photoProof:true, timestamp:daysAgo(1,11),  value:200 },

  // Vikram — Hub partner, Thane, biggest volumes
  { sellerId:"seller-04", skuId:"sku-02", units:40, channel:"Vending Machine", area:"Thane", pincode:"400601", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(14,9),  value:800 },
  { sellerId:"seller-04", skuId:"sku-08", units:35, channel:"Vending Machine", area:"Thane", pincode:"400601", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(11,10), value:700 },
  { sellerId:"seller-04", skuId:"sku-04", units:30, channel:"School",          area:"Thane", pincode:"400601", ageBand:"Under 18", repeatCustomer:false, photoProof:true, timestamp:daysAgo(8,11), value:300 },
  { sellerId:"seller-04", skuId:"sku-06", units:28, channel:"Vending Machine", area:"Thane", pincode:"400601", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(5,9),   value:560 },
  { sellerId:"seller-04", skuId:"sku-11", units:20, channel:"Gym",             area:"Thane", pincode:"400601", ageBand:"18-25", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(2,10),  value:400 },

  // Fatima — Lower Parel café
  { sellerId:"seller-05", skuId:"sku-12", units:16, channel:"Café", area:"Lower Parel", pincode:"400013", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(13,12), value:320 },
  { sellerId:"seller-05", skuId:"sku-13", units:14, channel:"Café", area:"Lower Parel", pincode:"400013", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(10,11), value:140 },
  { sellerId:"seller-05", skuId:"sku-05", units:10, channel:"Café", area:"Lower Parel", pincode:"400013", ageBand:"26-40", repeatCustomer:false, photoProof:true, timestamp:daysAgo(7,10),  value:100 },
  { sellerId:"seller-05", skuId:"sku-11", units:8,  channel:"Café", area:"Lower Parel", pincode:"400013", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(3,14),  value:160 },

  // Karan — Borivali, just starting
  { sellerId:"seller-06", skuId:"sku-01", units:8,  channel:"School", area:"Borivali", pincode:"400066", ageBand:"Under 18", repeatCustomer:false, photoProof:true, timestamp:daysAgo(12,10), value:80 },
  { sellerId:"seller-06", skuId:"sku-09", units:6,  channel:"School", area:"Borivali", pincode:"400066", ageBand:"Under 18", repeatCustomer:false, photoProof:true, timestamp:daysAgo(7,11),  value:60 },
  { sellerId:"seller-06", skuId:"sku-03", units:5,  channel:"Café",   area:"Borivali", pincode:"400066", ageBand:"26-40", repeatCustomer:false,  photoProof:true, timestamp:daysAgo(3,12),   value:50 },

  // Ananya — Vashi
  { sellerId:"seller-07", skuId:"sku-07", units:20, channel:"College", area:"Vashi", pincode:"400703", ageBand:"18-25", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(11,13), value:200 },
  { sellerId:"seller-07", skuId:"sku-03", units:18, channel:"College", area:"Vashi", pincode:"400703", ageBand:"18-25", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(8,11),  value:180 },
  { sellerId:"seller-07", skuId:"sku-14", units:10, channel:"College", area:"Vashi", pincode:"400703", ageBand:"18-25", repeatCustomer:false, photoProof:true, timestamp:daysAgo(4,12),  value:200 },
  { sellerId:"seller-07", skuId:"sku-01", units:15, channel:"Gym",     area:"Vashi", pincode:"400703", ageBand:"18-25", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(1,10),  value:150 },

  // Rohit — BKC gyms + offices
  { sellerId:"seller-08", skuId:"sku-02", units:22, channel:"Gym",             area:"BKC", pincode:"400051", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(12,9),  value:440 },
  { sellerId:"seller-08", skuId:"sku-08", units:18, channel:"Gym",             area:"BKC", pincode:"400051", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(9,11),  value:360 },
  { sellerId:"seller-08", skuId:"sku-10", units:12, channel:"Corporate Office", area:"BKC", pincode:"400051", ageBand:"26-40", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(6,10),  value:240 },
  { sellerId:"seller-08", skuId:"sku-14", units:8,  channel:"Corporate Office", area:"BKC", pincode:"400051", ageBand:"26-40", repeatCustomer:false, photoProof:true, timestamp:daysAgo(2,11),  value:160 },
];

// ---------- ARJUN'S SALES (seller-09) — 5 days in, gym-first strategy ----------
// New seller in Andheri, Flamin' Fun Puffs Mini (sku-01) as hero SKU.
// First Win target: 10 packs. Currently at 9 packs — 1 away from milestone.
const ARJUN_SALES: Omit<SaleRecord, "id">[] = [
  { sellerId:"seller-09", skuId:"sku-01", units:1, channel:"Gym",     area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:false, photoProof:true, timestamp:daysAgo(5,8),  value:10 },
  { sellerId:"seller-09", skuId:"sku-01", units:1, channel:"Gym",     area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:false, photoProof:true, timestamp:daysAgo(5,11), value:10 },
  { sellerId:"seller-09", skuId:"sku-07", units:1, channel:"Gym",     area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:false, photoProof:true, timestamp:daysAgo(4,9),  value:10 },
  { sellerId:"seller-09", skuId:"sku-01", units:1, channel:"Gym",     area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:false, photoProof:true, timestamp:daysAgo(4,12), value:10 },
  { sellerId:"seller-09", skuId:"sku-01", units:1, channel:"Gym",     area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(3,8),  value:10 },
  { sellerId:"seller-09", skuId:"sku-01", units:1, channel:"College", area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:false, photoProof:true, timestamp:daysAgo(2,14), value:10 },
  { sellerId:"seller-09", skuId:"sku-07", units:1, channel:"Gym",     area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:false, photoProof:true, timestamp:daysAgo(2,9),  value:10 },
  { sellerId:"seller-09", skuId:"sku-01", units:1, channel:"Gym",     area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:true,  photoProof:true, timestamp:daysAgo(1,8),  value:10 },
  { sellerId:"seller-09", skuId:"sku-01", units:1, channel:"Gym",     area:"Andheri", pincode:"400053", ageBand:"18-25", repeatCustomer:false, photoProof:true, timestamp:daysAgo(0,9),  value:10 },
];

// Build final array with IDs
const ALL_SALES_RAW = [...RIYA_SALES, ...OTHER_SALES, ...ARJUN_SALES];

export const SEED_SALES: SaleRecord[] = ALL_SALES_RAW.map((s, i) => ({
  ...s,
  id: `sale-${String(i + 1).padStart(3, "0")}`,
}));

// ---------- RIYA'S STOCK ON HAND ----------
// Used by the stockout predictor. Keep Millet Bhel deliberately low.
export const RIYA_STOCK: Record<string, number> = {
  "sku-01": 60,  // Flamin Fun Mini — healthy stock
  "sku-02": 30,
  "sku-03": 20,  // Chaat Corner Mini — moderate
  "sku-04": 15,
  "sku-05": 25,  // Pizza Party Mini
  "sku-06": 10,
  "sku-07": 55,  // Mighty Masala Mini — healthy
  "sku-08": 20,
  "sku-09": 30,
  "sku-10": 10,
  "sku-11": 6,   // Millet Bhel — CRITICAL, ~2 days left
  "sku-12": 25,
  "sku-13": 15,
  "sku-14": 18,
};
