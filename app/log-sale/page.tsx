"use client";
import { useState, useRef } from "react";
import { useApp } from "@/store/AppContext";
import { SKUS } from "@/lib/skus";
import { CHANNELS, AREAS, AGE_BANDS, type Channel, type AgeBand } from "@/lib/sellers";
import { calcPointsForSale } from "@/lib/points";
import { type SaleRecord } from "@/lib/sales";
import { Camera, CheckCircle, Zap, ChevronLeft } from "lucide-react";
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

  const reset = () => {
    setStep("sku");
    setSelectedSku("");
    setUnits(1);
    setChannel("");
    setArea("");
    setAgeBand("");
    setRepeatCustomer(null);
    setHasPhoto(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4 bg-white border-b border-gray-100">
        {step !== "sku" && step !== "success" && (
          <button onClick={() => setStep(step === "photo" ? "details" : "sku")} className="p-1">
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-900">Log a Sale</h1>
        {step !== "success" && (
          <div className="ml-auto flex gap-1">
            {(["sku", "details", "photo"] as Step[]).map((s, i) => (
              <div key={s} className={`h-1.5 w-6 rounded-full transition-colors ${
                step === s ? "bg-[#E63012]" : i < ["sku","details","photo"].indexOf(step) ? "bg-orange-300" : "bg-gray-200"
              }`} />
            ))}
          </div>
        )}
      </div>

      {/* STEP 1 — Pick SKU */}
      {step === "sku" && (
        <div className="px-4 py-4">
          <p className="text-sm text-gray-500 mb-3">Which MadMix product did you sell?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SKUS.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedSku(s.id); setStep("details"); }}
                className={`flex flex-col items-start p-3 rounded-2xl border-2 text-left transition-all
                  ${selectedSku === s.id ? "border-[#E63012] bg-orange-50" : "border-gray-100 bg-white"}`}
              >
                <span className={`text-2xl mb-2 w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  {s.emoji}
                </span>
                <p className="text-xs font-semibold text-gray-900 leading-tight">{s.shortName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.line} · ₹{s.price}</p>
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
              <p className="font-bold text-gray-900">{sku.shortName}</p>
              <p className="text-xs text-gray-500">₹{sku.price} per pack</p>
            </div>
          </div>

          {/* Units */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Units sold</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setUnits(Math.max(1, units - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold flex items-center justify-center active:bg-gray-200">−</button>
              <span className="text-2xl font-bold w-12 text-center">{units}</span>
              <button onClick={() => setUnits(units + 1)}
                className="w-10 h-10 rounded-full bg-[#E63012] text-white text-xl font-bold flex items-center justify-center active:bg-red-700">+</button>
              <span className="text-sm text-gray-500 ml-2">= ₹{units * sku.price}</span>
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Where did you sell?</label>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map((ch) => (
                <button key={ch} onClick={() => setChannel(ch)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all
                    ${channel === ch ? "bg-[#E63012] text-white border-[#E63012]" : "bg-white text-gray-700 border-gray-200"}`}>
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Area</label>
            <div className="grid grid-cols-2 gap-2">
              {AREAS.map((a) => (
                <button key={a.name} onClick={() => setArea(a.name)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all
                    ${area === a.name ? "bg-[#E63012] text-white border-[#E63012]" : "bg-white text-gray-700 border-gray-200"}`}>
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* Age band (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Customer age <span className="text-gray-400 font-normal">(+5 bonus pts)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {AGE_BANDS.map((b) => (
                <button key={b} onClick={() => setAgeBand(b)}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-all
                    ${ageBand === b ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Repeat customer?</label>
            <div className="flex gap-3">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => setRepeatCustomer(v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                    ${repeatCustomer === v ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-600 border-gray-200"}`}>
                  {v ? "Yes ✅" : "No"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("photo")}
            disabled={!channel || !area}
            className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40 active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #E63012, #F97316)" }}
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
            <h2 className="text-lg font-bold text-gray-900">Photo Proof</h2>
            <p className="text-sm text-gray-500 mt-1">Take a photo of your sale or display. Required for verified points.</p>
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
              className="flex flex-col items-center gap-3 w-full py-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white"
            >
              <Camera size={36} className="text-gray-400" />
              <p className="text-sm text-gray-500 font-medium">Tap to take / upload photo</p>
            </button>
          )}

          {!hasPhoto && (
            <button
              onClick={() => { setHasPhoto(true); }}
              className="text-xs text-gray-400 underline"
            >
              Use placeholder (demo mode)
            </button>
          )}

          <div className="w-full space-y-3">
            <button
              onClick={handleSubmit}
              disabled={!hasPhoto}
              className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40 active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, #E63012, #F97316)" }}
            >
              Submit Sale
            </button>
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-2xl font-medium text-gray-500 text-sm bg-gray-100"
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
              <div className="bg-yellow-400 text-yellow-900 font-black text-2xl px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2">
                <Zap size={24} fill="currentColor" />
                +{pointsEarned} pts!
              </div>
            </div>
          )}

          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Crazy Good!</h2>
            <p className="text-gray-500 mt-1">Sale logged. Points earned.</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-8 py-5 w-full">
            <p className="text-4xl font-black text-yellow-600">+{pointsEarned} pts</p>
            <p className="text-sm text-gray-500 mt-1">New balance: {state.points.toLocaleString("en-IN")} pts</p>
            <TierBadge tier={state.seller.tier} size="md" />
          </div>

          {pointsEarned > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 w-full text-left">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Coach Quick-Tip</p>
              <p className="text-sm text-gray-700">
                {sku?.line === "Puffs" && channel === "Gym"
                  ? "Nice hustle! Your spicy packs fly at gyms. Keep that gym channel stocked."
                  : "Good one. Log more with photo proof to unlock better coach insights."}
              </p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button onClick={reset} className="flex-1 py-3 rounded-2xl bg-gray-100 font-semibold text-gray-700">
              Log Another
            </button>
            <Link href="/" className="flex-1 py-3 rounded-2xl font-semibold text-white text-center"
              style={{ background: "linear-gradient(135deg, #E63012, #F97316)" }}>
              Back Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
