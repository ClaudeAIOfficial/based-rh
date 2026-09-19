"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { MotionConfig, useReducedMotion } from "motion/react";
import { createContext, useContext } from "react";

interface ReducedMotionProp {
  reducedMotion?: boolean;
}

const ReducedMotionOverrideContext = createContext(false);

function useResolvedReducedMotion(reducedMotion?: boolean) {
  const reducedMotionOverride = useContext(ReducedMotionOverrideContext);
  const prefersReducedMotion = useReducedMotion() ?? false;

  return Boolean(
    reducedMotion || reducedMotionOverride || prefersReducedMotion
  );
}

function ReducedMotionConfig({
  children,
  reducedMotion,
}: ReducedMotionProp & {
  children: import("react").ReactNode;
}) {
  const resolvedReducedMotion = useResolvedReducedMotion(reducedMotion);

  return (
    <MotionConfig reducedMotion={resolvedReducedMotion ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}

export interface TextTypewriterProps {
  children: string;
  className?: string;
  duration?: number;
  loop?: boolean;
  startDelay?: number;
  glitch?: boolean;
  onComplete?: () => void;
  onCharacter?: (character: string) => void;
  targetDurationMs?: number;
}

const WRONG_CHARS = "!@#$%^&*()QWERTY";

function randomWrongChar() {
  return WRONG_CHARS[Math.floor(Math.random() * WRONG_CHARS.length)];
}

export default function TextTypewriter({
  children,
  className,
  duration = 3,
  loop = true,
  startDelay = 500,
  glitch = true,
  onComplete,
  onCharacter,
  targetDurationMs,
}: TextTypewriterProps) {
  const reducedMotion = useResolvedReducedMotion();
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setText(children);
      setShowCursor(false);
      onComplete?.();
      return;
    }

    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const speed = duration / 3;

    const schedule = (callback: () => void, ms: number) => {
      const id = setTimeout(callback, ms * speed);
      timeouts.add(id);
    };

    const scheduleRaw = (callback: () => void, ms: number) => {
      const id = setTimeout(callback, ms);
      timeouts.add(id);
    };

    if (targetDurationMs && targetDurationMs > 0) {
      const finalText = children;
      const slot = targetDurationMs / Math.max(1, finalText.length);

      setText("");
      setShowCursor(true);

      finalText.split("").forEach((targetChar, index) => {
        const base = startDelay + index * slot;
        const prefix = finalText.slice(0, index);
        const shouldGlitch =
          glitch && Math.random() > 0.6 && targetChar !== " ";

        if (shouldGlitch) {
          const wrongChar = randomWrongChar();

          scheduleRaw(() => {
            setText(prefix + wrongChar);
            onCharacter?.(wrongChar);
          }, base);

          if (Math.random() > 0.5) {
            const secondWrongChar = randomWrongChar();
            scheduleRaw(() => {
              setText(prefix + secondWrongChar);
              onCharacter?.(secondWrongChar);
            }, base + slot * 0.34);
          }

          scheduleRaw(() => {
            setText(prefix + targetChar);
            onCharacter?.(targetChar);
          }, base + slot * 0.68);
        } else {
          scheduleRaw(() => {
            setText(prefix + targetChar);
            onCharacter?.(targetChar);
          }, base + slot * 0.32);
        }
      });

      scheduleRaw(() => {
        setText(finalText);
        setShowCursor(false);
        onComplete?.();

        if (loop) {
          scheduleRaw(() => {
            setShowCursor(true);
            setText("");
          }, 1000);
        }
      }, startDelay + targetDurationMs);

      return () => {
        for (const id of timeouts) {
          clearTimeout(id);
        }
        timeouts.clear();
      };
    }

    const runAnimation = () => {
      let currentText = "";
      let targetIndex = 0;
      const finalText = children;

      const commitCharacter = (character: string) => {
        currentText += character;
        setText(currentText);
        targetIndex += 1;
        onCharacter?.(character);
        schedule(typeChar, 40 + Math.random() * 80);
      };

      const typeChar = () => {
        if (targetIndex >= finalText.length) {
          setText(finalText);
          setShowCursor(false);
          onComplete?.();

          if (loop) {
            schedule(() => {
              setShowCursor(true);
              runAnimation();
            }, 1000);
          }
          return;
        }

        const targetChar = finalText[targetIndex];
        const shouldGlitch =
          glitch && Math.random() > 0.6 && targetChar !== " ";

        if (shouldGlitch) {
          const wrongChar = randomWrongChar();
          currentText += wrongChar;
          setText(currentText);
          onCharacter?.(wrongChar);

          schedule(
            () => {
              currentText = currentText.slice(0, -1);
              setText(currentText);

              schedule(() => {
                if (Math.random() > 0.5) {
                  const wrongChar = randomWrongChar();
                  currentText += wrongChar;
                  setText(currentText);
                  onCharacter?.(wrongChar);

                  schedule(() => {
                    currentText = currentText.slice(0, -1);
                    setText(currentText);
                    schedule(() => commitCharacter(targetChar), 80);
                  }, 120);
                } else {
                  commitCharacter(targetChar);
                }
              }, 80);
            },
            100 + Math.random() * 150
          );
        } else {
          commitCharacter(targetChar);
        }
      };

      setText("");
      setShowCursor(true);
      schedule(typeChar, startDelay);
    };

    runAnimation();

    return () => {
      for (const id of timeouts) {
        clearTimeout(id);
      }
      timeouts.clear();
    };
  }, [
    children,
    duration,
    glitch,
    loop,
    onCharacter,
    onComplete,
    reducedMotion,
    startDelay,
    targetDurationMs,
  ]);

  return (
    <div className={cn(className)}>
      <span aria-live="polite">
        {text}
        {showCursor ? (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            aria-hidden
            transition={{
              duration: 0.8,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            |
          </motion.span>
        ) : null}
      </span>
    </div>
  );
}

export { ReducedMotionConfig };
