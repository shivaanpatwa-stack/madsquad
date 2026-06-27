"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Users, Shield, Zap, Star } from "lucide-react";

function JoinContent() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? null;
  const referrerName = ref ? ref.replace(/\d+$/, "") : null;

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)", padding: "72px 24px 48px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(0,0,0,0.2)" }}>
            <Shield size={13} color="white" />
            <span className="text-xs font-bold text-white">Shark Tank India Featured</span>
          </div>

          <h1 className="text-white font-black leading-tight" style={{ fontSize: 42, letterSpacing: "-0.02em" }}>
            Crazy<br />Good!
          </h1>
          <p className="text-white/80 text-lg mt-3 leading-relaxed">
            Healthy snacks that actually taste amazing.<br />
            Baked, not fried. ₹10 a pack.
          </p>

          {ref && (
            <div className="mt-6 px-5 py-3 rounded-2xl inline-block" style={{ background: "rgba(0,0,0,0.25)" }}>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Referred by</p>
              <p className="text-white font-black text-lg">{referrerName ?? ref}</p>
              <p className="text-white/60 text-xs mt-0.5">Code: <span className="font-bold">{ref}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Buy CTA */}
          <div className="rounded-3xl overflow-hidden" style={{ background: "white", border: "1.5px solid #F0E6D8", boxShadow: "0 4px 24px rgba(255,105,0,0.08)" }}>
            <div style={{ padding: "28px 24px" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#FFF3E6" }}>
                <ShoppingBag size={22} style={{ color: "#FF6900" }} />
              </div>
              <h2 className="font-black text-xl mb-2" style={{ color: "#1A1200" }}>
                Buy MadMix
              </h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#6B5B45" }}>
                Millet Puffs, Bhujia, Raisins — bold flavours, clean ingredients. Try a pack for ₹10.
                {ref && <><br /><span className="font-semibold" style={{ color: "#FF6900" }}>Use code {ref} for ₹10 off your first order.</span></>}
              </p>
              <div className="flex flex-col gap-2 text-xs mb-5" style={{ color: "#6B5B45" }}>
                {["Baked, not fried", "No artificial colours or flavours", "Dietician approved", "6-month shelf life"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "#FFF3E6" }}>
                      <Star size={9} style={{ color: "#FF6900" }} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <a
                href="https://madmixfoods.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-2xl font-black text-white text-base text-center active:scale-95 transition-transform"
                style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)", boxShadow: "0 6px 20px rgba(255,105,0,0.3)" }}
              >
                Order MadMix →
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "#F0E6D8" }} />
            <p className="text-xs font-bold" style={{ color: "#9C8870" }}>or</p>
            <div className="flex-1 h-px" style={{ background: "#F0E6D8" }} />
          </div>

          {/* Become a seller CTA */}
          <div className="rounded-3xl overflow-hidden" style={{ background: "#1A1200" }}>
            <div style={{ padding: "28px 24px" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(255,105,0,0.2)" }}>
                <Users size={22} style={{ color: "#FF6900" }} />
              </div>
              <h2 className="font-black text-xl mb-2 text-white">
                Become a Seller
              </h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
                {referrerName
                  ? `${referrerName} is already selling MadMix. Join them and build your own income — on your own schedule.`
                  : "Sell MadMix in your area and build your own income — at gyms, offices, colleges, everywhere."
                }
              </p>

              {/* Buy-back guarantee highlight */}
              <div className="rounded-2xl flex items-start gap-3 mb-5"
                style={{ background: "rgba(255,105,0,0.12)", border: "1px solid rgba(255,105,0,0.25)", padding: "14px 16px" }}>
                <Shield size={16} style={{ color: "#FF6900", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: "#FF6900" }}>Risk-Free Buy-Back Guarantee</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    Don&apos;t sell your starter pack in 7 days? MadMix buys the unsold stock back. Zero risk.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
                {[
                  { icon: Zap, text: "Start selling from day 1 — no experience needed" },
                  { icon: Shield, text: "7-day buy-back guarantee on your starter pack" },
                  { icon: Star, text: "Your own territory — no other sellers in your patch" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon size={12} style={{ color: "#FF6900", flexShrink: 0 }} />
                    {text}
                  </div>
                ))}
              </div>

              <Link
                href="/onboarding"
                className="block w-full py-4 rounded-2xl font-black text-white text-base text-center active:scale-95 transition-transform"
                style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)", boxShadow: "0 6px 20px rgba(255,105,0,0.3)" }}
              >
                Join MadSquad →
              </Link>
            </div>
          </div>

          <p className="text-center text-xs" style={{ color: "#9C8870" }}>
            Already a seller?{" "}
            <Link href="/" className="font-bold" style={{ color: "#FF6900" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF8F0" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FF6900" }} />
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
