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

export type ReferralRecord = {
  id: string;
  name: string;
  type: "buyer" | "seller";
  timestamp: Date;
  pointsEarned: number;
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
  // Academy
  completedLessons: string[];
  academyCertified: boolean;
  // Referrals
  referralCode: string;
  referrals: ReferralRecord[];
  // Buy-back
  buyBackRequested: boolean;
};

const ARJUN = SELLERS.find((s) => s.isCurrentUser)!;
const BASE_POINTS = 520;

const SEED_REFERRALS: ReferralRecord[] = [
  { id: "ref-1", name: "Priya Verma",  type: "buyer",  timestamp: new Date("2026-06-24T10:00:00"), pointsEarned: 25 },
  { id: "ref-2", name: "Rohan Gupta",  type: "seller", timestamp: new Date("2026-06-25T14:30:00"), pointsEarned: 50 },
  { id: "ref-3", name: "Meera Singh",  type: "buyer",  timestamp: new Date("2026-06-26T09:00:00"), pointsEarned: 25 },
];

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
  completedLessons: [],
  academyCertified: false,
  referralCode: "ARJUN123",
  referrals: SEED_REFERRALS,
  buyBackRequested: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
type Action =
  | { type: "LOG_SALE"; sale: SaleRecord }
  | { type: "REDEEM_REWARD"; rewardId: string; pointsCost: number }
  | { type: "CLEAR_LAST_SALE_POINTS" }
  | { type: "COMPLETE_ONBOARDING"; pkg: 100 | 500 | 1000; details: OnboardingDetails; plan: string | null }
  | { type: "SKIP_TO_DEMO" }
  | { type: "COMPLETE_LESSON"; lessonId: string; lessonPoints: number }
  | { type: "ADD_REFERRAL"; referral: ReferralRecord }
  | { type: "REQUEST_BUY_BACK" };

const TOTAL_LESSONS = 5;
const CERT_BONUS = 200;

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
    case "COMPLETE_LESSON": {
      if (state.completedLessons.includes(action.lessonId)) return state;
      const newCompleted = [...state.completedLessons, action.lessonId];
      const justFinishedAll = newCompleted.length >= TOTAL_LESSONS;
      const certBonus = justFinishedAll && !state.academyCertified ? CERT_BONUS : 0;
      const newPoints = state.points + action.lessonPoints + certBonus;
      return {
        ...state,
        completedLessons: newCompleted,
        academyCertified: state.academyCertified || justFinishedAll,
        points: newPoints,
        seller: { ...state.seller, points: newPoints, tier: getTier(newPoints) },
      };
    }
    case "ADD_REFERRAL": {
      if (state.referrals.find((r) => r.id === action.referral.id)) return state;
      const newPoints = state.points + action.referral.pointsEarned;
      return {
        ...state,
        referrals: [action.referral, ...state.referrals],
        points: newPoints,
        seller: { ...state.seller, points: newPoints, tier: getTier(newPoints) },
      };
    }
    case "REQUEST_BUY_BACK":
      return { ...state, buyBackRequested: true };
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
  completeLesson: (lessonId: string, lessonPoints: number) => void;
  addReferral: (referral: ReferralRecord) => void;
  requestBuyBack: () => void;
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

  const completeLesson = useCallback((lessonId: string, lessonPoints: number) => {
    dispatch({ type: "COMPLETE_LESSON", lessonId, lessonPoints });
  }, []);

  const addReferral = useCallback((referral: ReferralRecord) => {
    dispatch({ type: "ADD_REFERRAL", referral });
  }, []);

  const requestBuyBack = useCallback(() => {
    dispatch({ type: "REQUEST_BUY_BACK" });
  }, []);

  return (
    <AppContext.Provider value={{
      state, logSale, redeemReward, clearLastSalePoints,
      completeOnboarding, skipToDemo, completeLesson,
      addReferral, requestBuyBack,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
