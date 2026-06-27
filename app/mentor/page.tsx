"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "@/store/AppContext";
import { callMentor } from "@/lib/mentor";
import { Brain, Send, MessageCircle, TrendingUp, Package, MapPin, Zap } from "lucide-react";

const TODAY = new Date("2026-06-27");

type Msg = { role: "user" | "ai"; text: string };

const SYSTEM = (name: string, area: string, topSku: string, channel: string) =>
  `You are the MadSquad AI Mentor for an Indian snack distributor named ${name} selling MadMix snacks in ${area}. Answer any question they have about growing their selling business: sales tactics, which product to push, timing, customer handling, restocking, territory, pricing conversations, etc. Use their real data — top SKU: ${topSku}, fastest channel: ${channel}, territory: ${area}. Be specific, practical, warm, and encouraging. Frame progress against their own past performance, never compare them to other sellers. Keep answers under 100 words. Simple English with at most one Hinglish phrase. Never mention failure, quitting, or discouraging statistics.`;

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

function InsightCard({ emoji, title, body, tag }: { emoji: string; title: string; body: string; tag?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: "#1A1200" }}>{title}</p>
            {tag && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#FFF3E6", color: "#FF6900" }}>{tag}</span>
            )}
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B5B45" }}>{body}</p>
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
      <div className="px-5 pt-8 pb-5" style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">AI Mentor</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>Your business advisor from day one</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-5xl mx-auto space-y-4">
        {/* Insights 2-col on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <InsightCard
            emoji="🔥"
            title="Your strongest SKU"
            body={`${topSkuName} is moving fastest at ${fastestChannel}. Keep stocking it as your lead product.`}
            tag="Top Seller"
          />
          <InsightCard
            emoji="📍"
            title="Your channel edge"
            body={`${fastestChannel} is where your sales are clicking. Double down there before expanding.`}
          />
          <InsightCard
            emoji="⏰"
            title="Best timing"
            body="Gym crowd peaks 7–9 AM and 6–8 PM. Morning is your sweet spot for Andheri."
          />
          <InsightCard
            emoji="🎯"
            title="Next move"
            body={`${totalUnits} packs sold so far. ${Math.max(0, 10 - totalUnits)} more to First Win. Add a college visit this week for a second channel.`}
          />
        </div>

        {/* Chat panel */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #F0E6D8" }}>
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "#F0E6D8", background: "#FFF8F0" }}>
            <MessageCircle size={16} style={{ color: "#FF6900" }} />
            <p className="font-bold text-sm" style={{ color: "#1A1200" }}>Ask your Mentor anything</p>
          </div>

          {/* Preset chips */}
          <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
            {PRESET_QS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => ask(label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border active:scale-95 transition-all"
                style={{ borderColor: "#F0E6D8", color: "#6B5B45", background: "#FFF8F0" }}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="px-4 py-2 space-y-3 min-h-[120px] max-h-72 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: "#9C8870" }}>
                Tap a question above or type your own below
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[82%] px-4 py-3 text-sm leading-relaxed"
                  style={
                    m.role === "user"
                      ? { background: "#FF6900", color: "white", borderRadius: "18px 18px 4px 18px" }
                      : { background: "#FFF8F0", color: "#1A1200", border: "1px solid #F0E6D8", borderRadius: "18px 18px 18px 4px" }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 flex gap-1" style={{ background: "#FFF8F0", border: "1px solid #F0E6D8", borderRadius: "18px 18px 18px 4px" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none"
                style={{ borderColor: "#F0E6D8", color: "#1A1200", background: "#FFF8F0" }}
              />
              <button
                onClick={() => ask(input)}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-all"
                style={{ background: "#FF6900" }}
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
