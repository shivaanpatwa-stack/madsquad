"use client";
import { useRef, useEffect, useState } from "react";
import { useApp } from "@/store/AppContext";
import { Share2, Copy, Check, MessageCircle, Link2, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

function drawFlyer(canvas: HTMLCanvasElement, name: string, code: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = 1080, H = 1080;
  canvas.width = W;
  canvas.height = H;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#FF6900");
  bg.addColorStop(1, "#FFB800");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle texture circles
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "white";
  ctx.beginPath(); ctx.arc(900, 150, 320, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(100, 900, 260, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Top dark pill: "MadSquad by MadMix"
  ctx.fillStyle = "rgba(26,18,0,0.55)";
  roundRect(ctx, 60, 60, 340, 60, 30);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("MadSquad  ·  by MadMix", 90, 99);

  // Main headline
  ctx.fillStyle = "white";
  ctx.font = "black 110px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Crazy", W / 2, 280);
  ctx.fillText("Good!", W / 2, 410);

  // Subtext
  ctx.font = "500 44px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("Healthy snacks that taste amazing.", W / 2, 500);
  ctx.fillText("Baked. Bold. ₹10 only.", W / 2, 558);

  // White card for ref code
  ctx.fillStyle = "white";
  roundRect(ctx, 100, 620, W - 200, 300, 36);
  ctx.fill();

  // "Join with my code" text
  ctx.fillStyle = "#1A1200";
  ctx.font = "bold 32px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Get yours from", W / 2, 690);

  // Name
  ctx.fillStyle = "#FF6900";
  ctx.font = "black 64px system-ui, sans-serif";
  ctx.fillText(name, W / 2, 778);

  // Code label
  ctx.fillStyle = "#9C8870";
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText("Use code for ₹10 off your first order:", W / 2, 828);

  // Code pill
  const codeGrad = ctx.createLinearGradient(W / 2 - 180, 840, W / 2 + 180, 900);
  codeGrad.addColorStop(0, "#FF6900");
  codeGrad.addColorStop(1, "#FFB800");
  ctx.fillStyle = codeGrad;
  roundRect(ctx, W / 2 - 180, 845, 360, 72, 36);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "black 48px system-ui, sans-serif";
  ctx.fillText(code, W / 2, 898);

  // Bottom: madmixfoods.com
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 30px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("madmixfoods.com", W / 2, 1020);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function FlyerPage() {
  const { state, addReferral } = useApp();
  const { seller, referralCode, referrals } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharedDemo, setSharedDemo] = useState(false);

  const refLink = `https://madsquad.vercel.app/join?ref=${referralCode}`;
  const caption = `🔥 Try MadMix — healthy snacks that actually taste good!\n\nBaked, not fried. ₹10 a pack. Available from me directly.\n\nOrder with my code: ${referralCode}\nOr join me as a seller 👇\n${refLink}`;

  useEffect(() => {
    if (canvasRef.current) {
      drawFlyer(canvasRef.current, seller.name, referralCode);
    }
  }, [seller.name, referralCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(caption).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(caption);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    simulateReferral("buyer");
  };

  const handleInstagram = () => {
    navigator.clipboard.writeText(caption).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    simulateReferral("buyer");
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refLink)}`, "_blank");
    simulateReferral("buyer");
  };

  const handleNativeShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "MadMix — Crazy Good Snacks", text: caption, url: refLink }).catch(() => {});
    } else {
      handleCopyLink();
    }
    simulateReferral("buyer");
  };

  const simulateReferral = (type: "buyer" | "seller") => {
    if (sharedDemo) return;
    setSharedDemo(true);
    const names = ["Neha R.", "Amit K.", "Pooja M.", "Sanjay T.", "Divya S."];
    const name = names[Math.floor(Math.random() * names.length)];
    const pts = type === "seller" ? 50 : 25;
    addReferral({
      id: `ref-sim-${Date.now()}`,
      name,
      type,
      timestamp: new Date(),
      pointsEarned: pts,
    });
  };

  const downloadFlyer = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `madsquad-flyer-${referralCode}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const totalReferrals = referrals.length;
  const buyerReferrals = referrals.filter((r) => r.type === "buyer").length;
  const sellerReferrals = referrals.filter((r) => r.type === "seller").length;
  const referralPoints = referrals.reduce((s, r) => s + r.pointsEarned, 0);

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* Header */}
      <div style={{ background: "#1A1200", padding: "48px 20px 24px" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF6900" }}>
          Flyer Engine
        </p>
        <h1 className="text-white font-black leading-tight" style={{ fontSize: 26, letterSpacing: "-0.01em" }}>
          Share MadMix.<br />Earn recognition.
        </h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          Your personalised flyer — tap any button to share
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Flyer preview */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #F0E6D8", background: "white" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", display: "block", borderRadius: 0 }}
          />
          <button
            onClick={downloadFlyer}
            className="w-full py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            style={{ color: "#FF6900", borderTop: "1px solid #F0E6D8" }}
          >
            <Share2 size={14} />
            Save Flyer
          </button>
        </div>

        {/* Ref code */}
        <div className="rounded-2xl flex items-center gap-4"
          style={{ background: "white", border: "1.5px solid #F0E6D8", padding: "16px 20px" }}>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#9C8870" }}>Your Referral Code</p>
            <p className="font-black text-2xl" style={{ color: "#FF6900", letterSpacing: "0.04em" }}>{referralCode}</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{ background: copied ? "#22c55e" : "#FFF3E6", color: copied ? "white" : "#FF6900" }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Share buttons */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F0E6D8" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Share Via</p>
          </div>
          <div className="grid grid-cols-2 gap-3" style={{ padding: "16px" }}>
            <button onClick={handleWhatsApp}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              style={{ background: "#DCFCE7", color: "#15803d" }}>
              <MessageCircle size={18} />
              WhatsApp
            </button>
            <button onClick={handleInstagram}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              style={{ background: "#FDF4FF", color: "#7C3AED" }}>
              <ExternalLink size={18} />
              Instagram
            </button>
            <button onClick={handleFacebook}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              style={{ background: "#EFF6FF", color: "#2563EB" }}>
              <ExternalLink size={18} />
              Facebook
            </button>
            <button onClick={handleNativeShare}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              style={{ background: "#FFF3E6", color: "#FF6900" }}>
              <Share2 size={18} />
              More
            </button>
          </div>
          <button onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 font-bold text-sm transition-colors"
            style={{ borderTop: "1px solid #F0E6D8", color: linkCopied ? "#22c55e" : "#6B5B45" }}>
            {linkCopied ? <Check size={14} /> : <Link2 size={14} />}
            {linkCopied ? "Caption + link copied!" : "Copy caption + link"}
          </button>
        </div>

        {/* Referral stats */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1A1200" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF6900" }}>
              Your Referrals
            </p>
          </div>
          <div className="grid grid-cols-3 gap-0" style={{ padding: "16px 20px 20px" }}>
            {[
              { label: "Total", value: totalReferrals },
              { label: "Buyers", value: buyerReferrals },
              { label: "Sellers", value: sellerReferrals },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-white font-black text-2xl">{value}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 20px" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
                Community Builder Points
              </p>
              <p className="font-black text-sm" style={{ color: "#FF6900" }}>
                +{referralPoints} pts
              </p>
            </div>
            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
              Recognition points only · earnings tied to product sales
            </p>
          </div>
        </div>

        {/* Recent referrals */}
        {referrals.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
            <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F0E6D8" }}>
              <div className="flex items-center gap-2">
                <Users size={14} style={{ color: "#FF6900" }} />
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Recent</p>
              </div>
            </div>
            {referrals.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: "1px solid #F8F0E8" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: r.type === "seller" ? "#EDE9FE" : "#FFF3E6", color: r.type === "seller" ? "#7C3AED" : "#FF6900" }}>
                  {r.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "#1A1200" }}>{r.name}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>
                    {r.type === "seller" ? "Joined as seller" : "Bought MadMix"}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#FFF3E6", color: "#FF6900" }}>
                  +{r.pointsEarned} pts
                </span>
              </div>
            ))}
            <Link href="/rewards"
              className="block w-full text-center py-3 text-sm font-bold"
              style={{ color: "#6B5B45" }}>
              View full leaderboard →
            </Link>
          </div>
        )}

        {/* How it works */}
        <div className="rounded-2xl" style={{ background: "#FFF3E6", border: "1px solid #F0E6D8", padding: "16px 20px" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#FF6900" }}>
            How referrals work
          </p>
          {[
            { pts: "+25 pts", text: "Someone buys MadMix using your code" },
            { pts: "+50 pts", text: "Someone joins MadSquad as a seller" },
          ].map(({ pts, text }) => (
            <div key={pts} className="flex items-center gap-3 mb-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-full shrink-0"
                style={{ background: "#FF6900", color: "white" }}>{pts}</span>
              <p className="text-sm" style={{ color: "#1A1200" }}>{text}</p>
            </div>
          ))}
          <p className="text-[10px] mt-3 leading-relaxed" style={{ color: "#9C8870" }}>
            Referral points are community recognition — not income. Your earnings come from the packs you sell directly.
          </p>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
