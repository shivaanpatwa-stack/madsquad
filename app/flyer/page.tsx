"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { useApp } from "@/store/AppContext";
import { Share2, Copy, Check, MessageCircle, Link2, Users, Camera, Download, ChevronDown, X } from "lucide-react";

// ── Canvas flyer renderer ─────────────────────────────────────────────────────
function drawFlyer(
  canvas: HTMLCanvasElement,
  name: string,
  area: string,
  code: string,
  photoImg: HTMLImageElement | null,
  initials: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1080;
  const H = 1350; // 4:5 ratio — perfect for Instagram feed + WhatsApp
  canvas.width = W;
  canvas.height = H;

  // ── Background ──
  ctx.fillStyle = "#FFF8F0";
  ctx.fillRect(0, 0, W, H);

  // ── Orange header band ──
  const headerH = 420;
  const headerGrad = ctx.createLinearGradient(0, 0, W, headerH);
  headerGrad.addColorStop(0, "#FF6900");
  headerGrad.addColorStop(1, "#FFB800");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, W, headerH);

  // Subtle circle texture in header
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "white";
  ctx.beginPath(); ctx.arc(900, -40, 280, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(60, 380, 160, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // ── Top bar: MadMix logo + badge ──
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  roundRect(ctx, 48, 52, 240, 56, 28); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  roundRect(ctx, W - 298, 52, 250, 56, 28); ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = `800 28px -apple-system, 'SF Pro Display', system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("MadSquad × MadMix", 72, 88);

  ctx.font = `700 22px -apple-system, system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("🦈 Shark Tank India", W - 72, 88);

  // ── Header headline ──
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.font = `900 96px -apple-system, 'SF Pro Display', system-ui, sans-serif`;
  ctx.fillText("CRAZY", W / 2, 240);
  ctx.fillText("GOOD! 🔥", W / 2, 358);

  // ── Profile photo circle (overlapping header + body) ──
  const circleX = W / 2;
  const circleY = headerH + 10; // sits right on the border
  const circleR = 130;

  // White ring
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR + 12, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // Orange inner ring
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR + 6, 0, Math.PI * 2);
  ctx.fillStyle = "#FF6900";
  ctx.fill();

  // Photo or avatar fill
  ctx.save();
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
  ctx.clip();

  if (photoImg) {
    // Fit photo as cover inside the circle
    const imgAspect = photoImg.naturalWidth / photoImg.naturalHeight;
    const d = circleR * 2;
    let sx = 0, sy = 0, sw = photoImg.naturalWidth, sh = photoImg.naturalHeight;
    if (imgAspect > 1) {
      sw = photoImg.naturalHeight;
      sx = (photoImg.naturalWidth - sw) / 2;
    } else {
      sh = photoImg.naturalWidth;
      sy = (photoImg.naturalHeight - sh) / 2;
    }
    ctx.drawImage(photoImg, sx, sy, sw, sh, circleX - circleR, circleY - circleR, d, d);
  } else {
    // Avatar gradient fallback
    const avatarGrad = ctx.createLinearGradient(circleX - circleR, circleY - circleR, circleX + circleR, circleY + circleR);
    avatarGrad.addColorStop(0, "#FF6900");
    avatarGrad.addColorStop(1, "#FFB800");
    ctx.fillStyle = avatarGrad;
    ctx.fillRect(circleX - circleR, circleY - circleR, circleR * 2, circleR * 2);
    ctx.fillStyle = "white";
    ctx.font = `800 72px -apple-system, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, circleX, circleY + 4);
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  // ── Name + area + badge ──
  const nameY = circleY + circleR + 56;
  ctx.textAlign = "center";
  ctx.fillStyle = "#1A1200";
  ctx.font = `900 60px -apple-system, 'SF Pro Display', system-ui, sans-serif`;
  ctx.fillText(`Hi, I'm ${name.split(" ")[0]}! 👋`, W / 2, nameY);

  ctx.font = `500 32px -apple-system, system-ui, sans-serif`;
  ctx.fillStyle = "#6B5B45";
  ctx.fillText(`Selling MadMix in ${area}`, W / 2, nameY + 54);

  // Verified pill
  const pillY = nameY + 100;
  ctx.fillStyle = "#FFF3E6";
  roundRect(ctx, W / 2 - 190, pillY - 28, 380, 50, 25); ctx.fill();
  ctx.strokeStyle = "#FFB800";
  ctx.lineWidth = 2;
  roundRect(ctx, W / 2 - 190, pillY - 28, 380, 50, 25); ctx.stroke();
  ctx.fillStyle = "#FF6900";
  ctx.font = `700 24px -apple-system, system-ui, sans-serif`;
  ctx.fillText("✅ Official MadSquad Seller", W / 2, pillY + 6);

  // ── Product highlights row ──
  const highlightY = pillY + 90;
  const highlights = ["🍿 Baked, not fried", "✅ ₹10 only", "💯 Clean ingredients"];
  const pillW = 270;
  const totalW = highlights.length * pillW + (highlights.length - 1) * 20;
  const startX = (W - totalW) / 2;

  highlights.forEach((text, i) => {
    const px = startX + i * (pillW + 20);
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(26,18,0,0.06)";
    ctx.shadowBlur = 12;
    roundRect(ctx, px, highlightY - 30, pillW, 56, 28); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#F0E6D8";
    ctx.lineWidth = 1.5;
    roundRect(ctx, px, highlightY - 30, pillW, 56, 28); ctx.stroke();
    ctx.fillStyle = "#1A1200";
    ctx.font = `600 22px -apple-system, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(text, px + pillW / 2, highlightY + 8);
  });

  // ── Divider ──
  const divY = highlightY + 70;
  ctx.strokeStyle = "#F0E6D8";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(80, divY); ctx.lineTo(W - 80, divY);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Ref code section ──
  const refBoxY = divY + 28;
  ctx.fillStyle = "white";
  ctx.shadowColor = "rgba(255,105,0,0.10)";
  ctx.shadowBlur = 24;
  roundRect(ctx, 72, refBoxY, W - 144, 240, 32); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#FFB800";
  ctx.lineWidth = 2;
  roundRect(ctx, 72, refBoxY, W - 144, 240, 32); ctx.stroke();

  ctx.fillStyle = "#9C8870";
  ctx.font = `600 26px -apple-system, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("Get ₹10 off your first MadMix order:", W / 2, refBoxY + 52);

  // Code pill
  const codePillY = refBoxY + 72;
  const codeGrad = ctx.createLinearGradient(W / 2 - 220, codePillY, W / 2 + 220, codePillY + 72);
  codeGrad.addColorStop(0, "#FF6900");
  codeGrad.addColorStop(1, "#FFB800");
  ctx.fillStyle = codeGrad;
  roundRect(ctx, W / 2 - 220, codePillY, 440, 80, 40); ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = `900 52px -apple-system, 'SF Pro Display', system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.08em";
  ctx.fillText(code, W / 2, codePillY + 56);

  ctx.fillStyle = "#6B5B45";
  ctx.font = `500 24px -apple-system, system-ui, sans-serif`;
  ctx.fillText("Use this code when ordering  →  instant ₹10 off", W / 2, refBoxY + 220);

  // ── Bottom CTA ──
  const ctaY = refBoxY + 290;
  ctx.fillStyle = "#1A1200";
  ctx.font = `700 30px -apple-system, system-ui, sans-serif`;
  ctx.fillText("📲 DM me to order directly in " + area, W / 2, ctaY);

  ctx.fillStyle = "#9C8870";
  ctx.font = `500 24px -apple-system, system-ui, sans-serif`;
  ctx.fillText("madmixfoods.com", W / 2, ctaY + 44);
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

// ── Share caption builder ─────────────────────────────────────────────────────
function buildCaption(name: string, area: string, code: string) {
  const firstName = name.split(" ")[0];
  return `Hey! I'm ${firstName}, an official MadSquad seller in ${area} 🙌

I'm selling MadMix snacks — healthy, baked (not fried), and only ₹10 a pack. Millet puffs, bhujia, raisins — all clean ingredients, crazy good taste 🔥

🦈 As seen on Shark Tank India

Get ₹10 off your first order with my code:
👉 ${code}

DM me to order directly, or order at madmixfoods.com

#MadMix #HealthySnacks #MadSquad #BakedNotFried`;
}

export default function FlyerPage() {
  const { state, addReferral } = useApp();
  const { seller, referralCode, referrals } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharedOnce, setSharedOnce] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const area = state.onboardingDetails?.area ?? seller.area;
  const caption = buildCaption(seller.name, area, referralCode);
  const refLink = `https://madsquad.vercel.app/join?ref=${referralCode}`;
  const initials = seller.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const renderCanvas = useCallback((img: HTMLImageElement | null) => {
    if (canvasRef.current) {
      drawFlyer(canvasRef.current, seller.name, area, referralCode, img, initials);
    }
  }, [seller.name, area, referralCode, initials]);

  useEffect(() => { renderCanvas(photoImg); }, [renderCanvas, photoImg]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    const img = new Image();
    img.onload = () => { setPhotoImg(img); };
    img.src = url;
  };

  const removePhoto = () => {
    setPhotoImg(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadFlyer = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `madsquad-${seller.name.replace(/\s/g, "-").toLowerCase()}-${referralCode}.png`;
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption).catch(() => {});
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const triggerReferral = () => {
    if (sharedOnce) return;
    setSharedOnce(true);
    const names = ["Neha R.", "Amit K.", "Pooja M.", "Sanjay T.", "Divya S.", "Rahul B."];
    const name = names[Math.floor(Math.random() * names.length)];
    addReferral({ id: `ref-sim-${Date.now()}`, name, type: "buyer", timestamp: new Date(), pointsEarned: 25 });
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(caption + "\n\n" + refLink)}`, "_blank");
    triggerReferral();
    setShareOpen(false);
  };

  const handleNativeShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "MadMix — Try with my code!", text: caption, url: refLink }).catch(() => {});
    } else {
      handleCopyCaption();
    }
    triggerReferral();
    setShareOpen(false);
  };

  const totalReferrals = referrals.length;
  const referralPoints = referrals.reduce((s, r) => s + r.pointsEarned, 0);

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* Header */}
      <div style={{ background: "#1A1200", padding: "48px 20px 24px" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF6900" }}>Flyer Engine</p>
        <h1 className="text-white font-black leading-tight" style={{ fontSize: 26, letterSpacing: "-0.01em" }}>
          Your personal<br />MadMix flyer.
        </h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          Add your photo · share anywhere · earn recognition
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Photo upload ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid #F0E6D8" }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F0E6D8" }}>
            <div className="flex items-center gap-2">
              <Camera size={15} style={{ color: "#FF6900" }} />
              <p className="text-sm font-black" style={{ color: "#1A1200" }}>Add Your Photo</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF3E6", color: "#FF6900" }}>
                Makes it 3× more personal
              </span>
            </div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {photoPreview ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ border: "3px solid #FF6900" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Your photo" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: "#1A1200" }}>Looking good! 🔥</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B5B45" }}>Your face is on the flyer — much more shareable.</p>
                </div>
                <button onClick={removePhoto}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "#FEE2E2" }}>
                  <X size={14} style={{ color: "#DC2626" }} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 py-6 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
                style={{ background: "#FFF8F0", border: "2px dashed #F0E6D8" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "#FFF3E6" }}>
                  <Camera size={24} style={{ color: "#FF6900" }} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: "#1A1200" }}>Tap to add your selfie</p>
                  <p className="text-xs mt-1" style={{ color: "#9C8870" }}>or any photo from your gallery</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" capture="user"
                  className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
        </div>

        {/* ── Flyer preview ── */}
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(26,18,0,0.12)", border: "1px solid #F0E6D8" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", display: "block" }}
          />
          <button onClick={downloadFlyer}
            className="w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm transition-colors active:scale-[0.98]"
            style={{ background: "#1A1200", color: "white" }}>
            <Download size={15} />
            Save Flyer to Phone
          </button>
        </div>

        {/* ── Ref code strip ── */}
        <div className="rounded-2xl flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)", padding: "18px 20px" }}>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-0.5">Your Code</p>
            <p className="text-white font-black" style={{ fontSize: 28, letterSpacing: "0.06em" }}>{referralCode}</p>
          </div>
          <button onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{ background: copied ? "rgba(34,197,94,0.9)" : "rgba(255,255,255,0.25)", color: "white" }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* ── Share buttons ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F0E6D8" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Share Your Flyer</p>
          </div>

          {/* Primary: WhatsApp */}
          <div style={{ padding: "16px" }}>
            <button onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-white text-base active:scale-[0.98] transition-transform mb-3"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 16px rgba(34,197,94,0.25)" }}>
              <MessageCircle size={20} />
              Share on WhatsApp
            </button>

            {/* Platform share grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Instagram */}
              <button
                onClick={() => { window.open(`https://www.instagram.com/`, "_blank"); triggerReferral(); setShareOpen(false); }}
                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all active:scale-95"
                style={{ background: "#fdf2f8" }}>
                <span style={{ fontSize: 18 }}>📸</span>
                <span className="text-[10px] font-bold" style={{ color: "#be185d" }}>Instagram</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refLink)}&quote=${encodeURIComponent(caption)}`, "_blank"); triggerReferral(); setShareOpen(false); }}
                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all active:scale-95"
                style={{ background: "#eff6ff" }}>
                <span style={{ fontSize: 18 }}>📘</span>
                <span className="text-[10px] font-bold" style={{ color: "#1d4ed8" }}>Facebook</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(refLink)}`, "_blank"); triggerReferral(); setShareOpen(false); }}
                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all active:scale-95"
                style={{ background: "#f0f0f0" }}>
                <span style={{ fontSize: 18 }}>🐦</span>
                <span className="text-[10px] font-bold" style={{ color: "#1A1200" }}>X / Twitter</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(refLink)}`, "_blank"); triggerReferral(); setShareOpen(false); }}
                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all active:scale-95"
                style={{ background: "#eff6ff" }}>
                <span style={{ fontSize: 18 }}>💼</span>
                <span className="text-[10px] font-bold" style={{ color: "#0369a1" }}>LinkedIn</span>
              </button>

              <button onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all active:scale-95"
                style={{ background: linkCopied ? "#DCFCE7" : "#F8F4F0" }}>
                {linkCopied ? <Check size={18} style={{ color: "#22c55e" }} /> : <Link2 size={18} style={{ color: "#6B5B45" }} />}
                <span className="text-[10px] font-bold" style={{ color: linkCopied ? "#22c55e" : "#6B5B45" }}>
                  {linkCopied ? "Copied!" : "Copy Link"}
                </span>
              </button>

              <button onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all active:scale-95"
                style={{ background: "#F8F4F0" }}>
                <Share2 size={18} style={{ color: "#6B5B45" }} />
                <span className="text-[10px] font-bold" style={{ color: "#6B5B45" }}>More Apps</span>
              </button>
            </div>
          </div>

          {/* Caption preview — collapsible */}
          <details style={{ borderTop: "1px solid #F0E6D8" }}>
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none">
              <span className="text-xs font-bold" style={{ color: "#6B5B45" }}>Preview caption text</span>
              <ChevronDown size={14} style={{ color: "#9C8870" }} />
            </summary>
            <div style={{ padding: "0 20px 16px" }}>
              <div className="rounded-xl p-3 whitespace-pre-wrap text-xs leading-relaxed"
                style={{ background: "#F8F4F0", color: "#1A1200", fontFamily: "monospace" }}>
                {caption}
              </div>
              <button onClick={handleCopyCaption}
                className="mt-2 w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background: captionCopied ? "#22c55e" : "#FF6900", color: "white" }}>
                {captionCopied ? <Check size={14} /> : <Copy size={14} />}
                {captionCopied ? "Copied to clipboard!" : "Copy this caption"}
              </button>
            </div>
          </details>
        </div>

        {/* ── Platform tips ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F0E6D8" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>How to share on each platform</p>
          </div>
          <div style={{ padding: "4px 0" }}>
            {[
              { platform: "WhatsApp Status", emoji: "💬", tip: "Tap 'Share on WhatsApp' → post as a Status for 24-hour reach to all contacts" },
              { platform: "Instagram Story", emoji: "📸", tip: "Save flyer → open Instagram → add to Story → mention your location" },
              { platform: "Instagram Feed", emoji: "🖼️", tip: "Save flyer → post as a square or portrait post with the caption" },
              { platform: "Facebook / X",  emoji: "📢", tip: "Copy caption → paste with the flyer image → tag #MadMix #HealthySnacks" },
            ].map(({ platform, emoji, tip }) => (
              <div key={platform} className="flex items-start gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid #F8F0E8" }}>
                <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#1A1200" }}>{platform}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6B5B45" }}>{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── No-pyramid clarity ── */}
        <div className="rounded-2xl px-5 py-4" style={{ background: "#dcfce7", border: "1.5px solid #bbf7d0" }}>
          <p className="text-xs font-black uppercase tracking-wider mb-1 text-green-800">No pyramid. No chain commissions.</p>
          <p className="text-xs text-green-900 leading-relaxed">
            Every MadSquad partner earns from their <strong>own product sales</strong> only. Referral points are community recognition — not income from someone else's work. You bring someone in, they sell, they earn. Completely independent.
          </p>
        </div>

        {/* ── Network Impact (sign-up tree — people only) ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1A1200" }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2">
              <Users size={13} style={{ color: "#FF6900" }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF6900" }}>Your Network Impact</p>
            </div>
          </div>
          <div style={{ padding: "16px 20px 12px" }}>
            {/* Sign-up tree visual — people only, no money */}
            <div className="flex flex-col items-center gap-1 mb-4">
              {/* You */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                  style={{ background: "#FF6900", color: "white" }}>You</div>
                <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>1 partner</p>
              </div>
              {/* Arrow down */}
              <div className="text-white/20 text-lg leading-none">↓</div>
              {/* Wave 1: 3 */}
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs"
                      style={{ background: "rgba(255,105,0,0.4)", color: "white" }}>P{i}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>3 new partners (wave 1)</p>
              <div className="text-white/20 text-lg leading-none">↓</div>
              {/* Wave 2: 9 */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,105,0,0.2)", border: "1px solid rgba(255,105,0,0.4)" }}>
                    <span className="text-[8px] text-white">👤</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>9 more partners (wave 2)</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-0" style={{ padding: "0 20px 8px" }}>
            {[
              { label: "Partners brought in", value: referrals.filter((r) => r.type === "seller").length },
              { label: "Buyers reached", value: referrals.filter((r) => r.type === "buyer").length },
              { label: "Total connections", value: totalReferrals },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-white font-black text-2xl">{value}</p>
                <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", margin: "8px 20px 16px", borderRadius: 12, padding: "10px 16px" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>Community recognition points</p>
              <p className="font-black text-sm" style={{ color: "#FF6900" }}>+{referralPoints} pts</p>
            </div>
            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Recognition only · your earnings come from packs you sell</p>
          </div>
        </div>

        {/* Recent referrals */}
        {referrals.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #F0E6D8" }}>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #F0E6D8" }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1A1200" }}>Recent via your code</p>
            </div>
            {referrals.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid #F8F0E8" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: r.type === "seller" ? "#EDE9FE" : "#FFF3E6", color: r.type === "seller" ? "#7C3AED" : "#FF6900" }}>
                  {r.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "#1A1200" }}>{r.name}</p>
                  <p className="text-[10px]" style={{ color: "#9C8870" }}>{r.type === "seller" ? "Joined as seller" : "Bought MadMix"}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF3E6", color: "#FF6900" }}>
                  +{r.pointsEarned} pts
                </span>
              </div>
            ))}
          </div>
        )}

        {/* How referrals work */}
        <div className="rounded-2xl" style={{ background: "#FFF3E6", border: "1px solid #F0E6D8", padding: "16px 20px" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#FF6900" }}>How referrals work</p>
          {[
            { pts: "+25 pts", text: "Someone uses your code to buy MadMix" },
            { pts: "+50 pts", text: "Someone joins MadSquad as a seller using your link" },
          ].map(({ pts, text }) => (
            <div key={pts} className="flex items-center gap-3 mb-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-full shrink-0" style={{ background: "#FF6900", color: "white" }}>{pts}</span>
              <p className="text-sm" style={{ color: "#1A1200" }}>{text}</p>
            </div>
          ))}
          <p className="text-[10px] mt-3 leading-relaxed" style={{ color: "#9C8870" }}>
            Referral points = community recognition. Your real earnings come from the packs you sell directly.
          </p>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
