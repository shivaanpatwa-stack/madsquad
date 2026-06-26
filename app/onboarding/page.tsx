"use client";
import { useState } from "react";
import Link from "next/link";
import { FIRST_WIN_FALLBACK_MISSION, type FirstWinMission } from "@/lib/territory";
import { callMentor } from "@/lib/mentor";
import { MapPin, Package, Clock, Zap, Mic, Target, CheckCircle } from "lucide-react";

type Step = "welcome" | "mission" | "tracking" | "celebration";

const MISSION_SYSTEM = `You are the MadSquad Mission Engine. Give a brand-new Indian snack distributor their very first sales mission. It must be hyper-specific and feel guaranteed to work. Use ONLY the data provided. Output a single mission using these exact labeled sections on separate lines:
WHERE: [exact venue + area]
WHAT: [exact SKU name and price]
WHEN: [exact time window]
WHY IT WORKS: [cite the nearby-seller numbers given]
SCRIPT: [1-2 lines of casual Hinglish a young Indian seller would say at this venue]
TARGET: [units to sell and the reward]
Keep it punchy and confident. Never generic.`;

const MISSION_PROMPT = `New seller details:
- Name: Arjun Kapoor
- Area: Andheri West (400053)
- Partner type: Home-based seller
- Nearest active seller: Sneha Nair (Andheri, Corporate Office specialist — gym channel is UNTAPPED in this zone)
- Nearby demand signal: Sellers 2km away in Bandra move 18+ Flamin' Fun Puffs (Mini) per morning at gyms
- Most proven gym SKU nearby: Flamin' Fun Puffs (Mini) — ₹10 per pack
- Territory analysis: Zero active MadSquad sellers at Andheri West gyms
- First Win target: 10 packs
- Reward: First Win badge + 50 bonus points + your first ₹100 back

Generate the mission now.`;

function parseMission(text: string): Partial<FirstWinMission> {
  const extract = (label: string): string => {
    const re = new RegExp(`${label}:\\s*(.+?)(?=\\n[A-Z\\s]+:|$)`, "si");
    return text.match(re)?.[1]?.trim() ?? "";
  };
  return {
    where: extract("WHERE"),
    what: extract("WHAT"),
    when: extract("WHEN"),
    whyItWorks: extract("WHY IT WORKS"),
    script: extract("SCRIPT"),
  };
}

const MISSION_FIELDS: { key: keyof FirstWinMission; label: string; icon: typeof MapPin }[] = [
  { key: "where",      label: "WHERE",         icon: MapPin    },
  { key: "what",       label: "WHAT TO SELL",  icon: Package   },
  { key: "when",       label: "WHEN",          icon: Clock     },
  { key: "whyItWorks", label: "WHY IT WORKS",  icon: Zap       },
  { key: "script",     label: "YOUR SCRIPT",   icon: Mic       },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [mission, setMission] = useState<FirstWinMission>(FIRST_WIN_FALLBACK_MISSION);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const target = mission.target;
  const pct = Math.min(100, Math.round((progress / target) * 100));

  const getMission = async () => {
    setLoading(true);
    const text = await callMentor(MISSION_SYSTEM, MISSION_PROMPT, "");
    if (text) {
      const parsed = parseMission(text);
      if (parsed.where && parsed.what && parsed.when) {
        setMission({ ...FIRST_WIN_FALLBACK_MISSION, ...parsed });
      }
    }
    setLoading(false);
    setStep("mission");
  };

  if (step === "welcome") {
    return (
      <div className="min-h-screen flex flex-col md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
        <div className="px-5 pt-12 pb-6" style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}>
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black text-white mb-4"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            AK
          </div>
          <h1 className="text-2xl font-black text-white">Swagat hai, Arjun! 🎉</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>
            Andheri West · Home-based seller · Nibbler
          </p>
        </div>

        <div className="flex-1 px-4 py-6 space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF3E6" }}>
                <Target size={22} style={{ color: "#FF6900" }} />
              </div>
              <div>
                <p className="font-bold" style={{ color: "#1A1200" }}>7-Day First Win Guarantee</p>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "#6B5B45" }}>
                  88% of new distributors quit before making their first sale. MadSquad fixes that
                  with a territory-specific mission — where to go, what to sell, what to say.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { emoji: "📍", text: "We'll find the exact venue nearest to you with zero competition." },
              { emoji: "📦", text: "We'll pick the SKU that's already selling fast in your zone." },
              { emoji: "💬", text: "We'll write your opening line — in Hinglish that actually works." },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
                <p className="text-sm" style={{ color: "#1A1200" }}>{text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#FFF3E6", border: "1px solid #FFB800" }}>
            <p className="text-xs font-bold" style={{ color: "#FF6900" }}>
              🎁 First Win reward: 50 bonus points + your first ₹100 back + First Win badge
            </p>
          </div>
        </div>

        <div className="px-4 pb-10">
          <button
            onClick={getMission}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-transform disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Building your mission...
              </span>
            ) : (
              "Get My First Mission 🎯"
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === "mission") {
    return (
      <div className="min-h-screen md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
        <div className="px-5 pt-10 pb-4" style={{ background: "#1A1200" }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#FF6900" }}>
            Your First Win Mission
          </p>
          <h1 className="text-xl font-extrabold text-white mt-0.5">Teri mission ready hai 🎯</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Based on real demand data · Zero competition zone
          </p>
        </div>

        <div className="px-4 py-5 space-y-3">
          {MISSION_FIELDS.map(({ key, label, icon: Icon }) => {
            const value = mission[key as keyof FirstWinMission];
            if (!value || typeof value !== "string") return null;
            return (
              <div key={key} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} style={{ color: "#FF6900" }} />
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#FF6900" }}>
                    {label}
                  </p>
                </div>
                <p className="text-sm leading-relaxed font-medium" style={{ color: "#1A1200" }}>{value}</p>
              </div>
            );
          })}

          <div
            className="rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)", border: "none" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-white" />
              <p className="text-[10px] font-black uppercase tracking-wider text-white">TARGET</p>
            </div>
            <p className="text-white font-bold text-sm">
              Sell {mission.target} packs = First Win badge + 50 bonus points + your first ₹100 back
            </p>
          </div>
        </div>

        <div className="px-4 pb-10">
          <button
            onClick={() => setStep("tracking")}
            className="w-full py-4 rounded-2xl font-black text-white active:scale-95 transition-transform"
            style={{ background: "#1A1200" }}
          >
            Got It — Let's Go! 💪
          </button>
        </div>
      </div>
    );
  }

  if (step === "tracking") {
    return (
      <div className="min-h-screen md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
        <div className="px-5 pt-10 pb-4 bg-white" style={{ borderBottom: "1px solid #F0E6D8" }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#FF6900" }}>
            First Win Progress
          </p>
          <h1 className="text-xl font-extrabold mt-0.5" style={{ color: "#1A1200" }}>
            {progress} / {target} packs
          </h1>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Progress bar */}
          <div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: "#F0E6D8" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #FF6900, #FFB800)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: "#9C8870" }}>0 packs</span>
              <span className="text-xs font-bold" style={{ color: "#FF6900" }}>{pct}%</span>
              <span className="text-xs" style={{ color: "#9C8870" }}>{target} packs</span>
            </div>
          </div>

          {/* Mission recap card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#6B5B45" }}>Your Mission</p>
            <div className="space-y-1.5">
              <p className="text-xs" style={{ color: "#1A1200" }}>
                <span style={{ color: "#FF6900", fontWeight: 700 }}>WHERE: </span>{mission.where}
              </p>
              <p className="text-xs" style={{ color: "#1A1200" }}>
                <span style={{ color: "#FF6900", fontWeight: 700 }}>WHEN: </span>{mission.when}
              </p>
              <div className="rounded-xl p-3 mt-2" style={{ background: "#FFF3E6" }}>
                <p className="text-xs italic" style={{ color: "#6B5B45" }}>"{mission.script}"</p>
              </div>
            </div>
          </div>

          {/* Days counter */}
          <div className="flex items-center justify-between px-1">
            {[1,2,3,4,5,6,7].map((d) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: d === 1 ? "#FF6900" : "#F0E6D8",
                    color: d === 1 ? "white" : "#9C8870",
                  }}
                >
                  {d}
                </div>
                <span className="text-[9px]" style={{ color: "#9C8870" }}>Day {d}</span>
              </div>
            ))}
          </div>

          {/* Log a pack button */}
          <button
            onClick={() => {
              const next = progress + 1;
              setProgress(next);
              if (next >= target) setTimeout(() => setStep("celebration"), 400);
            }}
            className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
          >
            I Sold a Pack! +1 🔥
          </button>

          <button
            onClick={() => setProgress(Math.max(0, progress - 1))}
            className="w-full py-2 text-xs"
            style={{ color: "#9C8870" }}
          >
            Undo last
          </button>
        </div>
      </div>
    );
  }

  // celebration
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center md:max-w-2xl md:mx-auto"
      style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}
    >
      <div className="text-8xl mb-4 animate-bounce">🎉</div>
      <h1 className="text-3xl font-black text-white">FIRST WIN!</h1>
      <p className="text-white/90 mt-2 text-lg">Tujhe {target} packs bech diye!</p>

      <div className="mt-6 bg-white/20 rounded-2xl p-5 w-full">
        <div className="flex justify-around">
          {[
            { label: "Packs Sold", value: target },
            { label: "Bonus Points", value: "+50" },
            { label: "Cash Back", value: "₹100" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-white/75 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-white/20 rounded-2xl px-4 py-3 w-full flex items-center gap-3">
        <CheckCircle size={20} className="text-white shrink-0" />
        <p className="text-white text-sm font-bold text-left">First Win badge unlocked 🏆</p>
      </div>

      <p className="text-white/75 text-sm mt-4">
        88/100 new sellers quit before this moment. You didn't. That's everything.
      </p>

      <Link
        href="/"
        className="mt-8 w-full py-4 bg-white rounded-2xl font-black text-lg active:scale-95 transition-transform block"
        style={{ color: "#FF6900" }}
      >
        Go to Dashboard 🚀
      </Link>
    </div>
  );
}
