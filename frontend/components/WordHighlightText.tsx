"use client";

import { useEffect, useMemo, useState } from "react";
import { JSX } from "react";

export interface WordTimelineItem {
  word: string;
  start: number; // seconds
  end: number; // seconds
  role: "narrator" | "male_character" | "female_character";
}

interface Props {
  text: string;
  words: WordTimelineItem[];
  currentTime: number; // seconds
}

export function WordHighlightText({ text, words, currentTime }: Props) {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  useEffect(() => {
    const idx = words.findIndex(
      (w) => currentTime >= w.start && currentTime < w.end,
    );
    setActiveWordIndex(idx === -1 ? null : idx);
  }, [currentTime, words]);

  /**
   * Build rendered text as spans
   * We rebuild ONLY when activeWordIndex changes
   */
  const rendered = useMemo(() => {
    let cursor = 0;
    const nodes: JSX.Element[] = [];

    words.forEach((w, i) => {
      const wordStart = text.indexOf(w.word, cursor);
      if (wordStart === -1) return;

      // Plain text before word
      if (wordStart > cursor) {
        nodes.push(<span key={`t-${i}`}>{text.slice(cursor, wordStart)}</span>);
      }

      // Word itself
      nodes.push(
        <span
          key={`w-${i}`}
          className={`transition-all duration-150 ${i === activeWordIndex
              ? "bg-indigo-500/30 underline underline-offset-4"
              : ""
            }`}
        >
          {w.word}
        </span>,
      );

      cursor = wordStart + w.word.length;
    });

    // Remaining text
    if (cursor < text.length) {
      nodes.push(<span key="tail">{text.slice(cursor)}</span>);
    }

    return nodes;
  }, [text, words, activeWordIndex]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 leading-relaxed text-lg text-gray-300 whitespace-pre-wrap">
      {rendered}
    </div>
  );
}
