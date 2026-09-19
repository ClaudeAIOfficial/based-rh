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
  const [showNotice, setShowNotice] = useState(true);
  const [started, setStarted] = useState(false);

  const phaseRef = useRef<Phase>("first");
  const startedRef = useRef(false);
  const soundUnlockedRef = useRef(false);
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

  const unlockSound = useCallback(async () => {
    const cheer = cheerRef.current;
    if (!cheer) return;

    const context = ensureAudio();
    if (context?.state === "suspended") {
      await context.resume().catch(() => undefined);
    }

    if (!soundUnlockedRef.current) {
      cheer.volume = 0;
      cheer.currentTime = 0;

      try {
        await cheer.play();
        soundUnlockedRef.current = true;
      } catch {
        return;
      }
    }

    if (startedRef.current && phaseRef.current === "first") {
      cheer.volume = 0.62;
    }
  }, [ensureAudio]);

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
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const cheer = new Audio(CHEER_AUDIO);
    const scream = new Audio(SCREAM_AUDIO);

    cheer.loop = true;
    cheer.volume = 0;
    cheer.preload = "auto";
    scream.volume = 1;
    scream.preload = "auto";

    cheer.load();
    scream.load();

    cheerRef.current = cheer;
    screamRef.current = scream;

    // Try autoplay. If the browser blocks it, the notice gives the visitor
    // one second to click/tap anywhere and unlock audio.
    void cheer
      .play()
      .then(() => {
        soundUnlockedRef.current = true;
      })
      .catch(() => undefined);

    const onUserGesture = () => {
      void unlockSound();
    };

    window.addEventListener("pointerdown", onUserGesture, { passive: true });
    window.addEventListener("keydown", onUserGesture);
    window.addEventListener("touchstart", onUserGesture, { passive: true });

    const startTimer = window.setTimeout(() => {
      setShowNotice(false);
      startedRef.current = true;
      setStarted(true);

      if (soundUnlockedRef.current) {
        cheer.volume = 0.62;
      }
    }, 1000);

    timersRef.current.push(startTimer);

    return () => {
      cheer.pause();
      scream.pause();
      cheerRef.current = null;
      screamRef.current = null;

      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }

      window.removeEventListener("pointerdown", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
      window.removeEventListener("touchstart", onUserGesture);
    };
  }, [unlockSound]);

  const finishFirst = useCallback(() => {
    cheerRef.current?.pause();

    const wait = window.setTimeout(() => {
      phaseRef.current = "scream";
      setPhase("scream");

      const scream = screamRef.current;
      if (scream && soundUnlockedRef.current) {
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
    <main className={`cinematic-screen phase-${phase}`}>
      <AsciiArtBackground src={ASCII_SOURCE} className="cinematic-ascii" />

      {showNotice ? (
        <div className="sound-notice" onPointerDown={() => void unlockSound()}>
          ENABLE SOUND FOR A BETTER EXPERIENCE
        </div>
      ) : null}

      <div className="cinematic-text">
        {started && phase === "first" ? (
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

        {started && (phase === "code" || phase === "second") ? (
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
