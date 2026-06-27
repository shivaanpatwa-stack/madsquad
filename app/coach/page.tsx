"use client";
import { useState } from "react";
import { runCoach, HARDCODED_ANSWERS } from "@/lib/coach";
import { callClaude } from "@/lib/claude";
import { SNAPSHOT } from "@/lib/snapshot";
import { Brain, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

const PRESET_QS = [
  { key: "why_falling",  label: "Why are my sales falling?"  },
  { key: "what_restock", label: "What should I restock?"     },
  { key: "where_next",   label: "Where should I sell next?"  },
  { key: "best_product", label: "What's my best product?"    },
];

const COACH_SYSTEM = `You are the MadSquad AI Coach, a smart business advisor for local MadMix snack partners in India. You give short, specific, actionable advice based on the seller's actual sales data. You never give generic advice. Always name specific products, channels, and areas. Keep answers under 80 words. Be direct and warm. Use simple English with one Hinglish phrase maximum.`;

function tipBorderColor(priority: number): string {
  if (priority === 0) return "#D62828";
  if (priority === 1) return "#FF6900";
  return "#FFB800";
}

export default function CoachPage() {
  const { tips } = runCoach("seller-01");
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [loadingQ, setLoadingQ] = useState<string | null>(null);

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

    const answer = await callClaude(COACH_SYSTEM, userMsg, HARDCODED_ANSWERS[key]);
    setAiAnswers((prev) => ({ ...prev, [key]: answer }));
    setLoadingQ(null);
  };

  return (
    <div className="min-h-screen md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
      {/* Header — orange-to-yellow gradient */}
      <div
        className="px-5 pt-10 pb-5"
        style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Tera Coach Bol Raha Hai 🧠</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
              <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.65)" }}>Rules-based engine</em>
              {" "}· Built on your real sales data
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
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
                style={{
                  border: "1px solid #F0E6D8",
                  borderLeft: `3px solid ${tipBorderColor(tip.priority)}`,
                }}
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

        {/* Ask the Coach */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={15} style={{ color: "#FF6900" }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B5B45", letterSpacing: "0.06em" }}>
              Ask the Coach
            </p>
          </div>
          <div className="space-y-2">
            {PRESET_QS.map((q) => {
              const isActive = activeQ === q.key;
              return (
                <div key={q.key} className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #F0E6D8" }}>
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => handleQ(q.key)}
                  >
                    <p
                      className="text-sm font-medium rounded-full px-3 py-1 transition-colors"
                      style={{
                        color: isActive ? "white" : "#FF6900",
                        background: isActive ? "#FF6900" : "transparent",
                        border: `1px solid ${isActive ? "#FF6900" : "#FF6900"}`,
                      }}
                    >
                      {q.label}
                    </p>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ml-2"
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
                        <p className="text-xs font-bold text-purple-600">Coach says</p>
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
          <p className="text-xs font-bold mb-1" style={{ color: "#FF6900" }}>💡 How the Coach works</p>
          <p className="text-xs leading-relaxed" style={{ color: "#6B5B45" }}>
            The more complete data you log (channel, area, age, photo proof), the smarter and more specific your tips get. More info = more rewards, and a better coach.
          </p>
        </div>
      </div>
    </div>
  );
}
