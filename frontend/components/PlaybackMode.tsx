"use client";

import { motion } from "motion/react";
import { useMemo, useEffect, useRef } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { VoiceRolePanel, VoiceRole } from "./VoiceRolePanel";
import { EmotionVisualization, Emotion } from "./EmotionVisualization";
import { AudioControls } from "./AudioControls";
import { WordTimelineItem } from "./WordHighlightText";
import { RoleTimelineSegment } from "./NarrationVisualization";

interface PlaybackModeProps {
  storyText: string;
  wordTimeline: WordTimelineItem[];
  segments: RoleTimelineSegment[];
  currentTime: number;
  progress: number;
  isPlaying: boolean;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onBackToCompose: () => void;
}

export function PlaybackMode({
  storyText,
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

  /* -------------------- derived state -------------------- */

  const currentWordIndex = useMemo(() => {
    if (!wordTimeline.length) return -1;

    return wordTimeline.findIndex(
      (w) => currentTime >= w.start && currentTime <= w.end,
    );
  }, [currentTime, wordTimeline]);

  const activeRole: VoiceRole = useMemo(() => {
    const seg = segments.find(
      (s) => progress >= s.startProgress && progress <= s.endProgress,
    );
    return (seg?.role as VoiceRole) ?? "narrator";
  }, [segments, progress]);

  const activeSegment = useMemo(() => {
    return segments.find(
      (s) => progress >= s.startProgress && progress <= s.endProgress,
    );
  }, [segments, progress]);

  const emotion: Emotion = activeSegment?.emotion ?? "calm";
  //UI scaling only (1-5) to (20-100)
  const intensity: number = activeSegment ? activeSegment.intensity * 20 : 20;

  // This rebuilds the text exactly as typed, inserting spans only where needed.
  const renderedText = useMemo(() => {
    let cursor = 0;
    const nodes: React.ReactNode[] = [];

    wordTimeline.forEach((w, i) => {
      // Find where this word actually sits in the text
      const wordStart = storyText.indexOf(w.word, cursor);

      // Safety: If word isn't found (e.g. backend/frontend mismatch), skip
      if (wordStart === -1) return;

      // 1. Render the plain text BEFORE this word (preserves newlines/spaces)
      if (wordStart > cursor) {
        nodes.push(
          <span key={`plain-${i}`}>{storyText.slice(cursor, wordStart)}</span>,
        );
      }

      // 2. Render the Highlighted Word
      const isActive = i === currentWordIndex;
      nodes.push(
        <motion.span
          key={`word-${i}`}
          id={`word-${i}`} // ID used for scrolling
          className={`inline-block rounded px-0.5 transition-colors duration-200 ${isActive ? "text-white font-medium relative z-10" : "text-slate-300"
            }`}
          animate={{ scale: isActive ? 1.05 : 1 }}
          transition={{ duration: 0.1 }}
        >
          {w.word}

          {/* The Cinematic Glow Effect */}
          {isActive && (
            <motion.span
              layoutId="highlight-glow"
              className="absolute inset-0 bg-blue-500/20 rounded blur-sm -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          {/* The Underline Effect */}
          {isActive && (
            <motion.span
              className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"
              layoutId="highlight-underline"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.span>,
      );

      // Move cursor forward
      cursor = wordStart + w.word.length;
    });

    // 3. Render any remaining text at the end
    if (cursor < storyText.length) {
      nodes.push(<span key="tail">{storyText.slice(cursor)}</span>);
    }

    return nodes;
  }, [storyText, wordTimeline, currentWordIndex]);

  /* -------------------- Auto Scroll  -------------------- */

  useEffect(() => {
    if (!storyViewerRef.current || currentWordIndex < 0) return;

    const wordElement = storyViewerRef.current.querySelector(
      `[data-word-index="${currentWordIndex}"]`,
    );

    wordElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [currentWordIndex]);

  /* -------------------- Role Tint -------------------- */

  function getRoleBackground() {
    switch (activeRole) {
      case "male_character":
        return "bg-purple-500/5";
      case "female_character":
        return "bg-pink-500/5";
      default:
        return "bg-blue-500/5";
    }
  }

  /* -------------------- Render -------------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col lg:flex-row overflow-hidden"
    >
      {/* Main Content - Story Viewer - ON LEFT SIDE */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 lg:p-6 border-b border-slate-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <button
              onClick={onBackToCompose}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm lg:text-base"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>Back to Compose</span>
            </button>
            <div className="flex items-center gap-2 lg:gap-3">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
              <h1 className="text-xl lg:text-2xl font-serif bg-linear-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                EchoRead
              </h1>
            </div>
            <div className="w-24 lg:w-32" /> {/* Spacer for centering */}
          </div>
        </motion.div>

        {/* Story Viewer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-y-auto px-4 lg:px-6 py-8 lg:py-12"
        >
          <div className="max-w-4xl mx-auto">
            <div
              ref={storyViewerRef}
              className={`${getRoleBackground()} bg-slate-900/30 backdrop-blur-sm border border-slate-800/30 rounded-2xl lg:rounded-3xl p-6 lg:p-12 transition-colors duration-1000`}
            >
              <div
                className="prose prose-invert prose-base lg:prose-lg max-w-none whitespace-pre-wrap"
                style={{ contentVisibility: "auto" }}
              >
                <div className="font-serif text-slate-100 leading-relaxed space-y-4 lg:space-y-6">
                  {renderedText}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar - Live Narration Panels */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800/50 bg-slate-950/50 backdrop-blur-sm p-4 lg:p-6 space-y-6 lg:space-y-8 overflow-auto"
      >
        {/* Voice Role Panel */}
        <VoiceRolePanel activeRole={activeRole} />

        {/* Emotion & Intensity */}
        <EmotionVisualization emotion={emotion} intensity={intensity} />

        {/* Audio Controls */}
        <AudioControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={onPlayPause}
          onSeek={onSeek}
        />

        {/* Info Panel */}
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/30">
          <h3 className="text-sm text-slate-400 mb-2">Narration Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Words</span>
              <span className="text-slate-300">{wordTimeline.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Progress</span>
              <span className="text-slate-300">{Math.round(progress)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Voice Switches</span>
              <span className="text-slate-300">Real-time</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
