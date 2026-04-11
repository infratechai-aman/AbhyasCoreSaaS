"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ScrollSequenceProps = {
  frames: string[];
  className?: string;
  imageClassName?: string;
};

export function ScrollSequence({ frames, className, imageClassName }: ScrollSequenceProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!frames.length) {
      return;
    }

    const preload = frames.map((src) => {
      const img = new window.Image();
      img.src = src;
      return img;
    });

    let rafId = 0;

    const updateFrame = () => {
      const section = document.getElementById("hero-sequence");
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const total = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progressed = Math.min(Math.max(-rect.top / total, 0), 1);
      const lastFrameIndex = frames.length - 1;
      const nextFrame = Math.min(lastFrameIndex, Math.round(progressed * lastFrameIndex));

      setFrameIndex((currentFrame) => (currentFrame === nextFrame ? currentFrame : nextFrame));
    };

    const queueUpdate = () => {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateFrame();
      });
    };

    updateFrame();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      preload.length = 0;
    };
  }, [frames]);

  if (!frames.length) {
    return null;
  }

  return (
    <div className={cn("relative mx-auto", className)}>
      <div className="relative aspect-[16/9]">
        <img
          key={frames[frameIndex]}
          src={frames[frameIndex]}
          alt="RankForge cinematic study hero"
          className={cn("h-full w-full object-contain", imageClassName)}
          draggable={false}
        />
      </div>
    </div>
  );
}
