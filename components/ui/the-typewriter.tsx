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
