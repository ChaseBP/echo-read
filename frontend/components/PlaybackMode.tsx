"use client";

import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { AudioControls } from "@/components/AudioControls";
import { EmotionVisualization } from "@/components/EmotionVisualization";
import { NarrationVisualization } from "@/components/NarrationVisualization";
import { VoiceRolePanel } from "@/components/VoiceRolePanel";
import {
  NarrationMetadata,
  NarrationWordTimelineItem,
  RoleTimelineSegment,
  VoiceRole,
} from "@/lib/narration";

interface PlaybackModeProps {
  storyText: string;
  audioUrl: string | null;
  metadata: NarrationMetadata | null;
  wordTimeline: NarrationWordTimelineItem[];
  segments: RoleTimelineSegment[];
  currentTime: number;
  progress: number;
  isPlaying: boolean;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onBackToCompose: () => void;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function findActiveWordIndex(
  words: NarrationWordTimelineItem[],
  currentTime: number,
) {
  if (!words.length) return -1;

  let low = 0;
  let high = words.length - 1;
  let candidate = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (words[mid].start <= currentTime) {
      candidate = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (candidate === -1) return 0;

  const current = words[candidate];
  if (currentTime <= current.end) return candidate;

  const next = words[candidate + 1];
  if (!next) return candidate;

  const midpoint = current.end + (next.start - current.end) / 2;
  return currentTime <= midpoint ? candidate : candidate + 1;
}

export function PlaybackMode({
  storyText,
  audioUrl,
  metadata,
  wordTimeline,
  segments,
  currentTime,
  progress,
  isPlaying,
  duration,
  onPlayPause,
  onSeek,
  onBackToCompose,
}: PlaybackModeProps) {
  const storyViewerRef = useRef<HTMLDivElement>(null);

  const currentWordIndex = useMemo(
    () => findActiveWordIndex(wordTimeline, currentTime),
    [currentTime, wordTimeline],
  );

  const activeSegment = useMemo(() => {
    return (
      segments.find(
        (segment) =>
          currentTime >= segment.start && currentTime <= segment.end + 0.05,
      ) ?? segments.at(-1)
    );
  }, [currentTime, segments]);

  const activeRole: VoiceRole = activeSegment?.role ?? "narrator";
  const emotion = activeSegment?.emotion ?? metadata?.dominant_emotion ?? "calm";
  const intensity = activeSegment?.intensity ?? 1;

  const renderedText = useMemo(() => {
    let cursor = 0;
    const nodes: React.ReactNode[] = [];

    wordTimeline.forEach((word, index) => {
      const start = Math.max(cursor, Math.min(storyText.length, word.char_start));
      const end = Math.max(start, Math.min(storyText.length, word.char_end));

      if (start > cursor) {
        nodes.push(<span key={`plain-${index}`}>{storyText.slice(cursor, start)}</span>);
      }

      const content = storyText.slice(start, end) || word.word;
      const isActive = index === currentWordIndex;

      nodes.push(
        <span
          key={`word-${index}`}
          data-word-index={index}
          className={`rounded px-0.5 transition-colors ${
            isActive
              ? "bg-amber-100 text-stone-900 dark:bg-amber-900/60 dark:text-amber-50"
              : "text-stone-700 dark:text-espresso-100"
          }`}
        >
          {content}
        </span>,
      );

      cursor = end;
    });

    if (cursor < storyText.length) {
      nodes.push(<span key="tail">{storyText.slice(cursor)}</span>);
    }

    return nodes;
  }, [currentWordIndex, storyText, wordTimeline]);

  useEffect(() => {
    if (!storyViewerRef.current || currentWordIndex < 0) return;

    const container = storyViewerRef.current;
    const wordElement = container.querySelector<HTMLElement>(
      `[data-word-index="${currentWordIndex}"]`,
    );

    if (!wordElement) return;

    const containerRect = container.getBoundingClientRect();
    const wordRect = wordElement.getBoundingClientRect();
    const nextTop =
      container.scrollTop +
      (wordRect.top - containerRect.top) -
      container.clientHeight / 2 +
      wordRect.height * 2;

    container.scrollTo({
      top: Math.max(0, nextTop),
      behavior: "smooth",
    });
  }, [currentWordIndex]);

  return (
    <div className="min-h-screen px-4 py-5 lg:px-7 lg:py-6">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-stone-300/80 bg-[#fffaf2]/90 px-5 py-4 shadow-[0_14px_36px_rgba(70,52,34,0.06)] dark:border-espresso-700/70 dark:bg-espresso-900/90 dark:shadow-[0_14px_36px_rgba(28,22,18,0.35)]">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onBackToCompose}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50 dark:border-espresso-700 dark:bg-espresso-800 dark:text-espresso-100 dark:hover:bg-espresso-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-sm text-stone-600 dark:text-espresso-200">
                <span className="font-medium text-stone-800 dark:text-cream">
                  {metadata?.direction_mode ?? "cinematic"}
                </span>
                {" · "}
                {formatDuration(duration || metadata?.duration_seconds || 0)}
                {" · "}
                {Math.round(progress)}%
              </div>
            </div>

            {audioUrl ? (
              <a
                href={audioUrl}
                download="echoread-performance.mp3"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50 dark:border-espresso-700 dark:bg-espresso-800 dark:text-espresso-100 dark:hover:bg-espresso-700"
              >
                <Download className="h-4 w-4" />
                Download audio
              </a>
            ) : null}
          </div>

          <section className="rounded-[28px] border border-stone-300/80 bg-[#fdf9f2]/96 p-5 shadow-[0_18px_44px_rgba(70,52,34,0.08)] dark:border-espresso-700/70 dark:bg-espresso-900/95 dark:shadow-[0_18px_44px_rgba(28,22,18,0.4)] lg:p-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 pb-4 dark:border-espresso-700/70">
              <div>
                <div className="text-sm font-medium text-stone-700 dark:text-espresso-100">
                  Now reading
                </div>
                <h2 className="mt-1 text-2xl text-stone-900 dark:text-cream">
                  {activeSegment?.role.replace("_", " ") ?? "Narrator"}
                </h2>
              </div>

              <div className="text-sm text-stone-500 dark:text-espresso-300">
                {activeSegment?.emotion ?? "calm"} · intensity {intensity}
                {metadata?.cache_hit ? " · cached render" : ""}
              </div>
            </div>

            <div
              ref={storyViewerRef}
              className="max-h-[58vh] overflow-y-auto rounded-[22px] border border-stone-200 bg-[#fbf7ef] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-espresso-700/70 dark:bg-espresso-950 dark:shadow-[inset_0_1px_0_rgba(234,212,178,0.04)] lg:px-8"
            >
              <div className="mx-auto max-w-[65ch] whitespace-pre-wrap font-reading text-lg leading-[1.75] text-stone-700 dark:text-espresso-100">
                {renderedText}
              </div>
            </div>
          </section>

          <NarrationVisualization
            segments={segments}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onSelectSegment={(segment) => onSeek(segment.start)}
          />
        </div>

        <aside className="space-y-4">
          <AudioControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
          />

          <VoiceRolePanel activeRole={activeRole} />

          <EmotionVisualization emotion={emotion} intensity={intensity} />

          <div className="rounded-[22px] border border-stone-300/80 bg-[#fffaf2]/90 p-5 shadow-[0_12px_30px_rgba(70,52,34,0.06)] dark:border-espresso-700/70 dark:bg-espresso-900/90 dark:shadow-[0_12px_30px_rgba(28,22,18,0.35)]">
            <div className="mb-3 text-sm font-medium text-stone-700 dark:text-espresso-100">
              Performance details
            </div>
            <div className="space-y-2 text-sm text-stone-600 dark:text-espresso-200">
              <div className="flex items-center justify-between">
                <span>Dominant emotion</span>
                <span className="text-stone-800 dark:text-cream">
                  {metadata?.dominant_emotion ?? emotion}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Default pace</span>
                <span className="text-stone-800 dark:text-cream">
                  {metadata?.default_pace ?? "medium"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Segments</span>
                <span className="text-stone-800 dark:text-cream">
                  {metadata?.segment_count ?? segments.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Aligned words</span>
                <span className="text-stone-800 dark:text-cream">
                  {metadata?.word_count ?? wordTimeline.length}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
