"use client";
import React, { createContext, useContext, useReducer, useCallback } from "react";
import { SEED_SALES, type SaleRecord } from "@/lib/sales";
import { SELLERS, getTier, type Seller } from "@/lib/sellers";
import { calcPointsForSale } from "@/lib/points";

// ─────────────────────────────────────────────────────────────────────────────
// STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────
export type AppState = {
  seller: Seller;
  sales: SaleRecord[];
  points: number;
  redeemedRewardIds: string[];
  lastSalePoints: number | null; // for the "points earned" animation
  streak: number; // consecutive days with a sale
};

const RIYA = SELLERS.find((s) => s.isCurrentUser)!;
const BASE_POINTS = 1240; // Riya's pre-seeded points

const initialState: AppState = {
  seller: RIYA,
  sales: SEED_SALES,
  points: BASE_POINTS,
  redeemedRewardIds: [],
  lastSalePoints: null,
  streak: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
type Action =
  | { type: "LOG_SALE"; sale: SaleRecord }
  | { type: "REDEEM_REWARD"; rewardId: string; pointsCost: number }
  | { type: "CLEAR_LAST_SALE_POINTS" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOG_SALE": {
      const pts = calcPointsForSale(action.sale);
      const newPoints = state.points + pts;
      const newTier = getTier(newPoints);
      return {
        ...state,
        sales: [action.sale, ...state.sales],
        points: newPoints,
        seller: { ...state.seller, points: newPoints, tier: newTier },
        lastSalePoints: pts,
      };
    }
    case "REDEEM_REWARD": {
      if (state.points < action.pointsCost) return state;
      return {
        ...state,
        points: state.points - action.pointsCost,
        redeemedRewardIds: [...state.redeemedRewardIds, action.rewardId],
        seller: {
          ...state.seller,
          points: state.points - action.pointsCost,
          tier: getTier(state.points - action.pointsCost),
        },
      };
    }
    case "CLEAR_LAST_SALE_POINTS":
      return { ...state, lastSalePoints: null };
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const AppContext = createContext<{
  state: AppState;
  logSale: (sale: SaleRecord) => void;
  redeemReward: (rewardId: string, pointsCost: number) => void;
  clearLastSalePoints: () => void;
} | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const logSale = useCallback((sale: SaleRecord) => {
    dispatch({ type: "LOG_SALE", sale });
  }, []);

  const redeemReward = useCallback((rewardId: string, pointsCost: number) => {
    dispatch({ type: "REDEEM_REWARD", rewardId, pointsCost });
  }, []);

  const clearLastSalePoints = useCallback(() => {
    dispatch({ type: "CLEAR_LAST_SALE_POINTS" });
  }, []);

  return (
    <AppContext.Provider value={{ state, logSale, redeemReward, clearLastSalePoints }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
