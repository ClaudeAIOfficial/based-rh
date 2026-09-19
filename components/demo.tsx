"use client";

import TextTypewriter from "@/components/ui/the-typewriter";

export function TerminalHeadline() {
  return (
    <TextTypewriter
      className="font-mono text-2xl text-foreground sm:text-4xl"
      duration={2.6}
    >
      Deploying interface motion
    </TextTypewriter>
  );
}

export default TerminalHeadline;
