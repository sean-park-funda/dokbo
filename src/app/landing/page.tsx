"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const EXAMPLE_POSTS = [
  {
    emoji: "🍜",
    restaurant: "을지면옥",
    location: "을지로",
    menu: "평양냉면",
    quote: "이 면발의 탄력은 여기 아니면 절대 못 느낌",
    agrees: 847,
    challenges: 12,
  },
  {
    emoji: "🔥",
    restaurant: "만포장",
    location: "마포",
    menu: "갈비찜",
    quote: "30년 된 양념장의 깊이... 복제 불가",
    agrees: 623,
    challenges: 8,
  },
  {
    emoji: "🫠",
    restaurant: "진미평양냉면",
    location: "마포",
    menu: "평양냉면",
    quote: "을지면옥이 독보적? ㅋㅋ 여기 한번 와봐",
    agrees: 412,
    challenges: 0,
    isChallenge: true,
    challengeTo: "을지면옥",
  },
  {
    emoji: "🍖",
    restaurant: "연남서식당",
    location: "연남동",
    menu: "된장찌개",
    quote: "3천원 된장찌개인데 어떤 한정식보다 깊다",
    agrees: 389,
    challenges: 5,
  },
  {
    emoji: "🦀",
    restaurant: "프로간장게장",
    location: "신사",
    menu: "간장게장",
    quote: "밥도둑의 끝판왕. 여기 양념은 비밀병기",
    agrees: 556,
    challenges: 15,
  },
];

const REACTIONS = ["🤤", "🔥", "😱", "👏", "💯"];

function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  return (
    <motion.div
      className="absolute text-2xl pointer-events-none select-none"
      initial={{ opacity: 0, y: 100, x: Math.random() * 300 - 150 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [100, -20, -80, -140],
        x: Math.random() * 300 - 150,
        rotate: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 4 + 2,
      }}
    >
      {emoji}
    </motion.div>
  );
}

function TypingText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}

function PostCard({
  post,
  index,
}: {
  post: (typeof EXAMPLE_POSTS)[number];
  index: number;
}) {
  const [agrees, setAgrees] = useState(post.agrees);
  const [voted, setVoted] = useState(false);
  const [showReaction, setShowReaction] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 relative overflow-hidden"
    >
      {post.isChallenge && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
            ⚔️ 도전
          </span>
          <span className="text-xs text-gray-400">
            {post.challengeTo}에 대한 반론
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl shrink-0">
          {post.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#1A1A1A]">{post.restaurant}</h3>
            <span className="text-xs text-gray-400">{post.location}</span>
          </div>
          <span className="text-xs text-[#E54D2E] font-medium">
            {post.menu}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[15px] text-[#1A1A1A]/80 leading-relaxed font-medium">
        &ldquo;{post.quote}&rdquo;
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (!voted) {
                setAgrees((a) => a + 1);
                setVoted(true);
                setShowReaction(true);
                setTimeout(() => setShowReaction(false), 1500);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              voted
                ? "bg-[#E54D2E] text-white"
                : "bg-orange-50 text-[#E54D2E] hover:bg-orange-100"
            }`}
          >
            🙌 인정 {agrees.toLocaleString()}
          </motion.button>

          <AnimatePresence>
            {showReaction && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, y: -20 }}
                className="text-lg"
              >
                🔥
              </motion.span>
            )}
          </AnimatePresence>

          {post.challenges > 0 && (
            <span className="flex items-center gap-1 text-sm text-gray-400">
              ⚔️ {post.challenges}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1500;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      >
        {/* Floating background emojis */}
        <div className="absolute inset-0 flex items-center justify-center">
          {REACTIONS.map((emoji, i) => (
            <FloatingEmoji key={i} emoji={emoji} delay={i * 0.8} />
          ))}
          {["🍜", "🍖", "🦀", "🍕", "🌮"].map((emoji, i) => (
            <FloatingEmoji key={`food-${i}`} emoji={emoji} delay={i * 1.2 + 0.5} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            className="text-7xl mb-6"
          >
            🏆
          </motion.div>

          <h1 className="text-[2.5rem] leading-tight font-black text-[#1A1A1A] mb-4">
            이 맛은
            <br />
            <span className="text-[#E54D2E]">여기 아니면</span>
            <br />
            안 돼.
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-[#1A1A1A]/50 font-medium max-w-xs mx-auto"
          >
            대체 불가능한 맛집을 발견하고
            <br />
            인정하거나, 도전하세요
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex flex-col gap-3"
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#E54D2E] text-white font-bold text-lg rounded-2xl shadow-lg shadow-red-200 hover:bg-[#d4442a] active:scale-95 transition-all"
            >
              독보적 맛집 둘러보기
            </Link>
            <span className="text-sm text-[#1A1A1A]/30">
              가입 없이 바로 시작
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 text-[#1A1A1A]/20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.section>

      {/* Concept Section */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold text-[#E54D2E] tracking-widest uppercase">
              How it works
            </span>
            <h2 className="text-3xl font-black text-[#1A1A1A] mt-3">
              맛집은 많지만
              <br />
              <span className="text-[#E54D2E]">독보적</span>인 곳은 드물다
            </h2>
          </motion.div>

          {/* Step cards */}
          <div className="space-y-6">
            {[
              {
                step: "01",
                icon: "📍",
                title: "독보적 선언",
                desc: "\"이 집 아니면 안 돼!\" 당신만의 대체불가 맛집을 올려주세요.",
                color: "bg-orange-50",
              },
              {
                step: "02",
                icon: "🙌",
                title: "인정 투표",
                desc: "공감하면 \"인정\" 한 표. 인정이 쌓일수록 진짜 독보적 맛집으로 등극합니다.",
                color: "bg-green-50",
              },
              {
                step: "03",
                icon: "⚔️",
                title: "도전 & 반론",
                desc: "\"그 정도면 여기도 있어!\" 더 나은 대안을 제시하며 도전장을 던지세요.",
                color: "bg-amber-50",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`${item.color} rounded-2xl p-6 relative overflow-hidden`}
              >
                <span className="absolute top-4 right-4 text-5xl font-black text-black/[0.04]">
                  {item.step}
                </span>
                <span className="text-3xl">{item.icon}</span>
                <h3 className="text-xl font-bold text-[#1A1A1A] mt-3">
                  {item.title}
                </h3>
                <p className="text-[15px] text-[#1A1A1A]/60 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Feed Preview */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-orange-50/50 to-transparent">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-[#E54D2E] rounded-full text-xs font-bold mb-4">
              <span className="w-1.5 h-1.5 bg-[#E54D2E] rounded-full animate-pulse" />
              LIVE
            </span>
            <h2 className="text-3xl font-black text-[#1A1A1A]">
              지금 올라오는
              <br />
              독보적 선언들
            </h2>
          </motion.div>

          <div className="space-y-4">
            {EXAMPLE_POSTS.map((post, i) => (
              <PostCard key={i} post={post} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Battle Section */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-[#1A1A1A]">
              <span className="text-[#E54D2E]">인정</span> vs{" "}
              <span className="text-amber-500">도전</span>
            </h2>
            <p className="text-[#1A1A1A]/50 mt-2">실시간 맛집 배틀</p>
          </motion.div>

          {/* Battle card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-orange-100"
          >
            <div className="bg-gradient-to-r from-[#E54D2E] to-amber-500 p-4 text-center">
              <span className="text-white font-bold text-lg">
                🍜 평양냉면 최강자는?
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="font-bold text-[#1A1A1A]">을지면옥</div>
                  <div className="text-xs text-gray-400 mt-1">을지로</div>
                  <div className="mt-3 bg-[#E54D2E]/10 rounded-xl py-2">
                    <span className="text-[#E54D2E] font-black text-xl">847</span>
                    <span className="text-xs text-[#E54D2E]/60 ml-1">인정</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black text-gray-200">VS</span>
                </div>

                <div className="flex-1 text-center">
                  <div className="text-3xl mb-2">⚔️</div>
                  <div className="font-bold text-[#1A1A1A]">진미평양냉면</div>
                  <div className="text-xs text-gray-400 mt-1">마포</div>
                  <div className="mt-3 bg-amber-500/10 rounded-xl py-2">
                    <span className="text-amber-600 font-black text-xl">412</span>
                    <span className="text-xs text-amber-600/60 ml-1">인정</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "67%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-[#E54D2E] rounded-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "33%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-amber-400 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>67%</span>
                <span>33%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-[#1A1A1A] text-white">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black">
              독보적인 숫자들
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "독보적 선언", value: 2847, suffix: "개", icon: "📍" },
              { label: "인정 투표", value: 18432, suffix: "회", icon: "🙌" },
              { label: "도전 배틀", value: 892, suffix: "건", icon: "⚔️" },
              { label: "등록 맛집", value: 1203, suffix: "곳", icon: "🏠" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.06] rounded-2xl p-5 text-center border border-white/[0.08]"
              >
                <span className="text-2xl">{stat.icon}</span>
                <div className="text-2xl font-black mt-2 text-[#E54D2E]">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-black text-[#1A1A1A]">
              유저들의 한마디
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                emoji: "😍",
                name: "맛탐험가_김",
                text: "드디어 내가 찾던 서비스... 네이버 리뷰 별점 4.5는 의미없어. 독보적인지가 중요하지.",
              },
              {
                emoji: "🤓",
                name: "먹보_연구원",
                text: "도전 기능이 진짜 꿀잼ㅋㅋ 내가 아는 곳이 더 낫다고 올렸다가 역관광 당함",
              },
              {
                emoji: "🧑‍🍳",
                name: "을지로_직장인",
                text: "점심 뭐먹지 고민 끝. 독보적 인정 많은 곳 가면 됨. 실패 확률 0%",
              },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-orange-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-lg">
                    {review.emoji}
                  </div>
                  <span className="font-bold text-sm text-[#1A1A1A]">
                    {review.name}
                  </span>
                </div>
                <p className="text-[15px] text-[#1A1A1A]/70 leading-relaxed">
                  {review.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-50 to-transparent" />
        <div className="relative z-10 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl mb-6">🔥</div>
            <h2 className="text-3xl font-black text-[#1A1A1A] leading-snug">
              당신이 아는
              <br />
              <span className="text-[#E54D2E]">독보적인 맛집</span>은
              <br />
              어디인가요?
            </h2>
            <p className="text-[#1A1A1A]/40 mt-4 mb-8">
              지금 바로 선언하세요. 가입 필요 없어요.
            </p>

            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-10 py-4 bg-[#E54D2E] text-white font-bold text-lg rounded-2xl shadow-lg shadow-red-200 hover:bg-[#d4442a] active:scale-95 transition-all"
              >
                독보적 선언하러 가기 →
              </Link>
              <Link
                href="/post/new"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#E54D2E] font-bold rounded-2xl border-2 border-[#E54D2E] hover:bg-orange-50 active:scale-95 transition-all"
              >
                첫 번째 맛집 등록하기
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-orange-100">
        <div className="max-w-lg mx-auto">
          <span className="text-xl font-extrabold text-[#E54D2E]">독보적</span>
          <p className="text-xs text-[#1A1A1A]/30 mt-2">
            대체 불가능한 맛의 발견
          </p>
        </div>
      </footer>
    </div>
  );
}
