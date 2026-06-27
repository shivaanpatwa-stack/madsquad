"use client";
import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { PlayCircle, CheckCircle, X, Zap, Award, ChevronRight, Star } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// LESSON DATA (real MadMix brand content)
// ─────────────────────────────────────────────────────────────────────────────
type QuizOption = { key: string; text: string };
type Lesson = {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  emoji: string;
  duration: string;
  gradient: string;
  textOnGrad: string;
  points: number;
  intro: string;
  takeaways: { icon: string; text: string }[];
  quiz?: { question: string; options: QuizOption[]; correct: string };
};

const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    num: 1,
    title: "Welcome to the Pagalpan",
    subtitle: "What MadMix actually is",
    emoji: "🎉",
    duration: "2 min",
    gradient: "linear-gradient(135deg, #FF6900 0%, #FFB800 100%)",
    textOnGrad: "white",
    points: 30,
    intro: "MadMix made healthy snacks not suck. That's the whole idea — bold, fun, guilt-free snacking that actually tastes good.",
    takeaways: [
      { icon: "🔥", text: "MadMix = healthy snacks that taste amazing. That's rare and that's the pitch." },
      { icon: "🎯", text: "Tagline: 'crazy good!' — healthy is fun, not boring." },
      { icon: "💡", text: "You're not selling sad health food. You're selling the snack people actually want to eat." },
    ],
  },
  {
    id: "lesson-2",
    num: 2,
    title: "The MadMix Story",
    subtitle: "A credible brand with a mission",
    emoji: "🦈",
    duration: "3 min",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
    textOnGrad: "white",
    points: 30,
    intro: "MadMix was founded by Gaurav Palrecha, a third-gen entrepreneur — described as 'the Willy Wonka of snacks if he ditched chocolate.' Featured on Shark Tank India Season 4.",
    takeaways: [
      { icon: "🦈", text: "Shark Tank India Season 4 — national credibility. Customers recognise the name." },
      { icon: "👨‍💼", text: "Gaurav Palrecha, third-gen entrepreneur. Not a startup gimmick — a serious founder with a mission." },
      { icon: "❤️", text: "The why: healthy food shouldn't be boring, costly, or tasteless. MadMix exists to fix that." },
      { icon: "🌍", text: "A brand people can trust. That trust makes selling easier — they've heard of it." },
    ],
    quiz: {
      question: "MadMix was featured on which show?",
      options: [
        { key: "a", text: "The Big Bull" },
        { key: "b", text: "Shark Tank India" },
        { key: "c", text: "KBC" },
      ],
      correct: "b",
    },
  },
  {
    id: "lesson-3",
    num: 3,
    title: "Mission & Vision",
    subtitle: "The bigger picture you're part of",
    emoji: "🎯",
    duration: "2 min",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    textOnGrad: "white",
    points: 30,
    intro: "MadMix isn't just about snacks. The mission is to become the world's most beloved health-focused brand by making balanced living achievable for everyone.",
    takeaways: [
      { icon: "🌏", text: "Mission: world's most beloved health-focused brand. Big goal. Real ambition." },
      { icon: "🛒", text: "Vision: healthy eating should be hassle-free, accessible, and convenient — everywhere." },
      { icon: "🤝", text: "You're part of that vision. Every pack you sell is one more person eating well." },
      { icon: "✨", text: "This isn't just a job — it's a story you can tell buyers and it lands." },
    ],
  },
  {
    id: "lesson-4",
    num: 4,
    title: "The Products",
    subtitle: "Know what you're selling inside out",
    emoji: "🍿",
    duration: "4 min",
    gradient: "linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)",
    textOnGrad: "white",
    points: 40,
    intro: "Three product lines: Baked Millet Puffs, Baked Millet Bhujia, and Flavoured Raisins. All made with quinoa, millet, ragi, natural spices. No artificial colours. Baked, not fried.",
    takeaways: [
      { icon: "🔥", text: "Baked Millet Puffs — Flamin' Fun, Chaat Corner, Pizza Party, Mighty Masala. Perfect for gyms + colleges." },
      { icon: "💥", text: "Baked Millet Bhujia — classic Indian taste, lighter and healthier. Works at offices + stations." },
      { icon: "🍇", text: "Flavoured Raisins — Nardana range. Easy upsell alongside puffs for a ₹20-30 combo." },
      { icon: "✅", text: "Baked not fried. Dietician, parent, and kid approved. 6-month shelf life. Many vegan + gluten-free." },
      { icon: "💰", text: "₹10 a pack = low barrier buy. Anyone can try it. That's why it sells fast." },
    ],
    quiz: {
      question: "Which of these is NOT a MadMix product line?",
      options: [
        { key: "a", text: "Baked Millet Puffs" },
        { key: "b", text: "Flavoured Raisins" },
        { key: "c", text: "Fried Potato Chips" },
      ],
      correct: "c",
    },
  },
  {
    id: "lesson-5",
    num: 5,
    title: "Match Product to Person",
    subtitle: "Brand knowledge in action — not marketing tricks",
    emoji: "💪",
    duration: "4 min",
    gradient: "linear-gradient(135deg, #DC2626 0%, #FF6900 100%)",
    textOnGrad: "white",
    points: 40,
    intro: "You know the brand. Now use that knowledge: match the right MadMix product to the right person. That's it. No tricks — just genuine understanding of what you're selling.",
    takeaways: [
      { icon: "👟", text: "Gym crowd → Baked Millet Puffs (Flamin' Fun, Mighty Masala). Their need: tasty post-workout snack. Your brand knowledge does the talking." },
      { icon: "🏢", text: "Office crowd → Bhujia or Raisins at tea-time. Their need: light, not heavy. MadMix fits perfectly." },
      { icon: "🎒", text: "College students → any spicy puff. Their need: something new and affordable. ₹10 is an easy yes." },
      { icon: "🗣️", text: "Lead with TASTE, then health — open with 'yeh bahut tasty hai' not calories. The product story lands naturally." },
      { icon: "🔄", text: "Consistency builds trust. Same spot, same time, same face = repeat buyers who seek you out." },
    ],
    quiz: {
      question: "What's the best opening line when approaching gym-goers?",
      options: [
        { key: "a", text: "'Bhai, healthy snack hai, low calorie, try karo'" },
        { key: "b", text: "'Yeh bahut tasty hai, baked not fried, sirf ₹10 mein'" },
        { key: "c", text: "'MadMix ka hai, Shark Tank wala'" },
      ],
      correct: "b",
    },
  },
];

const TOTAL_LESSONS = LESSONS.length;
const CERT_BONUS = 200;

// ─────────────────────────────────────────────────────────────────────────────
// LESSON OVERLAY / MODAL
// ─────────────────────────────────────────────────────────────────────────────
function LessonOverlay({
  lesson,
  isCompleted,
  onClose,
  onComplete,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: (id: string, pts: number) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const isCorrect = selectedAnswer === lesson.quiz?.correct;
  const canComplete = !lesson.quiz || selectedAnswer !== null;

  const handleComplete = () => {
    if (isCompleted) { onClose(); return; }
    onComplete(lesson.id, lesson.points);
    setJustCompleted(true);
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#1A1200" }}
    >
      {/* Hero */}
      <div className="relative shrink-0" style={{ background: lesson.gradient, padding: "52px 24px 28px" }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.25)" }}
        >
          <X size={18} color="white" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
            Lesson {lesson.num} of {TOTAL_LESSONS}
          </span>
          <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
            {lesson.duration}
          </span>
        </div>
        <h2 className="text-white font-black leading-tight mb-1" style={{ fontSize: 26, letterSpacing: "-0.01em" }}>
          {lesson.title}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{lesson.subtitle}</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8F0" }}>
        <div style={{ padding: "24px 20px", maxWidth: 600, margin: "0 auto" }}>

          {/* Intro */}
          <p className="text-base leading-relaxed mb-6" style={{ color: "#1A1200", fontWeight: 500 }}>
            {lesson.intro}
          </p>

          {/* Takeaways */}
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#FF6900" }}>
            Key Takeaways
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {lesson.takeaways.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl"
                style={{ background: "white", border: "1px solid #F0E6D8", padding: "14px 16px" }}>
                <span className="text-xl shrink-0">{t.icon}</span>
                <p className="text-sm leading-relaxed" style={{ color: "#1A1200" }}>{t.text}</p>
              </div>
            ))}
          </div>

          {/* Quiz */}
          {lesson.quiz && (
            <div className="rounded-2xl overflow-hidden mb-6" style={{ border: "1.5px solid #F0E6D8" }}>
              <div style={{ background: "#FFF3E6", padding: "14px 16px 12px" }}>
                <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "#FF6900" }}>
                  Quick Check
                </p>
                <p className="font-bold text-sm" style={{ color: "#1A1200" }}>{lesson.quiz.question}</p>
              </div>
              <div style={{ background: "white", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {lesson.quiz.options.map((opt) => {
                  const picked = selectedAnswer === opt.key;
                  const correct = showResult && opt.key === lesson.quiz!.correct;
                  const wrong = showResult && picked && opt.key !== lesson.quiz!.correct;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => { setSelectedAnswer(opt.key); setShowResult(true); }}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                      style={{
                        background: correct ? "#DCFCE7" : wrong ? "#FEE2E2" : picked ? "#FFF3E6" : "#FFF8F0",
                        border: `1.5px solid ${correct ? "#22c55e" : wrong ? "#DC2626" : picked ? "#FF6900" : "#F0E6D8"}`,
                        color: correct ? "#15803d" : wrong ? "#DC2626" : "#1A1200",
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
                {showResult && (
                  <p className="text-xs font-semibold mt-1" style={{ color: isCorrect ? "#15803d" : "#6B5B45" }}>
                    {isCorrect ? "✅ Correct! Well done." : `Not quite — the answer is: ${lesson.quiz!.options.find(o => o.key === lesson.quiz!.correct)?.text}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Points preview */}
          {!isCompleted && !justCompleted && (
            <div className="rounded-xl flex items-center gap-3 mb-4"
              style={{ background: "#FFF3E6", border: "1px solid #F0E6D8", padding: "12px 16px" }}>
              <Zap size={16} style={{ color: "#FF6900" }} />
              <p className="text-sm font-bold" style={{ color: "#FF6900" }}>
                +{lesson.points} pts for completing this lesson
              </p>
            </div>
          )}

          {/* Completion celebration */}
          {justCompleted && (
            <div className="rounded-2xl text-center mb-4 animate-bounce-in"
              style={{ background: "linear-gradient(135deg, #FF6900, #FFB800)", padding: "20px" }}>
              <p className="text-white font-black text-xl">+{lesson.points} pts! 🎉</p>
              <p className="text-white/80 text-sm mt-1">Lesson complete!</p>
            </div>
          )}

          {/* CTA */}
          {!justCompleted && (
            <button
              onClick={handleComplete}
              disabled={!canComplete && !isCompleted}
              className="w-full rounded-2xl font-black text-white text-base active:scale-95 transition-transform disabled:opacity-40"
              style={{
                background: isCompleted ? "#22c55e" : "linear-gradient(135deg, #FF6900, #FFB800)",
                padding: "18px",
              }}
            >
              {isCompleted
                ? "✓ Completed"
                : canComplete
                ? `Mark Complete · +${lesson.points} pts →`
                : "Answer the question to continue"}
            </button>
          )}

          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LESSON CARD
// ─────────────────────────────────────────────────────────────────────────────
function LessonCard({
  lesson,
  isCompleted,
  onClick,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
      style={{
        background: "white",
        border: `1.5px solid ${isCompleted ? "#22c55e" : "#F0E6D8"}`,
        boxShadow: isCompleted ? "0 2px 12px rgba(34,197,94,0.1)" : "0 2px 8px rgba(26,18,0,0.04)",
      }}
    >
      {/* Thumbnail */}
      <div className="relative" style={{ background: lesson.gradient, height: 96 }}>
        {/* Lesson number */}
        <span className="absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ background: "rgba(0,0,0,0.25)", color: "white" }}>
          Lesson {lesson.num}
        </span>

        {/* Duration */}
        <span className="absolute top-3 right-3 text-xs font-semibold"
          style={{ color: "rgba(255,255,255,0.75)" }}>
          {lesson.duration}
        </span>

        {/* Center: emoji + play button */}
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          <span style={{ fontSize: 36 }}>{lesson.emoji}</span>
          {!isCompleted && (
            <div className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.4)" }}>
              <PlayCircle size={22} color="white" fill="white" />
            </div>
          )}
          {isCompleted && (
            <div className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.9)" }}>
              <CheckCircle size={22} color="white" />
            </div>
          )}
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm leading-tight" style={{ color: "#1A1200" }}>{lesson.title}</p>
          <p className="text-xs mt-0.5" style={{ color: "#9C8870" }}>{lesson.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isCompleted && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#FFF3E6", color: "#FF6900" }}>
              +{lesson.points} pts
            </span>
          )}
          {isCompleted
            ? <CheckCircle size={18} style={{ color: "#22c55e" }} />
            : <ChevronRight size={18} style={{ color: "#9C8870" }} />
          }
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATION CARD
// ─────────────────────────────────────────────────────────────────────────────
function CertificationCard({ name, certified }: { name: string; certified: boolean }) {
  if (!certified) {
    const remaining = TOTAL_LESSONS;
    return (
      <div className="rounded-2xl text-center"
        style={{ background: "#FFF3E6", border: "1.5px dashed #FFB800", padding: "24px 20px" }}>
        <Award size={32} style={{ color: "#FFB800", margin: "0 auto 12px" }} />
        <p className="font-black text-base" style={{ color: "#1A1200" }}>Certified MadSquad Seller</p>
        <p className="text-xs mt-1 mb-2" style={{ color: "#6B5B45" }}>
          Complete all {remaining} lessons to unlock your certification badge + {CERT_BONUS} bonus pts
        </p>
        <div className="flex justify-center gap-1.5">
          {LESSONS.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: "#F0E6D8" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #FFB800 0%, #FF6900 100%)" }}>
      <div style={{ padding: "28px 24px" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.25)" }}>
            <Award size={26} color="white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">MadMix Academy</p>
            <p className="text-white font-black text-lg leading-tight">Certified Seller</p>
          </div>
        </div>
        <p className="text-white font-black text-xl mb-1">{name}</p>
        <p className="text-white/70 text-sm">All 5 lessons complete · +{CERT_BONUS} bonus pts earned</p>
        <div className="flex gap-1 mt-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill="rgba(255,255,255,0.9)" color="rgba(255,255,255,0.9)" />
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(0,0,0,0.15)", padding: "12px 24px" }}>
        <p className="text-white/80 text-xs font-semibold">
          🎉 Share this with your customers — they know you know your product.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AcademyPage() {
  const { state, completeLesson } = useApp();
  const { completedLessons, academyCertified, seller } = state;
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null);

  const completedCount = completedLessons.length;
  const progressPct = Math.round((completedCount / TOTAL_LESSONS) * 100);

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* ── Header ── */}
      <div style={{ background: "#1A1200", padding: "48px 20px 28px" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF6900" }}>
              MadMix Academy
            </p>
            <h1 className="text-white font-black leading-tight" style={{ fontSize: 26, letterSpacing: "-0.01em" }}>
              Know the MadMix story.
            </h1>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              The best partners don&apos;t learn marketing tricks — they learn the brand and let it sell itself.
            </p>
          </div>
          {academyCertified && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0"
              style={{ background: "linear-gradient(135deg, #FFB800, #FF6900)" }}>
              <Award size={14} color="white" />
              <span className="text-xs font-black text-white">Certified</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
              {completedCount} of {TOTAL_LESSONS} lessons complete
            </p>
            <p className="text-sm font-black" style={{ color: "#FF6900" }}>{progressPct}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #FF6900, #FFB800)" }} />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "24px 16px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Certification card */}
          <CertificationCard name={seller.name} certified={academyCertified} />

          {/* Points total */}
          <div className="flex items-center justify-between rounded-2xl"
            style={{ background: "white", border: "1px solid #F0E6D8", padding: "14px 20px" }}>
            <p className="text-sm font-bold" style={{ color: "#1A1200" }}>
              Points available from Academy
            </p>
            <div className="flex items-center gap-1.5">
              <Zap size={15} style={{ color: "#FF6900" }} />
              <p className="font-black text-sm" style={{ color: "#FF6900" }}>
                {LESSONS.reduce((s, l) => s + l.points, 0) + CERT_BONUS} pts total
              </p>
            </div>
          </div>

          {/* Lesson cards */}
          {LESSONS.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isCompleted={completedLessons.includes(lesson.id)}
              onClick={() => setOpenLesson(lesson)}
            />
          ))}

          <div style={{ height: 8 }} />
        </div>
      </div>

      {/* ── Lesson overlay ── */}
      {openLesson && (
        <LessonOverlay
          lesson={openLesson}
          isCompleted={completedLessons.includes(openLesson.id)}
          onClose={() => setOpenLesson(null)}
          onComplete={(id, pts) => completeLesson(id, pts)}
        />
      )}
    </div>
  );
}
