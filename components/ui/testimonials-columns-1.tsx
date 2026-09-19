"use client";

import React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export type NewsColumnItem = {
  id: string;
  headline: string;
  deck: string;
  image: string;
  name: string;
  role: string;
  publication: string;
  date: string;
  section: string;
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: NewsColumnItem[];
  duration?: number;
  onSelect?: (id: string) => void;
}) => {
  return (
    <div className={cn("w-full max-w-sm", props.className)}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-5 pb-5"
      >
        {new Array(2).fill(0).map((_, loopIndex) => (
          <React.Fragment key={loopIndex}>
            {props.testimonials.map((item) => (
              <button
                type="button"
                key={`${loopIndex}-${item.id}`}
                onClick={() => props.onSelect?.(item.id)}
                className="group w-full rounded-[28px] border border-white/12 bg-white/[0.055] p-6 text-left shadow-2xl shadow-black/25 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.08]"
              >
                <div className="mb-4 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">
                  <span className="text-red-400/90">{item.section}</span>
                  <span>{item.date}</span>
                </div>

                <h3 className="text-balance text-[21px] font-black leading-[1.02] tracking-[-0.035em] text-white sm:text-[23px]">
                  {item.headline}
                </h3>

                <p className="mt-4 text-sm leading-6 text-white/62">
                  {item.deck}
                </p>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    {item.publication}
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      width={42}
                      height={42}
                      src={item.image}
                      alt={item.name}
                      className="h-11 w-11 shrink-0 rounded-full border border-white/15 object-cover grayscale"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold leading-5 text-white">
                        {item.name}
                      </div>
                      <div className="mt-0.5 text-xs leading-4 text-white/45">
                        {item.role}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
