"use client";
import { useState, useRef, useEffect } from "react";
import { callMentor } from "@/lib/mentor";
import { useApp } from "@/store/AppContext";
import { X, Send, Brain } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

const SYSTEM = (name: string, area: string) => `You are the MadSquad AI Mentor for an Indian snack distributor named ${name} selling MadMix snacks in ${area}. Answer any question they have about growing their selling business: sales tactics, which product to push, timing, customer handling, restocking, territory, pricing conversations, etc. Be specific, practical, warm, and encouraging. Frame progress against their own past performance, never compare them to other sellers. Keep answers under 100 words. Simple English with at most one Hinglish phrase. Never mention failure, quitting, or discouraging statistics.`;

const FALLBACKS = [
  "Gym mornings (7–9 AM) are your best window — people are in the mood to treat themselves. Lead with Flamin' Fun Puffs Mini at ₹10. Aaj niklo!",
  "Your Andheri territory has low seller saturation — you have the patch mostly to yourself. Focus on consistency over the next 2 days.",
  "Repeat buyers are gold. If someone bought yesterday, say hi again today — they're already fans of MadMix.",
];

let fallbackIdx = 0;

export default function AskAIModal({ onClose }: { onClose: () => void }) {
  const { state } = useApp();
  const { seller } = state;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    const fallback = FALLBACKS[fallbackIdx++ % FALLBACKS.length];
    const answer = await callMentor(SYSTEM(seller.name, seller.area), q, fallback);
    setMessages((m) => [...m, { role: "ai", text: answer }]);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" style={{ background: "rgba(26,18,0,0.5)" }}>
      <div
        className="w-full lg:w-[480px] flex flex-col rounded-t-3xl lg:rounded-3xl overflow-hidden"
        style={{ background: "#FFF8F0", maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#F0E6D8" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FF6900" }}>
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#1A1200" }}>AI Mentor</p>
              <p className="text-[10px]" style={{ color: "#9C8870" }}>Ask anything about your business</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: "#9C8870" }}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 200 }}>
          {messages.length === 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-center" style={{ color: "#9C8870" }}>Try asking:</p>
              {["Where should I sell tomorrow?", "What's the best time to hit gyms?", "Should I restock Flamin' Fun?"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-left text-xs px-3 py-2 rounded-xl border font-medium"
                  style={{ borderColor: "#F0E6D8", color: "#1A1200", background: "white" }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={
                  m.role === "user"
                    ? { background: "#FF6900", color: "white", borderRadius: "18px 18px 4px 18px" }
                    : { background: "white", color: "#1A1200", border: "1px solid #F0E6D8", borderRadius: "18px 18px 18px 4px" }
                }
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-white border flex gap-1" style={{ borderColor: "#F0E6D8" }}>
                {[0,1,2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "#F0E6D8" }}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask your mentor anything..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none"
              style={{ borderColor: "#F0E6D8", background: "white", color: "#1A1200" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-95"
              style={{ background: "#FF6900" }}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
