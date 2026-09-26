"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Gallery from "@/components/Gallery";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cake,
  PartyPopper,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  LockKeyhole,
  MessageCircleHeart,
} from "lucide-react";
const BIRTHDAY_MONTH = 8; // September (0-indexed)
const BIRTHDAY_DAY = 27;
const testNow = process.env.NEXT_PUBLIC_BIRTHDAY_TEST_NOW;
const birthdayAudioEnabled = process.env.NEXT_PUBLIC_BIRTHDAY_AUDIO_ENABLED === "true";

function getClockNow() {
  if (testNow) {
    const parsed = new Date(testNow);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return new Date();
}

function getBirthdayTarget(now: Date) {
  let year = now.getFullYear();
  const target = new Date(year, BIRTHDAY_MONTH, BIRTHDAY_DAY, 0, 0, 0);
  if (now >= target && now.getDate() !== BIRTHDAY_DAY) {
    // After this year's birthday, the experience remains open until the next September 27.
    return target;
  }
  if (now > target)
    return new Date(year + 1, BIRTHDAY_MONTH, BIRTHDAY_DAY, 0, 0, 0);
  return target;
}

// Sprinkles instead of plain confetti — varied shapes and bakery colors.
function Sprinkles() {
  const colors = [
    "var(--frosting)",
    "var(--gold)",
    "var(--cream)",
    "var(--caramel)",
  ];
  const pieces = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.9}s`,
        duration: `${2.5 + Math.random() * 2.5}s`,
        color: colors[i % colors.length],
        width: `${3 + Math.random() * 3}px`,
        height: `${8 + Math.random() * 6}px`,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-20px] rounded-full"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            background: p.color,
          }}
          initial={{ y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 720 }}
          transition={{
            duration: Number(p.duration.replace("s", "")),
            delay: Number(p.delay.replace("s", "")),
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

// Floating cupcakes drifting up the screen, replacing the old hearts.
function FloatingTreats() {
  const treats = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {treats.map((i) => (
        <motion.div
          key={i}
          className="absolute text-[var(--frosting)]/25"
          style={{
            left: `${(i * 21 + 4) % 100}%`,
            bottom: `-${20 + (i % 5) * 20}px`,
          }}
          animate={{
            y: [-20, -viewportHeight * 0.95],
            x: [0, (i % 2 ? 1 : -1) * 35],
            rotate: [-8, 12, -5],
          }}
          transition={{
            duration: 9 + (i % 5),
            repeat: Infinity,
            delay: i * 0.4,
            ease: "linear",
          }}
        >
          <Cake size={16 + (i % 4) * 6} />
        </motion.div>
      ))}
    </div>
  );
}

export default function BirthdayExperience() {
  const [now, setNow] = useState(getClockNow);
  const [entered, setEntered] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const target = getBirthdayTarget(now);
  const isBirthday =
    now.getMonth() === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY;

  useEffect(() => {
    const timer = setInterval(() => setNow(getClockNow()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  useEffect(() => {
    if (!entered || !isBirthday || !audioRef.current) return;
    const audio = audioRef.current;
    audio.currentTime = 0;
    if (soundOn) {
      audio.play().catch(() => {});
    }
    const fadeTimer = window.setTimeout(() => {
      const fade = window.setInterval(() => {
        if (!audio || audio.paused) {
          window.clearInterval(fade);
          return;
        }
        audio.volume = Math.max(0, audio.volume - 0.08);
        if (audio.volume <= 0.02) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
          window.clearInterval(fade);
        }
      }, 120);
    }, 8500);
    return () => window.clearTimeout(fadeTimer);
  }, [entered, isBirthday, soundOn]);

  const enter = () => {
    setEntered(true);
    if (soundOn) window.setTimeout(() => audioRef.current?.play().catch(() => {}), 50);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      {birthdayAudioEnabled && <audio ref={audioRef} autoPlay loop src="/audio/happy-birthday.mp3" preload="auto" />}

      <FloatingTreats />
      <div className="noise pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none fixed left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[var(--frosting)]/10 blur-[100px]" />

      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.section
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
            transition={{ duration: 0.65 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10"
          >
            <div className="w-full max-w-xl text-center">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 12 }}
                className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--frosting)]/25 bg-[var(--frosting)]/10 text-[var(--gold)]"
              >
                <LockKeyhole size={25} />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3 text-xs uppercase tracking-[.35em] text-[var(--gold)]/70"
              >
                A little surprise, baking
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-semibold tracking-tight sm:text-6xl"
              >
                {isBirthday ? "It's finally time." : "Not quite yet…"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/55"
              >
                {isBirthday
                  ? "Someone has been waiting to show you something."
                  : "Come back when the clock reaches September 27. Something made especially for you will be waiting."}
              </motion.p>

              {!isBirthday && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mx-auto mt-9 grid max-w-sm grid-cols-4 gap-2"
                >
                  {[
                    ["Days", days],
                    ["Hours", hours],
                    ["Min", minutes],
                    ["Sec", seconds],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-2xl border border-white/10 bg-white/[.035] p-3 backdrop-blur"
                    >
                      <div className="text-2xl font-semibold tabular-nums text-white">
                        {String(value).padStart(2, "0")}
                      </div>
                      <div className="mt-1 text-[9px] uppercase tracking-[.2em] text-white/35">
                        {label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {isBirthday && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={enter}
                  className="group relative mt-9 inline-flex items-center gap-3 overflow-hidden rounded-full bg-[var(--frosting-deep)] px-7 py-4 text-sm font-semibold text-[var(--choc)] shadow-[0_0_45px_rgba(255,138,168,.3)]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
                  <Sparkles size={17} />
                  Open your surprise
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </motion.button>
              )}

              {birthdayAudioEnabled && (
                <button onClick={() => setSoundOn((value) => !value)} className="fixed bottom-5 right-5 z-30 rounded-full border border-white/15 bg-[var(--bg)]/80 px-4 py-2 text-xs text-white/70 backdrop-blur">
                  {soundOn ? "Music on" : "Music off"}
                </button>
              )}

            </div>
          </motion.section>
        ) : (
          <motion.section
            key="birthday"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12"
          >
            <Sprinkles />

            <div className="w-full max-w-2xl text-center">
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 130, damping: 10 }}
                className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--frosting)]/10 text-[var(--gold)]"
              >
                <Cake size={38} />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-xs uppercase tracking-[.4em] text-[var(--gold)]/70"
              >
                September 27 ✨
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-5 text-5xl font-semibold leading-[.95] tracking-tight sm:text-7xl"
              >
                Happy Birthday
                <br />
                <span className="bg-gradient-to-r from-[var(--cream)] via-[var(--gold)] to-[var(--frosting)] bg-clip-text text-transparent">
                  beautiful.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mx-auto mt-7 max-w-lg text-sm leading-7 text-white/55"
              >
                I made this little corner of the internet just for you. There
                are a few things waiting for you inside.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25 }}
                className="mt-9 flex flex-col items-center gap-3"
              >
                <button
                  onClick={() => setShowMessage(true)}
                  className="group inline-flex items-center gap-3 rounded-full border border-[var(--frosting)]/30 bg-[var(--frosting)]/10 px-6 py-3 text-sm text-[var(--cream)] backdrop-blur transition hover:bg-[var(--frosting)]/20"
                >
                  There's something I want you to see
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
                <Link
                  href="/room"
                  className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[.04] px-6 py-3 text-sm text-white/70 backdrop-blur transition hover:bg-white/[.08]"
                >
                  <MessageCircleHeart size={16} />
                  Enter our private room
                </Link>
                <button
                  onClick={() => setSoundOn((v) => !v)}
                  className="text-xs text-white/30 hover:text-white/60"
                >
                  {soundOn ? "Mute birthday song" : "Turn birthday song on"}
                </button>
              </motion.div>
              <AnimatePresence>
                {showMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="mx-auto mt-10 max-w-md rounded-3xl border border-white/10 bg-white/[.045] p-6 text-left backdrop-blur-xl"
                  >
                    <div className="mb-4 flex items-center gap-2 text-[var(--gold)]">
                      <PartyPopper size={16} />
                      <span className="text-xs uppercase tracking-[.25em]">
                        A little note
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-white/70">
                      I hope today gives you plenty of reasons to smile. You
                      deserve a beautiful day, beautiful memories, and people
                      who genuinely appreciate having you around. ❤️
                    </p>
                    <Gallery />
                    <button
                      onClick={() => setShowMessage(false)}
                      className="mt-5 text-xs text-white/35 hover:text-white/70"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
