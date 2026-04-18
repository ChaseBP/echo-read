"use client";

import { useMemo } from "react";

import { NarrationWordTimelineItem } from "@/lib/narration";

interface Props {
  text: string;
  words: NarrationWordTimelineItem[];
  currentTime: number;
}

export function WordHighlightText({ text, words, currentTime }: Props) {
  const activeWordIndex = useMemo(() => {
    const index = words.findIndex(
      (word) => currentTime >= word.start && currentTime <= word.end,
    );

    return index === -1 ? null : index;
  }, [currentTime, words]);

  const rendered = useMemo(() => {
    let cursor = 0;
    const nodes: React.ReactNode[] = [];

    words.forEach((word, index) => {
      const wordStart = text.indexOf(word.word, cursor);

      if (wordStart === -1) return;

      if (wordStart > cursor) {
        nodes.push(
          <span key={`plain-${index}`}>{text.slice(cursor, wordStart)}</span>,
        );
      }

      nodes.push(
        <span
          key={`word-${index}`}
          data-word-index={index}
          className={`rounded px-0.5 transition-all duration-150 ${
            index === activeWordIndex
              ? "bg-cyan-400/20 text-white underline underline-offset-4"
              : "text-slate-300"
          }`}
        >
          {word.word}
        </span>,
      );

      cursor = wordStart + word.word.length;
    });

    if (cursor < text.length) {
      nodes.push(<span key="tail">{text.slice(cursor)}</span>);
    }

    return nodes;
  }, [activeWordIndex, text, words]);

  return (
    <div className="mx-auto max-w-[65ch] rounded-2xl border border-white/10 bg-slate-950/70 p-6 font-reading text-lg leading-[1.75] text-slate-100 whitespace-pre-wrap">
      {rendered}
    </div>
  );
}
