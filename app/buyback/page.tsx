"use client";
import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { Shield, CheckCircle, Clock, Package, ArrowRight, X } from "lucide-react";

const START_DATE = new Date("2026-06-22");
const TODAY = new Date("2026-06-27");
const DAYS_IN = Math.round((TODAY.getTime() - START_DATE.getTime()) / 86400000);
const GUARANTEE_DEADLINE = new Date(START_DATE);
GUARANTEE_DEADLINE.setDate(GUARANTEE_DEADLINE.getDate() + 14);

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BuyBackPage() {
  const { state, requestBuyBack } = useApp();
  const { sales, buyBackRequested, starterPackage } = state;
  const PACKAGE_COST = starterPackage;
  const DAYS_LEFT = Math.max(0, 14 - DAYS_IN);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const mySales = sales.filter((s) => s.sellerId === state.seller.id);
  const recovered = mySales.reduce((s, r) => s + r.value, 0);
  const pct = Math.min(100, Math.round((recovered / PACKAGE_COST) * 100));
  const unsoldValue = Math.max(0, PACKAGE_COST - recovered);
  const eligible = !buyBackRequested && DAYS_LEFT <= 0 ? false : unsoldValue > 0 && DAYS_LEFT <= 3;
  const inProfit = recovered >= PACKAGE_COST;

  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;

  const handleConfirm = () => {
    requestBuyBack();
    setConfirmed(true);
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* Header */}
      <div style={{ background: "#1A1200", padding: "48px 20px 24px" }}>
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} style={{ color: "#FF6900" }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF6900" }}>Buy-Back Guarantee</p>
        </div>
        <h1 className="text-white font-black leading-tight" style={{ fontSize: 26, letterSpacing: "-0.01em" }}>
          Your investment,<br />protected.
        </h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          MadMix buys back unsold stock if you don&apos;t recoup in 14 days
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Status hero */}
        {inProfit ? (
          <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)", padding: "28px 24px" }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} color="white" />
              <p className="text-white font-bold text-xs uppercase tracking-widest">Guarantee Status</p>
            </div>
            <h2 className="text-white font-black text-2xl mb-1">In Profit! 🎉</h2>
            <p className="text-green-200 text-sm">You&apos;ve fully recovered your ₹{PACKAGE_COST} investment. The guarantee served its purpose — you never needed it.</p>
          </div>
        ) : buyBackRequested || confirmed ? (
          <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)", padding: "28px 24px" }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} color="white" />
              <p className="text-white font-bold text-xs uppercase tracking-widest">Buy-Back Requested</p>
            </div>
            <h2 className="text-white font-black text-2xl mb-1">Request Submitted</h2>
            <p className="text-purple-200 text-sm">MadMix will review your sales records and process the buy-back within 3–5 business days. You&apos;ll receive ₹{unsoldValue} back.</p>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}>
            <div style={{ padding: "24px 24px 20px" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full" style={{ background: DAYS_LEFT <= 2 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }} />
                <p className="text-white font-bold text-xs uppercase tracking-widest opacity-90">
                  {DAYS_LEFT > 0 ? `${DAYS_LEFT} day${DAYS_LEFT !== 1 ? "s" : ""} left on guarantee` : "Guarantee window closed"}
                </p>
              </div>
              <div className="flex items-center gap-6">
                {/* Ring chart */}
                <svg viewBox="0 0 100 100" style={{ width: 96, height: 96, flexShrink: 0 }}>
                  <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                  <circle cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="10"
                    strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
                    transform="rotate(-90 50 50)" />
                  <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="900">{pct}%</text>
                  <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7.5">recovered</text>
                </svg>
                <div>
                  <p className="text-white font-black" style={{ fontSize: 34, lineHeight: 1, letterSpacing: "-0.02em" }}>₹{recovered}</p>
                  <p className="text-white/60 text-sm mt-1">of ₹{PACKAGE_COST} recovered</p>
                  <p className="text-white font-bold text-sm mt-2">₹{unsoldValue} eligible for buy-back</p>
                </div>
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.12)", padding: "12px 24px 20px" }}>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.2)" }}>
                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>Started {fmt(START_DATE)}</span>
                <span>Deadline {fmt(GUARANTEE_DEADLINE)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F0E6D8" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Guarantee Timeline</p>
          </div>
          {[
            { day: "Day 1", label: "Starter pack delivered", date: fmt(START_DATE), done: true },
            { day: `Day ${DAYS_IN}`, label: "Today", date: fmt(TODAY), done: true, current: true },
            { day: "Day 14", label: "Guarantee deadline", date: fmt(GUARANTEE_DEADLINE), done: DAYS_LEFT <= 0 },
          ].map(({ day, label, date, done, current }) => (
            <div key={day} className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: "1px solid #F8F0E8" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: done ? (current ? "#FF6900" : "#22c55e") : "#F0E6D8",
                  border: current ? "2px solid #FF6900" : "none",
                }}>
                {done && !current && <CheckCircle size={15} color="white" />}
                {done && current && <Clock size={14} color="white" />}
                {!done && <div className="w-2 h-2 rounded-full" style={{ background: "#D0C4B0" }} />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "#1A1200" }}>{label}</p>
                <p className="text-xs" style={{ color: "#9C8870" }}>{date}</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: current ? "#FFF3E6" : "transparent", color: current ? "#FF6900" : "#9C8870" }}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* What counts */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F0E6D8" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Recovery Progress</p>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Recovered", value: `₹${recovered}`, color: "#22c55e" },
                { label: "Remaining", value: `₹${unsoldValue}`, color: unsoldValue > 0 ? "#FF6900" : "#22c55e" },
                { label: "Packs Sold", value: `${mySales.reduce((s, r) => s + r.units, 0)}`, color: "#1A1200" },
                { label: "Sales Made", value: `${mySales.length}`, color: "#1A1200" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl text-center"
                  style={{ background: "#FFF8F0", padding: "12px 8px" }}>
                  <p className="font-black text-xl" style={{ color }}>{value}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#9C8870" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl" style={{ background: "#FFF3E6", border: "1.5px solid #FFB800", padding: "20px" }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} style={{ color: "#FF6900" }} />
            <p className="font-black text-sm" style={{ color: "#1A1200" }}>How the Buy-Back Works</p>
          </div>
          {[
            { icon: Package, text: "You receive a starter pack (₹500 value)" },
            { icon: Clock, text: "You have 14 days to recover your investment through sales" },
            { icon: Shield, text: "If you haven&apos;t fully recovered, MadMix buys back unsold stock at cost" },
            { icon: CheckCircle, text: "No questions asked — request below and receive within 3–5 days" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "#FF6900" }}>
                <Icon size={12} color="white" />
              </div>
              <p className="text-sm" style={{ color: "#1A1200" }} dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          ))}
        </div>

        {/* CTA */}
        {!inProfit && !buyBackRequested && !confirmed && (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-transform"
            style={{
              background: eligible
                ? "linear-gradient(135deg, #FF6900, #FFB800)"
                : "linear-gradient(135deg, #6B5B45, #9C8870)",
              opacity: eligible ? 1 : 0.6,
              cursor: eligible ? "pointer" : "not-allowed",
            }}
            disabled={!eligible}
          >
            {eligible ? `Request Buy-Back · ₹${unsoldValue} →` : `Available from Day 11 onwards · ${DAYS_LEFT}d left`}
          </button>
        )}

        {(buyBackRequested || confirmed) && (
          <div className="rounded-2xl flex items-center gap-3"
            style={{ background: "#F0FDF4", border: "1.5px solid #22c55e", padding: "16px 20px" }}>
            <CheckCircle size={20} style={{ color: "#22c55e", flexShrink: 0 }} />
            <div>
              <p className="font-bold text-sm" style={{ color: "#15803d" }}>Buy-back request received</p>
              <p className="text-xs mt-0.5" style={{ color: "#6B5B45" }}>MadMix will process within 3–5 business days</p>
            </div>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>

      {/* Confirm sheet */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowConfirm(false)}>
          <div className="w-full rounded-t-3xl" style={{ background: "white", padding: "28px 24px 40px" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-lg" style={{ color: "#1A1200" }}>Confirm Buy-Back Request</p>
              <button onClick={() => setShowConfirm(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#F0E6D8" }}>
                <X size={16} style={{ color: "#6B5B45" }} />
              </button>
            </div>
            <div className="rounded-2xl mb-5" style={{ background: "#FFF3E6", padding: "16px 20px" }}>
              <p className="text-sm" style={{ color: "#6B5B45" }}>
                You&apos;ve recovered <strong style={{ color: "#FF6900" }}>₹{recovered}</strong> of ₹{PACKAGE_COST}.
                MadMix will buy back the remaining <strong style={{ color: "#FF6900" }}>₹{unsoldValue}</strong> in unsold stock.
              </p>
            </div>
            <p className="text-xs mb-5" style={{ color: "#9C8870" }}>
              This does not affect your MadSquad membership or your ability to sell in future. The buy-back is a no-fault guarantee.
            </p>
            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}>
              <Shield size={18} />
              Confirm Request · ₹{unsoldValue} back
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
