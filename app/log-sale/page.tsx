"use client";
import { useState, useRef } from "react";
import { useApp } from "@/store/AppContext";
import { SKUS } from "@/lib/skus";
import { CHANNELS, AREAS, AGE_BANDS, type Channel, type AgeBand } from "@/lib/sellers";
import { calcPointsForSale } from "@/lib/points";
import { type SaleRecord } from "@/lib/sales";
import { Camera, CheckCircle, Zap, ChevronLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import TierBadge from "@/components/ui/TierBadge";

type Step = "sku" | "details" | "photo" | "success";

export default function LogSalePage() {
  const { state, logSale } = useApp();
  const [step, setStep] = useState<Step>("sku");
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [units, setUnits] = useState(1);
  const [channel, setChannel] = useState<Channel | "">("");
  const [area, setArea] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand | "">("");
  const [repeatCustomer, setRepeatCustomer] = useState<boolean | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showPop, setShowPop] = useState(false);
  const [feedbackTag, setFeedbackTag] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionDone, setReflectionDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sku = SKUS.find((s) => s.id === selectedSku);

  const handleSubmit = () => {
    if (!selectedSku || !channel || !area) return;
    const sale: SaleRecord = {
      id: `sale-new-${Date.now()}`,
      sellerId: "seller-01",
      skuId: selectedSku,
      units,
      channel: channel as Channel,
      area,
      pincode: AREAS.find((a) => a.name === area)?.pincode ?? "",
      ageBand: (ageBand || "26-40") as AgeBand,
      repeatCustomer: repeatCustomer ?? false,
      photoProof: hasPhoto,
      timestamp: new Date(),
      value: units * (sku?.price ?? 10),
    };
    const pts = calcPointsForSale(sale);
    setPointsEarned(pts);
    logSale(sale);
    setStep("success");
    setShowPop(true);
    setTimeout(() => setShowPop(false), 1600);
  };

  const FEEDBACK_TAGS = [
    { key: "loved-it",       emoji: "🔥", label: "Loved it"            },
    { key: "too-spicy",      emoji: "😅", label: "Too spicy"           },
    { key: "wants-bigger",   emoji: "📦", label: "Wants bigger pack"   },
    { key: "new-flavour",    emoji: "🌶️", label: "Asked new flavour"   },
  ];

  const reset = () => {
    setStep("sku");
    setSelectedSku("");
    setUnits(1);
    setChannel("");
    setArea("");
    setAgeBand("");
    setRepeatCustomer(null);
    setHasPhoto(false);
    setFeedbackTag(null);
    setReflectionText("");
    setReflectionDone(false);
  };

  return (
    <div className="min-h-screen md:max-w-2xl md:mx-auto" style={{ background: "#FFF8F0" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4 bg-white"
        style={{ borderBottom: "1px solid #F0E6D8" }}
      >
        {step !== "sku" && step !== "success" && (
          <button onClick={() => setStep(step === "photo" ? "details" : "sku")} className="p-1">
            <ChevronLeft size={22} style={{ color: "#1A1200" }} />
          </button>
        )}
        <h1 className="text-lg font-extrabold" style={{ color: "#1A1200" }}>Log a Sale</h1>
        {step !== "success" && (
          <div className="ml-auto flex gap-1">
            {(["sku", "details", "photo"] as Step[]).map((s, i) => (
              <div
                key={s}
                className="h-1.5 w-6 rounded-full transition-colors"
                style={{
                  background: step === s ? "#FF6900" : i < ["sku","details","photo"].indexOf(step) ? "#FFB800" : "#F0E6D8",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* STEP 1 — Pick SKU */}
      {step === "sku" && (
        <div className="px-4 py-4">
          <p className="text-sm mb-3" style={{ color: "#6B5B45" }}>Which MadMix product did you sell?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SKUS.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedSku(s.id); setStep("details"); }}
                className="flex flex-col items-start p-3 rounded-2xl border-2 text-left transition-all bg-white"
                style={{
                  borderColor: selectedSku === s.id ? "#FF6900" : "#F0E6D8",
                  background: selectedSku === s.id ? "#FFF3E6" : "white",
                }}
              >
                <span className={`text-2xl mb-2 w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  {s.emoji}
                </span>
                <p className="text-xs font-semibold leading-tight" style={{ color: "#1A1200" }}>{s.shortName}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#9C8870" }}>{s.line} · ₹{s.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Details */}
      {step === "details" && sku && (
        <div className="px-4 py-4 space-y-5">
          <div className={`flex items-center gap-3 p-3 rounded-2xl ${sku.color}/10`}>
            <span className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center ${sku.color}`}>{sku.emoji}</span>
            <div>
              <p className="font-bold" style={{ color: "#1A1200" }}>{sku.shortName}</p>
              <p className="text-xs" style={{ color: "#6B5B45" }}>₹{sku.price} per pack</p>
            </div>
          </div>

          {/* Units */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A1200" }}>Units sold</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUnits(Math.max(1, units - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold active:scale-95"
                style={{ background: "#F0E6D8", color: "#1A1200" }}
              >−</button>
              <span className="text-2xl font-bold w-12 text-center" style={{ color: "#1A1200" }}>{units}</span>
              <button
                onClick={() => setUnits(units + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold text-white active:scale-95"
                style={{ background: "#FF6900" }}
              >+</button>
              <span className="text-sm ml-2" style={{ color: "#6B5B45" }}>= ₹{units * sku.price}</span>
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A1200" }}>Where did you sell?</label>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className="py-2 px-3 rounded-xl text-xs font-medium border transition-all"
                  style={{
                    background: channel === ch ? "#FF6900" : "white",
                    color: channel === ch ? "white" : "#1A1200",
                    borderColor: channel === ch ? "#FF6900" : "#F0E6D8",
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A1200" }}>Area</label>
            <div className="grid grid-cols-2 gap-2">
              {AREAS.map((a) => (
                <button
                  key={a.name}
                  onClick={() => setArea(a.name)}
                  className="py-2 px-3 rounded-xl text-xs font-medium border transition-all"
                  style={{
                    background: area === a.name ? "#FF6900" : "white",
                    color: area === a.name ? "white" : "#1A1200",
                    borderColor: area === a.name ? "#FF6900" : "#F0E6D8",
                  }}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* Age band */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#1A1200" }}>
              Customer age <span style={{ color: "#9C8870", fontWeight: "normal" }}>(+5 bonus pts)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {AGE_BANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setAgeBand(b)}
                  className="py-1.5 px-3 rounded-full text-xs font-medium border transition-all"
                  style={{
                    background: ageBand === b ? "#7C3AED" : "white",
                    color: ageBand === b ? "white" : "#6B5B45",
                    borderColor: ageBand === b ? "#7C3AED" : "#F0E6D8",
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A1200" }}>Repeat customer?</label>
            <div className="flex gap-3">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  onClick={() => setRepeatCustomer(v)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    background: repeatCustomer === v ? "#22c55e" : "white",
                    color: repeatCustomer === v ? "white" : "#6B5B45",
                    borderColor: repeatCustomer === v ? "#22c55e" : "#F0E6D8",
                  }}
                >
                  {v ? "Yes ✅" : "No"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("photo")}
            disabled={!channel || !area}
            className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40 active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
          >
            Next — Add Photo Proof
          </button>
        </div>
      )}

      {/* STEP 3 — Photo */}
      {step === "photo" && (
        <div className="px-4 py-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-4xl mb-2">📸</p>
            <h2 className="text-lg font-extrabold" style={{ color: "#1A1200" }}>Photo Proof</h2>
            <p className="text-sm mt-1" style={{ color: "#6B5B45" }}>Take a photo of your sale or display. Required for verified points.</p>
          </div>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={() => setHasPhoto(true)} />

          {hasPhoto ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <p className="text-green-600 font-semibold">Photo added!</p>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-3 w-full py-8 border-2 border-dashed rounded-2xl bg-white"
              style={{ borderColor: "#F0E6D8" }}
            >
              <Camera size={36} style={{ color: "#9C8870" }} />
              <p className="text-sm font-medium" style={{ color: "#6B5B45" }}>Tap to take / upload photo</p>
            </button>
          )}

          {!hasPhoto && (
            <button onClick={() => setHasPhoto(true)} className="text-xs underline" style={{ color: "#9C8870" }}>
              Use placeholder (demo mode)
            </button>
          )}

          <div className="w-full space-y-3">
            <button
              onClick={handleSubmit}
              disabled={!hasPhoto}
              className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40 active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
            >
              Submit Sale
            </button>
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-2xl font-medium text-sm"
              style={{ background: "#F0E6D8", color: "#6B5B45" }}
            >
              Skip photo (unverified, 0 pts)
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Success */}
      {step === "success" && (
        <div className="px-4 py-10 flex flex-col items-center gap-6 text-center relative">
          {showPop && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none animate-points-pop z-10">
              <div className="font-black text-2xl px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2"
                style={{ background: "#FFB800", color: "#1A1200" }}>
                <Zap size={24} fill="currentColor" />
                +{pointsEarned} pts!
              </div>
            </div>
          )}

          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-2xl font-black" style={{ color: "#1A1200" }}>Zabardast! 🔥</h2>
            <p className="mt-1" style={{ color: "#6B5B45" }}>Points earned! Sale logged.</p>
          </div>

          <div className="rounded-2xl px-8 py-5 w-full" style={{ background: "#FFF3E6", border: "1px solid #F0E6D8" }}>
            <p className="text-4xl font-black" style={{ color: "#FFB800" }}>+{pointsEarned} pts</p>
            <p className="text-sm mt-1" style={{ color: "#6B5B45" }}>New balance: {state.points.toLocaleString("en-IN")} pts</p>
            <div className="mt-2">
              <TierBadge tier={state.seller.tier} size="md" />
            </div>
          </div>

          {pointsEarned > 0 && (
            <div className="rounded-2xl p-4 w-full text-left" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
              <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-1">Mentor Quick-Tip</p>
              <p className="text-sm text-green-800">
                {sku?.line === "Puffs" && channel === "Gym"
                  ? "Nice hustle! Your spicy packs fly at gyms. Keep that gym channel stocked."
                  : "Good one. Log more with photo proof to unlock better mentor insights."}
              </p>
            </div>
          )}

          {/* Customer feedback quick-tags (+5 pts) */}
          <div className="w-full rounded-2xl p-4" style={{ background: "#FFF8F0", border: "1px solid #F0E6D8" }}>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} style={{ color: "#FF6900" }} />
              <p className="text-xs font-bold" style={{ color: "#1A1200" }}>
                How did it go?{" "}
                <span style={{ color: "#9C8870", fontWeight: "normal" }}>
                  {feedbackTag ? "(+5 pts earned!)" : "(+5 pts)"}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FEEDBACK_TAGS.map((tag) => (
                <button
                  key={tag.key}
                  onClick={() => setFeedbackTag(tag.key)}
                  className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl font-medium text-left transition-all active:scale-95"
                  style={{
                    background: feedbackTag === tag.key ? "#FF6900" : "white",
                    color: feedbackTag === tag.key ? "white" : "#1A1200",
                    border: `1px solid ${feedbackTag === tag.key ? "#FF6900" : "#F0E6D8"}`,
                  }}
                >
                  <span>{tag.emoji}</span> {tag.label}
                </button>
              ))}
            </div>
            {feedbackTag && (
              <p className="text-xs mt-2 text-center" style={{ color: "#22c55e", fontWeight: 600 }}>
                ✓ Feedback recorded — +5 pts added
              </p>
            )}
          </div>

          {/* Daily reflection (+10 pts) */}
          {!reflectionDone ? (
            <div className="w-full rounded-2xl p-4" style={{ background: "#FFF8F0", border: "1px solid #F0E6D8" }}>
              <p className="text-xs font-bold mb-2" style={{ color: "#1A1200" }}>
                What sold best today and why?{" "}
                <span style={{ color: "#9C8870", fontWeight: "normal" }}>(optional +10 pts)</span>
              </p>
              <textarea
                className="w-full text-sm rounded-xl px-3 py-2 resize-none outline-none"
                style={{ background: "white", border: "1px solid #F0E6D8", color: "#1A1200", minHeight: 72 }}
                placeholder="E.g. Gym guys loved the spicy puffs after workout..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setReflectionDone(true)}
                  className="text-xs px-3 py-1.5 rounded-xl"
                  style={{ background: "#F0E6D8", color: "#6B5B45" }}
                >
                  Skip
                </button>
                {reflectionText.trim().length > 0 && (
                  <button
                    onClick={() => setReflectionDone(true)}
                    className="flex-1 text-xs py-1.5 rounded-xl font-bold text-white"
                    style={{ background: "#FF6900" }}
                  >
                    Submit +10 pts 🎯
                  </button>
                )}
              </div>
            </div>
          ) : reflectionText.trim().length > 0 ? (
            <div className="w-full rounded-xl px-4 py-3" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
              <p className="text-xs text-green-700 font-bold">+10 pts! Reflection saved 🙏</p>
              <p className="text-xs text-green-700 mt-0.5">More info you share = smarter your missions = more you earn.</p>
            </div>
          ) : null}

          <div className="flex gap-3 w-full">
            <button
              onClick={reset}
              className="flex-1 py-3 rounded-2xl font-semibold"
              style={{ background: "#F0E6D8", color: "#1A1200" }}
            >
              Log Another
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-2xl font-semibold text-white text-center"
              style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)" }}
            >
              Back Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
