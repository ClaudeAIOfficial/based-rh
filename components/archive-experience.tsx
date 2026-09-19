"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import NewsArchive from "@/components/news-archive";
import AsciiArtBackground from "@/components/ui/ascii-art-background";
import TextTypewriter from "@/components/ui/the-typewriter";

type Phase = "intro" | "news";

const ASCII_SOURCE =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=85";

const INTRO_TEXT =
  "Since the blockchain entity B.A.S.E.D. broke out onto the World Wide Web, strange things have been happening on Wall Street. Wall Street’s corporate secrets are being leaked, stocks are being randomly put onchain, shareholders are losing their stocks, and those same stocks are appearing in different wallets.";

const TYPE_DURATION_MS = 5085;
const HOLD_AFTER_TEXT_MS = 900;

export default function ArchiveExperience() {
  const [phase, setPhase] = useState<Phase>("intro");
  const timerRef = useRef<number | null>(null);

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
    };
  }, []);

  if (phase === "news") {
    return <NewsArchive />;
  }

  return (
    <main className="cinematic-screen phase-intro">
      <AsciiArtBackground src={ASCII_SOURCE} className="cinematic-ascii" />

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
    </main>
  );
}
