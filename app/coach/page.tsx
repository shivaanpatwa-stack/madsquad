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

const COACH_SYSTEM = `You are the MadSquad AI Coach, a smart business advisor for local MadMix snack distributors in India. You give short, specific, actionable advice based on the seller's actual sales data. You never give generic advice. Always name specific products, channels, and areas. Keep answers under 80 words. Be direct and warm. Use simple English with one Hinglish phrase maximum.`;

export default function CoachPage() {
  const { tips } = runCoach("seller-01");
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [loadingQ, setLoadingQ] = useState<string | null>(null);

  const handleQ = async (key: string) => {
    if (activeQ === key) { setActiveQ(null); return; }
    setActiveQ(key);
    if (aiAnswers[key]) return; // already fetched

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
    <div className="min-h-screen bg-[#FAFAF8] md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="px-5 pt-10 pb-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Your AI Coach</h1>
            <p className="text-xs text-gray-400">Rules-based insights + AI answers · Built on real sales data</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Top Insights */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Top Insights</p>
          <div className="space-y-3">
            {tips.map((tip) => (
              <div key={tip.type} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  className="w-full flex items-start gap-3 p-4 text-left"
                  onClick={() => setExpanded(expanded === tip.type ? null : tip.type)}
                >
                  <span className="text-2xl mt-0.5">{tip.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{tip.title}</p>
                    {expanded !== tip.type && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tip.body}</p>
                    )}
                  </div>
                  {expanded === tip.type ? (
                    <ChevronUp size={16} className="text-gray-400 mt-1 shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400 mt-1 shrink-0" />
                  )}
                </button>
                {expanded === tip.type && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">{tip.body}</p>
                    <div className="mt-3 bg-orange-50 rounded-xl px-3 py-2">
                      <p className="text-xs font-bold text-orange-600">Action: {tip.action}</p>
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
            <MessageCircle size={15} className="text-purple-600" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ask the Coach</p>
          </div>
          <div className="space-y-2">
            {PRESET_QS.map((q) => (
              <div key={q.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => handleQ(q.key)}
                >
                  <p className="text-sm font-medium text-gray-800">{q.label}</p>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors
                    ${activeQ === q.key ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {activeQ === q.key ? "−" : "+"}
                  </div>
                </button>

                {activeQ === q.key && (
                  <div className="px-4 pb-4 border-t border-gray-50">
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
                              className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">Thinking...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {aiAnswers[q.key] ?? HARDCODED_ANSWERS[q.key]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-xs font-bold text-purple-700 mb-1">💡 How the Coach works</p>
          <p className="text-xs text-purple-600 leading-relaxed">
            The more complete data you log (channel, area, age, photo proof), the smarter and more specific your tips get. More info = more rewards, and a better coach.
          </p>
        </div>
      </div>
    </div>
  );
}
