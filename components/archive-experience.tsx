"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import NewsArchive from "@/components/news-archive";
import AsciiArtBackground from "@/components/ui/ascii-art-background";
import TextTypewriter from "@/components/ui/the-typewriter";

type Phase = "notice" | "intro" | "news";

const ASCII_SOURCE =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=85";

const TYPEWRITER_AUDIO =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_3DFeZk0LqgiFcue7STVOyiCo13m/45316149-6951-4d5a-92a0-ae1ec1c371f0.mp3";

const INTRO_TEXT =
  "Since the blockchain entity B.A.S.E.D. broke out onto the World Wide Web, strange things have been happening on Wall Street. Wall Street’s corporate secrets are being leaked, stocks are being randomly put onchain, shareholders are losing their stocks, and those same stocks are appearing in different wallets.";

const TYPE_DURATION_MS = 5085;
const HOLD_AFTER_TEXT_MS = 900;

export default function ArchiveExperience() {
  const [phase, setPhase] = useState<Phase>("notice");
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  const beginExperience = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.9;
      void audio.play().catch(() => undefined);
    }

    setPhase("intro");
  }, []);

  const finishIntro = useCallback(() => {
    timerRef.current = window.setTimeout(() => {
      setPhase("news");
    }, HOLD_AFTER_TEXT_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      audioRef.current?.pause();
    };
  }, []);

  if (phase === "news") {
    return <NewsArchive />;
  }

  return (
    <main
      className="cinematic-screen phase-intro"
      onPointerDown={phase === "notice" ? beginExperience : undefined}
      onKeyDown={phase === "notice" ? beginExperience : undefined}
      role={phase === "notice" ? "button" : undefined}
      tabIndex={phase === "notice" ? 0 : undefined}
      aria-label={
        phase === "notice" ? "Click anywhere to enable sound and begin." : undefined
      }
    >
      <audio ref={audioRef} src={TYPEWRITER_AUDIO} preload="auto" />

      <AsciiArtBackground src={ASCII_SOURCE} className="cinematic-ascii" />

      {phase === "notice" ? (
        <div className="relative z-[3] rounded-md border border-white/10 bg-black/35 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 backdrop-blur-sm sm:text-[11px]">
          Click anywhere to enable sound
        </div>
      ) : (
        <div className="cinematic-text">
          <TextTypewriter
            className="cinematic-copy"
            duration={1}
            loop={false}
            startDelay={0}
            targetDurationMs={TYPE_DURATION_MS}
            glitch
            onComplete={finishIntro}
          >
            {INTRO_TEXT}
          </TextTypewriter>
        </div>
      )}
    </main>
  );
}
