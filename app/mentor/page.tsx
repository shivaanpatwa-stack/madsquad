"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "@/store/AppContext";
import { callMentor } from "@/lib/mentor";
import { Brain, Send, MessageCircle, TrendingUp, Package, MapPin, Zap, Sparkles } from "lucide-react";

const TODAY = new Date("2026-06-27");

type Msg = { role: "user" | "ai"; text: string };

const SYSTEM = (name: string, area: string, topSku: string, channel: string) =>
  `You are the MadSquad AI Mentor for an Indian snack partner named ${name} selling MadMix snacks in ${area}. Answer any question they have about growing their selling business: sales tactics, which product to push, timing, customer handling, restocking, territory, pricing conversations, etc. Use their real data — top SKU: ${topSku}, fastest channel: ${channel}, territory: ${area}. Be specific, practical, warm, and encouraging. Frame progress against their own past performance, never compare them to other sellers. Keep answers under 100 words. Simple English with at most one Hinglish phrase. Never mention failure, quitting, or discouraging statistics.`;

const PRESET_QS = [
  { label: "What should I sell tomorrow?",  icon: MapPin     },
  { label: "Best time to hit gyms?",        icon: Zap        },
  { label: "Should I restock now?",         icon: Package    },
  { label: "How do I get repeat buyers?",   icon: TrendingUp },
];

const FALLBACKS: Record<string, string> = {
  "What should I sell tomorrow?":
    "Hit Andheri gyms between 7–9 AM with Flamin' Fun Puffs Mini. That time slot is your best window — people are energised and ₹10 is an easy impulse buy. Kal subah niklo!",
  "Best time to hit gyms?":
    "7–9 AM before the morning workout, and 6–8 PM after evening sessions. Pre-workout crowd buys on the way in; post-workout crowd buys as a treat. Both work — just have stock ready.",
  "Should I restock now?":
    "You have 41 packs of Flamin' Fun Puffs left. At your current pace, that's about 5–6 more selling days. Request a restock now so it arrives before you run out. Better early than late.",
  "How do I get repeat buyers?":
    "Remember names. A simple 'Aaj bhi lo?' when you see a familiar face converts well. People love being remembered. Your repeat buyers are already proof — build on them.",
};

const GENERIC_FALLBACK = [
  "Gym mornings (7–9 AM) are your strongest window right now. Flamin' Fun Puffs Mini at ₹10 is your hero SKU — lead with it. Aaj niklo!",
  "Your Andheri territory has low seller density — you're first-mover here. Stay consistent and the patch is yours.",
  "Repeat buyers are gold. Two more returning customers this week would push you toward your next milestone.",
];

let fallbackIdx = 0;

function InsightCard({ emoji, title, body, tag, accent = "#FF6900" }: {
  emoji: string; title: string; body: string; tag?: string; accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: `${accent}12` }}>
          {emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-bold text-sm" style={{ color: "#1A1200" }}>{title}</p>
            {tag && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${accent}18`, color: accent }}>{tag}</span>
            )}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#6B5B45" }}>{body}</p>
        </div>
      </div>
    </div>
  );
}

export default function MentorPage() {
  const { state } = useApp();
  const { seller } = state;

  const arjunSales = useMemo(
    () => state.sales.filter((s) => s.sellerId === state.seller.id),
    [state.sales, state.seller.id]
  );

  const totalUnits = arjunSales.reduce((s, r) => s + r.units, 0);
  const todayUnits = arjunSales
    .filter((s) => new Date(s.timestamp).toDateString() === TODAY.toDateString())
    .reduce((s, r) => s + r.units, 0);

  const skuMap: Record<string, number> = {};
  const chMap: Record<string, number> = {};
  arjunSales.forEach((s) => {
    skuMap[s.skuId] = (skuMap[s.skuId] ?? 0) + s.units;
    chMap[s.channel] = (chMap[s.channel] ?? 0) + s.units;
  });
  const topSkuName = (Object.entries(skuMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "sku-01") === "sku-01"
    ? "Flamin' Fun Mini"
    : "Mighty Masala Mini";
  const fastestChannel = Object.entries(chMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Gym";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = async (question: string) => {
    if (loading) return;
    const q = question.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    const fallback = FALLBACKS[q] ?? GENERIC_FALLBACK[fallbackIdx++ % GENERIC_FALLBACK.length];
    const answer = await callMentor(
      SYSTEM(seller.name, seller.area, topSkuName, fastestChannel),
      `Seller: ${seller.name}, Area: ${seller.area}, Total packs: ${totalUnits}, Today: ${todayUnits}, Top SKU: ${topSkuName}, Channel: ${fastestChannel}\n\nQuestion: ${q}`,
      fallback
    );
    setMessages((m) => [...m, { role: "ai", text: answer }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* ── Dark purple header ── */}
      <div className="px-5 pt-12 pb-6" style={{ background: "#1A0035" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.35)" }}>
            <Brain size={22} style={{ color: "#A78BFA" }} />
          </div>
          <div>
            <h1 className="text-white font-black text-xl" style={{ letterSpacing: "-0.01em" }}>AI Mentor</h1>
            <p className="text-xs" style={{ color: "rgba(167,139,250,0.7)" }}>Your business advisor, available 24/7</p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.3)", color: "#A78BFA" }}>
              ● Powered by AI
            </span>
          </div>
        </div>

        {/* Quick data strip */}
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[
            { label: "Top SKU", value: topSkuName },
            { label: "Best Channel", value: fastestChannel },
            { label: "Total Sold", value: `${totalUnits} packs` },
          ].map(({ label, value }) => (
            <div key={label} className="shrink-0 rounded-xl px-3 py-2" style={{ background: "rgba(124,58,237,0.2)" }}>
              <p className="text-[10px]" style={{ color: "rgba(167,139,250,0.6)" }}>{label}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: "white" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 max-w-5xl mx-auto space-y-4">

        {/* ── Insights grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <InsightCard
            emoji="🔥"
            title="Your strongest SKU"
            body={`${topSkuName} is moving fastest at ${fastestChannel}. Keep stocking it as your lead product.`}
            tag="Top Seller"
            accent="#FF6900"
          />
          <InsightCard
            emoji="📍"
            title="Your channel edge"
            body={`${fastestChannel} is where your sales are clicking. Double down there before expanding.`}
            accent="#7C3AED"
          />
          <InsightCard
            emoji="⏰"
            title="Best timing"
            body="Gym crowd peaks 7–9 AM and 6–8 PM. Morning is your sweet spot for Andheri."
            accent="#0EA5E9"
          />
          <InsightCard
            emoji="🎯"
            title="Next move"
            body={`${totalUnits} packs sold so far. ${Math.max(0, 10 - totalUnits)} more to First Win. Add a college visit this week for a second channel.`}
            accent="#16A34A"
          />
        </div>

        {/* ── Chat panel ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #F0E6D8" }}>

          {/* Chat header */}
          <div className="px-4 py-3 border-b flex items-center gap-2.5" style={{ borderColor: "#F0E6D8", background: "#FFF8F0" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
              <Sparkles size={14} style={{ color: "#7C3AED" }} />
            </div>
            <p className="font-bold text-sm" style={{ color: "#1A1200" }}>Ask your Mentor anything</p>
          </div>

          {/* Preset chips */}
          <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
            {PRESET_QS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => ask(label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border active:scale-95 transition-all"
                style={{ borderColor: "#E0D6F5", color: "#7C3AED", background: "#F5F3FF" }}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="px-4 py-2 space-y-3 min-h-[140px] max-h-80 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                  <Brain size={20} style={{ color: "#7C3AED" }} />
                </div>
                <p className="text-xs text-center" style={{ color: "#9C8870" }}>
                  Tap a question above or type your own below
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "ai" && (
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                    style={{ background: "#EDE9FE" }}>
                    <Brain size={12} style={{ color: "#7C3AED" }} />
                  </div>
                )}
                <div
                  className="max-w-[78%] px-4 py-3 text-sm leading-relaxed"
                  style={
                    m.role === "user"
                      ? { background: "#7C3AED", color: "white", borderRadius: "18px 18px 4px 18px" }
                      : { background: "#FFF8F0", color: "#1A1200", border: "1px solid #F0E6D8", borderRadius: "18px 18px 18px 4px" }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                  style={{ background: "#EDE9FE" }}>
                  <Brain size={12} style={{ color: "#7C3AED" }} />
                </div>
                <div className="px-4 py-3.5 flex gap-1.5 rounded-[18px]" style={{ background: "#FFF8F0", border: "1px solid #F0E6D8" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#7C3AED", animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Free-text input */}
          <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: "#F0E6D8" }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask(input)}
                placeholder="Ask your mentor anything..."
                className="flex-1 px-4 py-3 rounded-xl text-sm border outline-none"
                style={{ borderColor: "#E0D6F5", color: "#1A1200", background: "#F5F3FF" }}
              />
              <button
                onClick={() => ask(input)}
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-all"
                style={{ background: "#7C3AED" }}
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
