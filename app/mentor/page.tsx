"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/store/AppContext";
import { runCoach, HARDCODED_ANSWERS } from "@/lib/coach";
import { callMentor } from "@/lib/mentor";
import { SNAPSHOT } from "@/lib/snapshot";
import { Brain, MessageCircle, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";

const TODAY = new Date("2026-06-27");
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PRESET_QS = [
  { key: "why_falling",  label: "Why are my sales falling?"  },
  { key: "what_restock", label: "What should I restock?"     },
  { key: "where_next",   label: "Where should I sell next?"  },
  { key: "best_product", label: "What's my best product?"    },
];

const MENTOR_SYSTEM = `You are the MadSquad AI Mentor, a smart business advisor for local MadMix snack distributors in India. You give short, specific, actionable advice based on the seller's actual sales data. You never give generic advice. Always name specific products, channels, and areas. Keep answers under 80 words. Be direct and warm. Use simple English with one Hinglish phrase maximum.`;

function tipBorderColor(priority: number): string {
  if (priority === 0) return "#D62828";
  if (priority === 1) return "#FF6900";
  return "#FFB800";
}

export default function MentorPage() {
  const { state } = useApp();
  const { tips } = runCoach("seller-01");
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [loadingQ, setLoadingQ] = useState<string | null>(null);

  const riyaSales = useMemo(
    () => state.sales.filter((s) => s.sellerId === "seller-01"),
    [state.sales]
  );

  const { thisWeekUnits, lastWeekUnits, thisWeekValue, lastWeekValue } = useMemo(() => {
    let tw = 0, lw = 0, twv = 0, lwv = 0;
    riyaSales.forEach((s) => {
      const days = Math.floor(
        (TODAY.getTime() - new Date(s.timestamp).getTime()) / 86_400_000
      );
      if (days >= 0 && days < 7)  { tw += s.units; twv += s.value; }
      else if (days >= 7 && days < 14) { lw += s.units; lwv += s.value; }
    });
    return { thisWeekUnits: tw, lastWeekUnits: lw, thisWeekValue: twv, lastWeekValue: lwv };
  }, [riyaSales]);

  const unitsTrend =
    lastWeekUnits > 0
      ? Math.round(((thisWeekUnits - lastWeekUnits) / lastWeekUnits) * 100)
      : 0;
  const valueTrend =
    lastWeekValue > 0
      ? Math.round(((thisWeekValue - lastWeekValue) / lastWeekValue) * 100)
      : 0;

  const personalBest = useMemo(() => {
    const byDay: Record<string, { units: number; date: Date }> = {};
    riyaSales.forEach((s) => {
      const d = new Date(s.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!byDay[key]) byDay[key] = { units: 0, date: d };
      byDay[key].units += s.units;
    });
    return Object.values(byDay).sort((a, b) => b.units - a.units)[0] ?? null;
  }, [riyaSales]);

  const handleQ = async (key: string) => {
    if (activeQ === key) { setActiveQ(null); return; }
    setActiveQ(key);
    if (aiAnswers[key]) return;
    setLoadingQ(key);
    const { riyaContext: ctx } = SNAPSHOT;
    const userMsg = `Seller context:
- Name: ${ctx.name}
- Area: ${ctx.area}
- Top SKU: ${ctx.topSku}
- Sales trend (last 7 days vs prior 7): ${ctx.trendPct}% change
- Fastest channel: ${ctx.fastestChannel}
- Days until Millet Bhel stockout: ${ctx.bhelStockDays}
- Repeat customer rate: ${ctx.repeatRate}%

Question: ${PRESET_QS.find((q) => q.key === key)?.label ?? key}`;
    const answer = await callMentor(MENTOR_SYSTEM, userMsg, HARDCODED_ANSWERS[key]);
    setAiAnswers((prev) => ({ ...prev, [key]: answer }));
    setLoadingQ(null);
  };

  return (
    <div className="min-h-screen md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-5" style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Tera Mentor Bol Raha Hai 🧠</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
              Progress vs your past self · No leaderboard pressure
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* You vs Last Week */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} style={{ color: "#FF6900" }} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45" }}>
                You vs Last Week
              </p>
            </div>
            <p className="text-[11px] italic" style={{ color: "#9C8870" }}>
              "Leaderboards make 90% of sellers quit. We track YOU vs YOU." — MadSquad research
            </p>
          </div>
          <div className="grid grid-cols-2" style={{ borderTop: "1px solid #F0E6D8" }}>
            <div className="p-4" style={{ borderRight: "1px solid #F0E6D8" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#9C8870" }}>
                Units this week
              </p>
              <p className="text-3xl font-black" style={{ color: "#1A1200" }}>{thisWeekUnits}</p>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: unitsTrend >= 0 ? "#dcfce7" : "#fee2e2",
                    color: unitsTrend >= 0 ? "#15803d" : "#D62828",
                  }}
                >
                  {unitsTrend >= 0 ? "+" : ""}{unitsTrend}%
                </span>
                <span className="text-[10px]" style={{ color: "#9C8870" }}>
                  vs last wk ({lastWeekUnits})
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#9C8870" }}>
                Revenue this week
              </p>
              <p className="text-3xl font-black" style={{ color: "#1A1200" }}>₹{thisWeekValue}</p>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: valueTrend >= 0 ? "#dcfce7" : "#fee2e2",
                    color: valueTrend >= 0 ? "#15803d" : "#D62828",
                  }}
                >
                  {valueTrend >= 0 ? "+" : ""}{valueTrend}%
                </span>
                <span className="text-[10px]" style={{ color: "#9C8870" }}>
                  vs last wk (₹{lastWeekValue})
                </span>
              </div>
            </div>
          </div>
          {personalBest && (
            <div className="px-4 py-3" style={{ borderTop: "1px solid #F0E6D8", background: "#FFF3E6" }}>
              <p className="text-xs" style={{ color: "#6B5B45" }}>
                🏆 Your best day:{" "}
                <strong>{personalBest.units} units</strong>{" "}
                ({DAY_LABELS[personalBest.date.getDay()]}). Beat it!
              </p>
            </div>
          )}
        </div>

        {/* Top Insights */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>
            Your Top Insights
          </p>
          <div className="space-y-3">
            {tips.map((tip) => (
              <div
                key={tip.type}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                style={{ border: "1px solid #F0E6D8", borderLeft: `3px solid ${tipBorderColor(tip.priority)}` }}
              >
                <button
                  className="w-full flex items-start gap-3 p-4 text-left"
                  onClick={() => setExpanded(expanded === tip.type ? null : tip.type)}
                >
                  <span className="text-2xl mt-0.5">{tip.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#1A1200" }}>{tip.title}</p>
                    {expanded !== tip.type && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#6B5B45" }}>{tip.body}</p>
                    )}
                  </div>
                  {expanded === tip.type
                    ? <ChevronUp size={16} className="shrink-0 mt-1" style={{ color: "#9C8870" }} />
                    : <ChevronDown size={16} className="shrink-0 mt-1" style={{ color: "#9C8870" }} />
                  }
                </button>
                {expanded === tip.type && (
                  <div className="px-4 pb-4" style={{ borderTop: "1px solid #F0E6D8" }}>
                    <p className="text-sm leading-relaxed mt-3" style={{ color: "#1A1200" }}>{tip.body}</p>
                    <div className="mt-3 rounded-xl px-3 py-2" style={{ background: "#FFF3E6" }}>
                      <p className="text-xs font-bold" style={{ color: "#FF6900" }}>Action: {tip.action}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ask Your Mentor */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={15} style={{ color: "#FF6900" }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>
              Ask Your Mentor
            </p>
          </div>
          <div className="space-y-2">
            {PRESET_QS.map((q) => {
              const isActive = activeQ === q.key;
              return (
                <div
                  key={q.key}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  style={{ border: "1px solid #F0E6D8" }}
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => handleQ(q.key)}
                  >
                    <p
                      className="text-sm font-medium rounded-full px-3 py-1 transition-colors"
                      style={{
                        color: isActive ? "white" : "#FF6900",
                        background: isActive ? "#FF6900" : "transparent",
                        border: "1px solid #FF6900",
                      }}
                    >
                      {q.label}
                    </p>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-2"
                      style={{
                        background: isActive ? "#FF6900" : "#F0E6D8",
                        color: isActive ? "white" : "#6B5B45",
                      }}
                    >
                      {isActive ? "−" : "+"}
                    </div>
                  </button>
                  {isActive && (
                    <div className="px-4 pb-4" style={{ borderTop: "1px solid #F0E6D8" }}>
                      <div className="flex items-center gap-2 mt-3 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                          <Brain size={12} className="text-white" />
                        </div>
                        <p className="text-xs font-bold text-purple-600">Mentor says</p>
                      </div>
                      {loadingQ === q.key ? (
                        <div className="flex items-center gap-2 py-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full animate-bounce"
                                style={{ background: "#FF6900", animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: "#9C8870" }}>Thinking...</span>
                        </div>
                      ) : (
                        <div
                          className="rounded-xl p-3 border-l-4"
                          style={{ background: "#FFF8F0", borderLeftColor: "#7C3AED" }}
                        >
                          <p className="text-sm leading-relaxed" style={{ color: "#1A1200" }}>
                            {aiAnswers[q.key] ?? HARDCODED_ANSWERS[q.key]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "#FFF3E6", border: "1px solid #F0E6D8" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#FF6900" }}>💡 How your Mentor works</p>
          <p className="text-xs leading-relaxed" style={{ color: "#6B5B45" }}>
            The more complete data you log (channel, area, age, photo proof), the smarter your tips get.
            More info you share = smarter your missions = more you earn.
          </p>
          <p className="text-xs mt-2" style={{ color: "#9C8870" }}>
            Leaderboard rankings are in <strong>Rewards → Rankings</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
