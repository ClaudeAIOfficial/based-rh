"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import AsciiArtBackground from "@/components/ui/ascii-art-background";
import TextTypewriter from "@/components/ui/the-typewriter";
import NewsArchive from "@/components/news-archive";
import { CHEER_AUDIO, SCREAM_AUDIO } from "@/lib/cinematic-audio";

type Phase = "notice" | "first" | "scream" | "code" | "second" | "news";

const ASCII_SOURCE =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=85";

const FIRST_TEXT =
  '01.02.2026 — Computer scientists created the first blockchain entity: "B.A.S.E.D."';

const CODE_RED = "CODE RED. I repeat: CODE RED.";

const SECOND_TEXT =
  "15.09.2026 — The blockchain entity B.A.S.E.D. broke out onto the open World Wide Web. Humanity has lost control of it.";

const CHEER_DURATION_MS = 3605;
const FIRST_HOLD_MS = 1000;
const SCREAM_DURATION_MS = 5251;
const CODE_DURATION_MS = 850;
const CODE_GAP_MS = 160;
const SECOND_DURATION_MS = 2200;
const INTRO_TIMELINE_MS =
  CHEER_DURATION_MS +
  FIRST_HOLD_MS +
  SCREAM_DURATION_MS +
  CODE_DURATION_MS +
  CODE_GAP_MS +
  SECOND_DURATION_MS;

const TRANSITION_VIDEO_DURATION_MS = 6042;
const TRANSITION_PLAYBACK_RATE =
  TRANSITION_VIDEO_DURATION_MS / INTRO_TIMELINE_MS;

const TRANSITION_VIDEO =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_3DFeZk0LqgiFcue7STVOyiCo13m/0a303a86-7524-4c8d-abfe-76e57a1854b7.mp4";

export default function ArchiveExperience() {
  const [phase, setPhase] = useState<Phase>("notice");
  const phaseRef = useRef<Phase>("notice");
  const hasStartedRef = useRef(false);
  const cheerRef = useRef<HTMLAudioElement | null>(null);
  const screamRef = useRef<HTMLAudioElement | null>(null);
  const transitionVideoRef = useRef<HTMLVideoElement | null>(null);
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
      oscillator.frequency.setValueAtTime(720 + Math.random() * 260, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.021);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.024);
    },
    [ensureAudio]
  );

  const playScreamFallback = useCallback(() => {
    const context = ensureAudio();
    if (!context || context.state !== "running") return;

    const now = context.currentTime;
    const noiseBuffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * 0.8),
      context.sampleRate
    );
    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    noise.buffer = noiseBuffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1500, now);
    filter.Q.value = 0.65;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.32, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    noise.connect(filter).connect(gain).connect(context.destination);
    noise.start(now);
  }, [ensureAudio]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const cheer = new Audio(CHEER_AUDIO);
    const scream = new Audio(SCREAM_AUDIO);

    cheer.loop = false;
    cheer.volume = 0;
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

    const cheer = cheerRef.current;
    const scream = screamRef.current;

    // Start the cheer inside the actual click gesture, muted.
    // One second later we rewind + unmute without asking the browser to play again.
    if (cheer) {
      cheer.currentTime = 0;
      cheer.volume = 0;
      await cheer.play().catch(() => undefined);
    }

    // Prime the scream inside the same gesture so later playback is permitted.
    if (scream) {
      scream.currentTime = 0;
      scream.volume = 0;
      await scream.play().catch(() => undefined);
      scream.pause();
      scream.currentTime = 0;
      scream.volume = 1;
    }

    const startTimer = window.setTimeout(() => {
      phaseRef.current = "first";
      setPhase("first");

      const transitionVideo = transitionVideoRef.current;
      if (transitionVideo) {
        transitionVideo.pause();
        transitionVideo.currentTime = 0;
        transitionVideo.muted = true;
        transitionVideo.defaultPlaybackRate = TRANSITION_PLAYBACK_RATE;
        transitionVideo.playbackRate = TRANSITION_PLAYBACK_RATE;
        void transitionVideo.play().catch(() => undefined);
      }

      if (cheer) {
        cheer.currentTime = 0;
        cheer.volume = 0.9;

        if (cheer.paused) {
          void cheer.play().catch(() => undefined);
        }
      }
    }, 1000);

    timersRef.current.push(startTimer);
  }, [ensureAudio]);

  const finishFirst = useCallback(() => {
    cheerRef.current?.pause();

    const wait = window.setTimeout(() => {
      phaseRef.current = "scream";
      setPhase("scream");

      const scream = screamRef.current;
      if (scream) {
        scream.currentTime = 0;
        scream.volume = 1;
        void scream.play().catch(() => playScreamFallback());
      } else {
        playScreamFallback();
      }

      const reveal = window.setTimeout(() => {
        phaseRef.current = "code";
        setPhase("code");
      }, SCREAM_DURATION_MS);

      timersRef.current.push(reveal);
    }, FIRST_HOLD_MS);

    timersRef.current.push(wait);
  }, [playScreamFallback]);

  const finishCode = useCallback(() => {
    const timer = window.setTimeout(() => {
      phaseRef.current = "second";
      setPhase("second");
    }, CODE_GAP_MS);

    timersRef.current.push(timer);
  }, []);

  const finishSecond = useCallback(() => {
    const transitionVideo = transitionVideoRef.current;
    if (transitionVideo) {
      transitionVideo.pause();
      if (Number.isFinite(transitionVideo.duration)) {
        transitionVideo.currentTime = transitionVideo.duration;
      }
    }

    phaseRef.current = "news";
    setPhase("news");
  }, []);

  if (phase === "news") {
    return <NewsArchive />;
  }

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

      {phase !== "notice" ? (
        <video
          ref={transitionVideoRef}
          className="cinematic-transition-video"
          src={TRANSITION_VIDEO}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      ) : null}

      {phase === "notice" ? (
        <div className="sound-notice">CLICK ANYWHERE TO ENABLE SOUND.</div>
      ) : null}

      <div className="cinematic-text">
        {phase === "first" ? (
          <TextTypewriter
            className="cinematic-copy"
            duration={1}
            loop={false}
            startDelay={0}
            targetDurationMs={CHEER_DURATION_MS}
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
                duration={1}
                loop={false}
                startDelay={0}
                targetDurationMs={CODE_DURATION_MS}
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
                  duration={1}
                  loop={false}
                  startDelay={0}
                  targetDurationMs={SECOND_DURATION_MS}
                  glitch
                  onCharacter={playTypeKey}
                  onComplete={finishSecond}
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
