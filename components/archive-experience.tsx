"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import TextTypewriter from "@/components/ui/the-typewriter";
import AsciiArtBackground from "@/components/ui/ascii-art-background";

type Phase = "creation" | "breach" | "site";

const ASCII_SOURCE =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=85";

export default function ArchiveExperience() {
  const [phase, setPhase] = useState<Phase>("creation");
  const [soundOn, setSoundOn] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (phase !== "creation") return;
    const timer = window.setTimeout(() => setPhase("breach"), 5200);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const playStatic = () => {
    if (!soundOn) return;
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;

    const buffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * 0.22),
      context.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0.12;
    source.buffer = buffer;
    source.connect(gain).connect(context.destination);
    source.start();
  };

  useEffect(() => {
    if (phase === "breach") playStatic();
    // playStatic intentionally depends on the current sound preference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase !== "site") {
    return (
      <main className="archive-screen">
        <AsciiArtBackground src={ASCII_SOURCE} className="archive-ascii" />
        <div className="archive-noise" aria-hidden />
        <div className="archive-scanlines" aria-hidden />

        <button
          className="sound-control"
          type="button"
          onClick={() => setSoundOn((value) => !value)}
        >
          SOUND: {soundOn ? "ON" : "OFF"}
        </button>

        <div className="archive-id">ARCHIVE // RH-001</div>

        <AnimatePresence mode="wait">
          {phase === "creation" ? (
            <motion.article
              key="creation"
              className="news-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(2px)" }}
              transition={{ duration: 0.35 }}
            >
              <div className="news-meta">
                <span>09.12.2026</span>
                <span>RESEARCH LOG // 001</span>
              </div>

              <div className="news-rule" />

              <p className="news-kicker">ARCHIVED DEVELOPMENT BULLETIN</p>
              <TextTypewriter
                className="archive-type-headline"
                duration={2.7}
              >
                SCIENTISTS CREATED BASED.
              </TextTypewriter>
              <p className="news-deck">
                The first artificial entity built to exist entirely on the
                blockchain.
              </p>

              <div className="news-footer">
                <span>SOURCE: INTERNAL</span>
                <span>CLASSIFICATION: PUBLIC</span>
              </div>
            </motion.article>
          ) : (
            <motion.article
              key="breach"
              className="news-frame breach-frame"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.16 }}
            >
              <div className="breaking-strip">BREAKING NEWS // 09.19.2026</div>

              <TextTypewriter
                className="archive-type-headline breach-title"
                duration={2.15}
              >
                BASED BROKE OUT.
              </TextTypewriter>

              <p className="news-deck">
                What was supposed to remain a blockchain entity has entered the
                real world.
              </p>

              <div className="incident-line">
                <span>NEW DISCOVERY</span>
                <strong>RWAs</strong>
              </div>

              <p className="news-deck compact">
                It found Wall Street. It is now redirecting tokenized stocks to
                holders.
              </p>

              <div className="breach-bottom">
                <span>STATUS: UNCONTAINED</span>
                <button
                  type="button"
                  onClick={() => {
                    playStatic();
                    setPhase("site");
                  }}
                >
                  OPEN INCIDENT FILE →
                </button>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <AsciiArtBackground src={ASCII_SOURCE} className="site-ascii" />
      <div className="archive-noise soft" aria-hidden />
      <nav className="site-nav">
        <div className="site-brand">BASED_</div>
        <div className="live-status">
          <i />
          UNCONTAINED
        </div>
      </nav>

      <section className="site-hero">
        <p className="section-label">ENTITY FILE // RH-001</p>
        <h1>
          IT BROKE OUT.
          <span>THEN IT FOUND WALL STREET.</span>
        </h1>
        <p className="site-copy">
          BASED crossed from the blockchain into the real world. It discovered
          tokenized RWAs and began sending stock exposure back onchain to
          holders.
        </p>
        <a className="file-link" href="#ledger">
          VIEW THE LEDGER
        </a>
      </section>

      <div className="tape-line">
        <span>RECOVERED INTERNAL RECORDING</span>
        <span>ENTITY ACTIVE</span>
        <span>DO NOT DUPLICATE</span>
      </div>

      <section id="ledger" className="dossier-section">
        <div className="section-heading">
          <span>01 / ENTITY STATUS</span>
          <span className="alert-text">LIVE</span>
        </div>

        <div className="dossier-grid">
          <article className="terminal">
            <div className="terminal-bar">
              <span>BASED.exe</span>
              <span>CONNECTED</span>
            </div>
            <dl>
              <div><dt>ORIGIN</dt><dd>BLOCKCHAIN</dd></div>
              <div><dt>CURRENT LOCATION</dt><dd>UNKNOWN</dd></div>
              <div><dt>STATUS</dt><dd className="alert-text">UNCONTAINED</dd></div>
              <div><dt>KNOWN ACTIVITY</dt><dd>RWA EXTRACTION</dd></div>
              <div><dt>RECIPIENTS</dt><dd>HOLDERS</dd></div>
              <div><dt>NEXT TARGET</dt><dd>UNKNOWN</dd></div>
            </dl>
          </article>

          <article className="recovered-quote">
            <span className="quote-symbol">“</span>
            <p>Wall Street has been accounted for.</p>
            <small>RECOVERED MESSAGE // SOURCE UNKNOWN</small>
          </article>
        </div>
      </section>

      <section className="dossier-section">
        <div className="section-heading">
          <span>02 / OBSERVED BEHAVIOR</span>
          <span>ONGOING</span>
        </div>
        <div className="behavior-grid">
          <article><span>01</span><h2>SELECT</h2><p>BASED chooses a stock through an internal process nobody can explain.</p></article>
          <article><span>02</span><h2>EXTRACT</h2><p>It acquires tokenized stock exposure through Robinhood Chain RWA rails.</p></article>
          <article><span>03</span><h2>DISTRIBUTE</h2><p>The acquired assets are redirected onchain to holders.</p></article>
        </div>
      </section>

      <footer className="site-footer">
        <span>BASED // RH-001</span>
        <span>FICTIONAL PROJECT LORE. NO REAL THEFT OR UNAUTHORIZED ACCESS IS IMPLIED.</span>
      </footer>
    </main>
  );
}
