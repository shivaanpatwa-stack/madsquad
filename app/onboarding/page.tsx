"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/AppContext";
import { callMentor } from "@/lib/mentor";
import { AREAS, CHANNELS } from "@/lib/sellers";
import type { OnboardingDetails } from "@/store/AppContext";
import { Shield, Target, TrendingUp, MapPin, Package, Clock, Mic, Zap, CheckCircle, ArrowRight, ChevronRight, LayoutGrid } from "lucide-react";
import { getVenuesForArea, getVenueListString, buildAreaFallbackPlan } from "@/lib/venues";
import GuaranteeBadge from "@/components/ui/GuaranteeBadge";

type Screen = "welcome" | "package" | "details" | "plan" | "done";

const PACKAGES: { value: 100 | 500 | 1000; label: string; packs: string; tag?: string }[] = [
  { value: 100,  label: "₹100 Starter",  packs: "~10 packs to get going"                     },
  { value: 500,  label: "₹500 Hustler",  packs: "~50 packs to build real momentum", tag: "Most Popular" },
  { value: 1000, label: "₹1000 Pro",     packs: "~100 packs for an ambitious start"           },
];

const HOURS_OPTIONS = ["2-5 hrs/week", "5-10 hrs/week", "10+ hrs/week"];

// ── Gemini plan prompt ─────────────────────────────────────────────────────
const buildPlanSystem = () => `You are the MadSquad Plan Engine. A new Indian snack distributor just signed up. Using their package size, location, accessible channels, and hours, plus nearby demand and seller-coverage data provided, generate a specific, encouraging 7-day starting plan. Output exactly 5 labeled sections on separate lines:
FIRST_MISSION: [exact venue type + area + SKU + time window + 1-2 line casual Hinglish sales script]
SEVEN_DAY_TARGET: [number of packs and what winning looks like]
YOUR_TERRITORY: [assigned low-saturation zone + a positive reason]
WHAT_TO_STOCK: [which SKUs to prioritise and why]
FIRST_MILESTONE: [what to hit, the reward, and an encouraging line]
Be specific, confident, and supportive. Never generic. Use the numbers provided. Do not mention failure, quitting, or risk statistics — keep it positive and action-focused.`;

const buildPlanPrompt = (pkg: number, details: OnboardingDetails) => {
  const venueList = getVenueListString(details.area, details.channels);
  return `New seller details:
- Package: ₹${pkg} (~${pkg / 10} packs at ₹10 each)
- Name: ${details.name}
- Area: ${details.area}
- Channels: ${details.channels.join(", ")}
- Hours per week: ${details.hoursPerWeek}
- Verified venues in ${details.area} matched to their channels: ${venueList}
- CRITICAL: Recommend ONLY venues from the list above — no generic placeholders
- Seller coverage: Low saturation in ${details.area} — room to grow
- First Win target: ${Math.round(pkg / 10 * 0.2)} packs (first milestone)
- 7-day target: ${Math.round(pkg / 10)} packs

Generate the plan now using the exact venue names listed above.`;
};

const FALLBACK_PLAN = `FIRST_MISSION: Gold's Gym Andheri West — sell Flamin' Fun Puffs Mini (₹10) between 7–9 AM. Script: "Bhai, pre-workout snack try kar — MadMix ka naya puff hai, sirf dus rupaye!"
SEVEN_DAY_TARGET: Sell 50 packs in 7 days. That's your full starter stock out the door and ₹500 in your pocket.
YOUR_TERRITORY: Andheri is yours — strong gym and college demand, and low MadSquad seller coverage right now. You're first mover here.
WHAT_TO_STOCK: Lead with Flamin' Fun Puffs Mini — proven gym seller. Add Mighty Masala Bhujia Mini for SEEPZ Office Park. Both at ₹10, easy impulse buy.
FIRST_MILESTONE: Sell your first 10 packs to earn your First Win badge + 50 bonus points + ₹100 back on your starter. Aaj pehle 10 nikaalo!`;

type PlanSection = { label: string; icon: typeof MapPin; value: string };

function parsePlan(text: string): PlanSection[] {
  const extract = (key: string): string => {
    const re = new RegExp(`${key}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, "si");
    return text.match(re)?.[1]?.trim() ?? "";
  };
  return [
    { label: "YOUR FIRST MISSION",    icon: Zap,     value: extract("FIRST_MISSION")   },
    { label: "7-DAY TARGET",          icon: Target,  value: extract("SEVEN_DAY_TARGET") },
    { label: "YOUR TERRITORY",        icon: MapPin,  value: extract("YOUR_TERRITORY")   },
    { label: "WHAT TO STOCK",         icon: Package, value: extract("WHAT_TO_STOCK")    },
    { label: "YOUR FIRST MILESTONE",  icon: CheckCircle, value: extract("FIRST_MILESTONE") },
  ].filter((s) => !!s.value);
}

// ── Screen 1 — Welcome ─────────────────────────────────────────────────────
function WelcomeScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const VALUE_PROPS = [
    {
      Icon: Shield,
      iconBg: "#FFF3E6",
      iconColor: "#FF6900",
      title: "Risk-free start",
      body: "Sell your starter pack in 7 days, or MadMix buys it back. Your investment is always protected.",
    },
    {
      Icon: Target,
      iconBg: "#EDE9FE",
      iconColor: "#7C3AED",
      title: "A plan built for your area",
      body: "AI-generated first mission using real demand signals where you actually are — not generic advice.",
    },
    {
      Icon: LayoutGrid,
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
      title: "Everything in one place",
      body: "Log sales, track stock, get guidance, earn rewards, see your territory — one clean app.",
    },
  ];

  return (
    <div className="screen" style={{ background: "#FFF8F0" }}>
      {/* Skip — top-right, unobtrusive */}
      <div className="flex justify-end px-5 pt-5 shrink-0">
        <button
          onClick={onSkip}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{ color: "#9C8870", background: "#F0E6D8" }}
        >
          Skip → Demo
        </button>
      </div>

      {/* ── Hero — full-bleed gradient, all the energy ── */}
      <div
        className="px-6 pt-8 pb-10 animate-fade-in-up"
        style={{ background: "linear-gradient(150deg, #FF6900 0%, #FFB800 100%)" }}
      >
        {/* Logo mark */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base"
            style={{ background: "rgba(255,255,255,0.22)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            M
          </div>
          <div>
            <p className="font-black text-white text-base leading-tight tracking-tight">MadSquad</p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>by MadMix</p>
          </div>
        </div>

        {/* Guarantee badge — the USP centrepiece */}
        <div className="mb-5">
          <GuaranteeBadge
            variant="hero"
            label="Sell it or we buy it back. Zero risk."
          />
        </div>

        {/* Headline */}
        <h1
          className="font-black text-white leading-tight mb-3"
          style={{ fontSize: "clamp(28px, 8vw, 38px)", letterSpacing: "-0.02em" }}
        >
          Start selling MadMix.<br />
          <span style={{ color: "#FFE066" }}>We set you up to win.</span>
        </h1>

        {/* Sub */}
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6 }}>
          A personalized plan built around where demand actually is, near you.
        </p>
      </div>

      {/* ── Value props — clear, spaced, consistent ── */}
      <div className="flex-1 px-5 pt-6 space-y-3">
        {VALUE_PROPS.map(({ Icon, iconBg, iconColor, title, body }, i) => (
          <div
            key={title}
            className="animate-fade-in-up flex items-start gap-4 rounded-[20px] px-4 py-4"
            style={{
              background: "#fff",
              border: "1px solid #F0E6D8",
              boxShadow: "0 2px 8px rgba(26,18,0,0.04)",
              animationDelay: `${(i + 1) * 60}ms`,
            }}
          >
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
              style={{ background: iconBg }}
            >
              <Icon size={20} color={iconColor} strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: "#1A1200" }}>{title}</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B5B45" }}>{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="px-5 pt-6 pb-10 shrink-0 space-y-3 animate-fade-in-up stagger-4">
        <button
          onClick={onNext}
          className="btn btn-primary btn-full"
          style={{ fontSize: 16 }}
        >
          Get Started →
        </button>
        <p className="text-center text-xs" style={{ color: "#9C8870" }}>
          Quick setup · No real data sent · Powered by MadMix
        </p>
      </div>
    </div>
  );
}

// ── Screen 2 — Package ─────────────────────────────────────────────────────
function PackageScreen({ selected, onSelect, onNext, onBack }: { selected: 100 | 500 | 1000; onSelect: (v: 100 | 500 | 1000) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFF8F0" }}>
      <div className="px-5 pt-10 pb-5" style={{ background: "linear-gradient(135deg, #1A1200 0%, #3D2B00 100%)" }}>
        <button onClick={onBack} className="text-xs mb-3 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.6)" }}>
          ← Back
        </button>
        <h1 className="text-2xl font-black text-white">Choose your starter pack</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>Pick the size that fits where you're starting</p>
      </div>

      <div className="px-4 py-5 space-y-3 flex-1">
        {PACKAGES.map(({ value, label, packs, tag }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className="w-full text-left rounded-2xl p-5 transition-all active:scale-[0.98] relative"
            style={{
              border: selected === value ? "2px solid #FF6900" : "1.5px solid #F0E6D8",
              background: selected === value ? "#FFF3E6" : "white",
            }}
          >
            {tag && (
              <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#FF6900", color: "white" }}>
                {tag}
              </span>
            )}
            <p className="font-black text-lg" style={{ color: "#1A1200" }}>{label}</p>
            <p className="text-sm mt-0.5" style={{ color: "#6B5B45" }}>{packs}</p>
            {selected === value && (
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle size={14} style={{ color: "#FF6900" }} />
                <span className="text-xs font-bold" style={{ color: "#FF6900" }}>Selected</span>
              </div>
            )}
          </button>
        ))}

        <div className="rounded-2xl px-4 py-4" style={{ background: "#FFF3E6", border: "1.5px solid #FFB800" }}>
          <p className="text-sm font-bold" style={{ color: "#1A1200" }}>
            🛡️ MadMix Guarantee
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B5B45" }}>
            Don't sell your starter pack in 7 days? MadMix buys it back. Your investment is always protected.
          </p>
        </div>
      </div>

      <div className="px-4 pb-10">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
        >
          Continue with ₹{selected} pack →
        </button>
      </div>
    </div>
  );
}

// ── Screen 3 — Details ─────────────────────────────────────────────────────
function DetailsScreen({ details, onChange, onNext, onBack }: {
  details: OnboardingDetails;
  onChange: (d: OnboardingDetails) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggleChannel = (ch: string) => {
    const curr = details.channels;
    onChange({ ...details, channels: curr.includes(ch) ? curr.filter((c) => c !== ch) : [...curr, ch] });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFF8F0" }}>
      <div className="px-5 pt-10 pb-5" style={{ background: "linear-gradient(135deg, #1A1200 0%, #3D2B00 100%)" }}>
        <button onClick={onBack} className="text-xs mb-3 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.6)" }}>
          ← Back
        </button>
        <h1 className="text-2xl font-black text-white">Tell us about you</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>Your plan gets more personal the more you share</p>
      </div>

      <div className="px-4 py-5 space-y-5 flex-1">
        {/* Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#6B5B45" }}>Your Name</label>
          <input
            value={details.name}
            onChange={(e) => onChange({ ...details, name: e.target.value })}
            placeholder="Full name"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: "#F0E6D8", color: "#1A1200", background: "white" }}
          />
        </div>

        {/* Area */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#6B5B45" }}>Your Area</label>
          <select
            value={details.area}
            onChange={(e) => onChange({ ...details, area: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: "#F0E6D8", color: "#1A1200", background: "white" }}
          >
            {AREAS.map((a) => <option key={a.name} value={a.name}>{a.name}</option>)}
          </select>
        </div>

        {/* Channels */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide block mb-2" style={{ color: "#6B5B45" }}>Where Can You Sell?</label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((ch) => {
              const on = details.channels.includes(ch);
              return (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: on ? "#FF6900" : "white",
                    color: on ? "white" : "#6B5B45",
                    border: on ? "none" : "1px solid #F0E6D8",
                  }}
                >
                  {ch}
                </button>
              );
            })}
          </div>

          {/* Venue preview — shows matched venues for selected area + channels */}
          {details.area && details.channels.length > 0 && (() => {
            const matched = getVenuesForArea(details.area, details.channels).slice(0, 3);
            if (matched.length === 0) return null;
            return (
              <div className="mt-3 rounded-xl px-3 py-2.5" style={{ background: "#FFF3E6", border: "1px solid #FFB800" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#FF6900" }}>
                  📍 Verified spots in {details.area}
                </p>
                <div className="space-y-1">
                  {matched.map((v) => (
                    <div key={v.name} className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "white", color: "#6B5B45" }}>{v.channel}</span>
                      <span className="text-xs font-medium" style={{ color: "#1A1200" }}>{v.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: "#9C8870" }}>Your plan will be built around these.</p>
              </div>
            );
          })()}
        </div>

        {/* Hours */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide block mb-2" style={{ color: "#6B5B45" }}>Hours You Can Sell Per Week</label>
          <div className="flex gap-2">
            {HOURS_OPTIONS.map((h) => {
              const on = details.hoursPerWeek === h;
              return (
                <button
                  key={h}
                  onClick={() => onChange({ ...details, hoursPerWeek: h })}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: on ? "#FF6900" : "white",
                    color: on ? "white" : "#6B5B45",
                    border: on ? "none" : "1px solid #F0E6D8",
                  }}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pb-10">
        <button
          onClick={onNext}
          disabled={!details.name.trim() || !details.area || details.channels.length === 0}
          className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
        >
          Build My Plan →
        </button>
      </div>
    </div>
  );
}

// ── Screen 4 — AI Plan ────────────────────────────────────────────────────
function PlanScreen({ plan, pkg, details, onStart }: { plan: string; pkg: number; details: OnboardingDetails; onStart: () => void }) {
  const sections = parsePlan(plan);
  const ICON_MAP = [Zap, Target, MapPin, Package, CheckCircle];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFF8F0" }}>
      <div className="px-5 pt-10 pb-5" style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}>
        <p className="text-xs font-black uppercase tracking-wider text-white/75">Your AI-Powered Starting Plan</p>
        <h1 className="text-2xl font-black text-white mt-1">Ready to go, {details.name.split(" ")[0]}! 🎯</h1>
        <p className="text-sm mt-1 text-white/80">Based on your area, channels, and real demand data in {details.area}</p>
      </div>

      <div className="px-4 py-5 space-y-3 flex-1">
        {sections.map(({ label, value }, i) => {
          const Icon = ICON_MAP[i] ?? Zap;
          return (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: "#FF6900" }} />
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#FF6900" }}>{label}</p>
              </div>
              <p className="text-sm leading-relaxed font-medium" style={{ color: "#1A1200" }}>{value}</p>
            </div>
          );
        })}

        <div className="rounded-2xl px-4 py-4" style={{ background: "#FFF3E6", border: "1.5px solid #FF6900" }}>
          <p className="text-xs font-bold" style={{ color: "#FF6900" }}>
            🛡️ Buy-back guarantee active · ₹{pkg} protected for 7 days
          </p>
        </div>
      </div>

      <div className="px-4 pb-10">
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-transform"
          style={{ background: "#1A1200" }}
        >
          Start Selling →
        </button>
      </div>
    </div>
  );
}

// ── Main Onboarding Orchestrator ───────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, skipToDemo } = useApp();

  const [screen, setScreen] = useState<Screen>("welcome");
  const [pkg, setPkg] = useState<100 | 500 | 1000>(500);
  const [details, setDetails] = useState<OnboardingDetails>({
    name: "",
    area: "Andheri",
    channels: ["Gym"],
    hoursPerWeek: "5-10 hrs/week",
  });
  const [plan, setPlan] = useState<string>(FALLBACK_PLAN);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const handleSkip = () => {
    skipToDemo();
    router.push("/");
  };

  const handleBuildPlan = async () => {
    setScreen("plan");
    setLoadingPlan(true);
    const areaFallback = buildAreaFallbackPlan(details.area, details.channels, pkg);
    const text = await callMentor(buildPlanSystem(), buildPlanPrompt(pkg, details), areaFallback);
    if (text && text.includes("FIRST_MISSION")) setPlan(text);
    else setPlan(areaFallback);
    setLoadingPlan(false);
  };

  const handleStart = () => {
    completeOnboarding(pkg, details, plan);
    router.push("/");
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      {/* Progress dots */}
      {screen !== "welcome" && screen !== "done" && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {(["package", "details", "plan"] as Screen[]).map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: screen === s ? 24 : 8,
                background: screen === s ? "#FF6900" : "#F0E6D8",
              }}
            />
          ))}
        </div>
      )}

      {screen === "welcome" && <WelcomeScreen onNext={() => setScreen("package")} onSkip={handleSkip} />}

      {screen === "package" && (
        <PackageScreen selected={pkg} onSelect={setPkg} onNext={() => setScreen("details")} onBack={() => setScreen("welcome")} />
      )}

      {screen === "details" && (
        <DetailsScreen details={details} onChange={setDetails} onNext={handleBuildPlan} onBack={() => setScreen("package")} />
      )}

      {screen === "plan" && (
        loadingPlan ? (
          <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-8" style={{ background: "#FFF8F0" }}>
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}>
              <Zap size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="font-black text-lg" style={{ color: "#1A1200" }}>Building your plan...</p>
              <p className="text-sm mt-1" style={{ color: "#9C8870" }}>Analysing demand in {details.area} 🔍</p>
            </div>
            <div className="flex gap-1.5">
              {[0,1,2].map((i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: "#FF6900", animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <PlanScreen plan={plan} pkg={pkg} details={details} onStart={handleStart} />
        )
      )}
    </div>
  );
}
