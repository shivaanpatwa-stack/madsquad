"use client";
import React, { createContext, useContext, useReducer, useCallback } from "react";
import { SEED_SALES, type SaleRecord } from "@/lib/sales";
import { SELLERS, getTier, type Seller } from "@/lib/sellers";
import { calcPointsForSale } from "@/lib/points";

// ─────────────────────────────────────────────────────────────────────────────
// STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────
export type OnboardingDetails = {
  name: string;
  area: string;
  channels: string[];
  hoursPerWeek: string;
};

export type AppState = {
  seller: Seller;
  sales: SaleRecord[];
  points: number;
  redeemedRewardIds: string[];
  lastSalePoints: number | null;
  streak: number;
  // Onboarding flow state
  onboardingComplete: boolean;
  starterPackage: 100 | 500 | 1000;
  onboardingDetails: OnboardingDetails;
  generatedPlan: string | null;
};

const ARJUN = SELLERS.find((s) => s.isCurrentUser)!;
// 520 pts = just entered Muncher tier. Includes First Win bonus + 5 days of activity.
const BASE_POINTS = 520;

const initialState: AppState = {
  seller: ARJUN,
  sales: SEED_SALES,
  points: BASE_POINTS,
  redeemedRewardIds: [],
  lastSalePoints: null,
  streak: 5,
  onboardingComplete: false,
  starterPackage: 500,
  onboardingDetails: {
    name: "Arjun Sharma",
    area: "Andheri",
    channels: ["Gym", "College"],
    hoursPerWeek: "5-10",
  },
  generatedPlan: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
type Action =
  | { type: "LOG_SALE"; sale: SaleRecord }
  | { type: "REDEEM_REWARD"; rewardId: string; pointsCost: number }
  | { type: "CLEAR_LAST_SALE_POINTS" }
  | { type: "COMPLETE_ONBOARDING"; pkg: 100 | 500 | 1000; details: OnboardingDetails; plan: string | null }
  | { type: "SKIP_TO_DEMO" };

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
    case "COMPLETE_ONBOARDING":
      return {
        ...state,
        onboardingComplete: true,
        starterPackage: action.pkg,
        onboardingDetails: action.details,
        generatedPlan: action.plan,
      };
    case "SKIP_TO_DEMO":
      return { ...state, onboardingComplete: true };
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
  completeOnboarding: (pkg: 100 | 500 | 1000, details: OnboardingDetails, plan: string | null) => void;
  skipToDemo: () => void;
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

  const completeOnboarding = useCallback(
    (pkg: 100 | 500 | 1000, details: OnboardingDetails, plan: string | null) => {
      dispatch({ type: "COMPLETE_ONBOARDING", pkg, details, plan });
    },
    []
  );

  const skipToDemo = useCallback(() => {
    dispatch({ type: "SKIP_TO_DEMO" });
  }, []);

  return (
    <AppContext.Provider value={{ state, logSale, redeemReward, clearLastSalePoints, completeOnboarding, skipToDemo }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
