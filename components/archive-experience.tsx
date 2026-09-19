"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import AsciiArtBackground from "@/components/ui/ascii-art-background";
import TextTypewriter from "@/components/ui/the-typewriter";
import { CHEER_AUDIO, SCREAM_AUDIO } from "@/lib/cinematic-audio";

type Phase = "notice" | "first" | "scream" | "code" | "second";

const ASCII_SOURCE =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=85";

const FIRST_TEXT =
  '01.02.2026 — Computer scientists created the first blockchain entity: "B.A.S.E.D."';

const CODE_RED = "CODE RED. I repeat: CODE RED.";

const SECOND_TEXT =
  "15.09.2026 — The blockchain entity B.A.S.E.D. broke out onto the open World Wide Web. Humanity has lost control of it.";

export default function ArchiveExperience() {
  const [phase, setPhase] = useState<Phase>("notice");
  const phaseRef = useRef<Phase>("notice");
  const hasStartedRef = useRef(false);
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
      oscillator.frequency.setValueAtTime(690 + Math.random() * 230, now);
      gain.gain.setValueAtTime(0.022, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.03);
    },
    [ensureAudio]
  );

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const cheer = new Audio(CHEER_AUDIO);
    const scream = new Audio(SCREAM_AUDIO);

    cheer.loop = true;
    cheer.volume = 0.62;
    cheer.preload = "auto";
    scream.volume = 1;
    scream.preload = "auto";

    cheer.load();
    scream.load();

    cheerRef.current = cheer;
    screamRef.current = scream;

    return () => {
      cheer.pause();
      scream.pause();

      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }

      audioContextRef.current?.close().catch(() => undefined);
    };
  }, []);

  const beginExperience = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const context = ensureAudio();
    if (context?.state === "suspended") {
      await context.resume().catch(() => undefined);
    }

    // Prime both user-provided sounds inside the click gesture so browsers
    // allow playback later in the sequence.
    const cheer = cheerRef.current;
    const scream = screamRef.current;

    if (cheer) {
      cheer.volume = 0;
      cheer.currentTime = 0;
      await cheer.play().catch(() => undefined);
      cheer.pause();
      cheer.currentTime = 0;
      cheer.volume = 0.62;
    }

    if (scream) {
      scream.volume = 0;
      scream.currentTime = 0;
      await scream.play().catch(() => undefined);
      scream.pause();
      scream.currentTime = 0;
      scream.volume = 1;
    }

    const startTimer = window.setTimeout(() => {
      phaseRef.current = "first";
      setPhase("first");

      if (cheer) {
        cheer.currentTime = 0;
        void cheer.play().catch(() => undefined);
      }
    }, 1000);

    timersRef.current.push(startTimer);
  }, [ensureAudio]);

  const finishFirst = useCallback(() => {
    const wait = window.setTimeout(() => {
      cheerRef.current?.pause();

      phaseRef.current = "scream";
      setPhase("scream");

      const scream = screamRef.current;
      if (scream) {
        scream.currentTime = 0;
        void scream.play().catch(() => undefined);
      }

      const reveal = window.setTimeout(() => {
        phaseRef.current = "code";
        setPhase("code");
      }, 900);

      timersRef.current.push(reveal);
    }, 1000);

    timersRef.current.push(wait);
  }, []);

  const finishCode = useCallback(() => {
    const timer = window.setTimeout(() => {
      phaseRef.current = "second";
      setPhase("second");
    }, 220);

    timersRef.current.push(timer);
  }, []);

  return (
    <main
      className={`cinematic-screen phase-${phase}`}
      onPointerDown={phase === "notice" ? beginExperience : undefined}
      onKeyDown={phase === "notice" ? beginExperience : undefined}
      role={phase === "notice" ? "button" : undefined}
      tabIndex={phase === "notice" ? 0 : undefined}
      aria-label={
        phase === "notice" ? "Click anywhere to enable sound." : undefined
      }
    >
      <AsciiArtBackground src={ASCII_SOURCE} className="cinematic-ascii" />

      {phase === "notice" ? (
        <div className="sound-notice">CLICK ANYWHERE TO ENABLE SOUND.</div>
      ) : null}

      <div className="cinematic-text">
        {phase === "first" ? (
          <TextTypewriter
            className="cinematic-copy"
            duration={2.2}
            loop={false}
            startDelay={250}
            glitch
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
                glitch
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
                  glitch
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
