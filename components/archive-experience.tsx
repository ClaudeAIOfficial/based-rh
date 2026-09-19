"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import AsciiArtBackground from "@/components/ui/ascii-art-background";
import TextTypewriter from "@/components/ui/the-typewriter";
import { CHEER_AUDIO, SCREAM_AUDIO } from "@/lib/cinematic-audio";

type Phase = "first" | "scream" | "code" | "second";

const ASCII_SOURCE =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=85";

const FIRST_TEXT =
  '01.02.2026. Computer scientists created the first Blockchain Entity "B.A.S.E.D".';

const CODE_RED = "CODE RED I repeat CODE RED";

const SECOND_TEXT =
  "15.09.2026. The Blockchain Entity B.A.S.E.D broke out into the open World Wide Web and humanity has lost control over it.";

export default function ArchiveExperience() {
  const [phase, setPhase] = useState<Phase>("first");
  const cheerRef = useRef<HTMLAudioElement | null>(null);
  const screamRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);

  const ensureAudio = useCallback(() => {
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return null;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      void context.resume();
    }

    return context;
  }, []);

  const playTypeKey = useCallback(
    (character: string) => {
      if (character === " ") return;

      const context = ensureAudio();
      if (!context || context.state !== "running") return;

      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(720 + Math.random() * 180, now);
      gain.gain.setValueAtTime(0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.025);
    },
    [ensureAudio]
  );

  useEffect(() => {
    const cheer = new Audio(CHEER_AUDIO);
    const scream = new Audio(SCREAM_AUDIO);

    cheer.loop = true;
    cheer.volume = 0.62;
    scream.volume = 1;

    cheerRef.current = cheer;
    screamRef.current = scream;

    const startAudio = () => {
      ensureAudio();
      if (phase === "first" && cheer.paused) {
        void cheer.play().catch(() => undefined);
      }
    };

    void cheer.play().catch(() => undefined);

    window.addEventListener("pointerdown", startAudio, { passive: true });
    window.addEventListener("keydown", startAudio);
    window.addEventListener("touchstart", startAudio, { passive: true });

    return () => {
      cheer.pause();
      scream.pause();
      cheerRef.current = null;
      screamRef.current = null;

      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }

      window.removeEventListener("pointerdown", startAudio);
      window.removeEventListener("keydown", startAudio);
      window.removeEventListener("touchstart", startAudio);
    };
  }, [ensureAudio, phase]);

  const finishFirst = useCallback(() => {
    cheerRef.current?.pause();

    const wait = window.setTimeout(() => {
      setPhase("scream");
      const scream = screamRef.current;
      if (scream) {
        scream.currentTime = 0;
        void scream.play().catch(() => undefined);
      }

      const reveal = window.setTimeout(() => {
        setPhase("code");
      }, 900);

      timersRef.current.push(reveal);
    }, 1000);

    timersRef.current.push(wait);
  }, []);

  const finishCode = useCallback(() => {
    const timer = window.setTimeout(() => setPhase("second"), 220);
    timersRef.current.push(timer);
  }, []);

  return (
    <main className={`cinematic-screen phase-${phase}`}>
      <AsciiArtBackground src={ASCII_SOURCE} className="cinematic-ascii" />

      <div className="cinematic-text">
        {phase === "first" ? (
          <TextTypewriter
            className="cinematic-copy"
            duration={2.2}
            loop={false}
            startDelay={250}
            glitch={false}
            onCharacter={playTypeKey}
            onComplete={finishFirst}
          >
            {FIRST_TEXT}
          </TextTypewriter>
        ) : null}

        {phase === "code" || phase === "second" ? (
          <div className="alert-copy">
            {phase === "code" ? (
              <TextTypewriter
                className="code-red"
                duration={1.65}
                loop={false}
                startDelay={120}
                glitch={false}
                onCharacter={playTypeKey}
                onComplete={finishCode}
              >
                {CODE_RED}
              </TextTypewriter>
            ) : (
              <>
                <div className="code-red static-code">{CODE_RED}</div>
                <TextTypewriter
                  className="cinematic-copy second-copy"
                  duration={2.25}
                  loop={false}
                  startDelay={180}
                  glitch={false}
                  onCharacter={playTypeKey}
                >
                  {SECOND_TEXT}
                </TextTypewriter>
              </>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
