"use client";

import { useState, useRef } from "react";

import { narrateText } from "@/lib/api";

import { RoleTimelineSegment } from "@/components/NarrationVisualization";

import { WordTimelineItem } from "@/components/WordHighlightText";

import { ComposeMode } from "@/components/ComposeMode";
import { PlaybackMode } from "@/components/PlaybackMode";

type AppMode = "compose" | "playback";

export default function Page() {
  /* -------------------- core state -------------------- */

  const [mode, setMode] = useState<AppMode>("compose");

  const [storyText, setStoryText] = useState("");

  const [isNarrating, setIsNarrating] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);

  const [wordTimeline, setWordTimeline] = useState<WordTimelineItem[]>([]);

  const [currentTime, setCurrentTime] = useState(0);

  /** Timeline used ONLY for visualization */

  const [segments, setSegments] = useState<RoleTimelineSegment[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  const rawTimelineRef = useRef<any[]>([]); // backend timeline (seconds)

  /* -------------------- helpers -------------------- */

  function togglePlayPause() {
    if (!audioRef.current) return;

    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  }

  function handleSeek(time: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  }

  function buildRoleTimeline(
    timeline: any[],

    duration: number,
  ): RoleTimelineSegment[] {
    if (!duration) return [];

    return timeline.map((seg) => ({
      role: seg.role,

      emotion: seg.emotion,

      intensity: seg.intensity,

      startProgress: (seg.start / duration) * 100,

      endProgress: (seg.end / duration) * 100,
    }));
  }

  function handleBackToCompose() {
    audioRef.current?.pause();
    setIsPlaying(false);
    setProgress(0);
    setMode("compose");
  }

  /* -------------------- narrate -------------------- */

  async function handleNarrate(text: string) {
    if (!text.trim()) return;

    try {
      setIsNarrating(true);

      setIsPlaying(false);

      setProgress(0);

      setAudioUrl(null);

      setSegments([]);

      setStoryText(text);

      const data = await narrateText(text, false);

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],

        { type: "audio/mpeg" },
      );

      const url = URL.createObjectURL(audioBlob);

      setAudioUrl(url);

      rawTimelineRef.current = data.timeline;

      setWordTimeline(data.word_timeline);

      setMode("playback");

      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    } catch {
      alert("Narration failed. Try shorter text.");
    } finally {
      setIsNarrating(false);
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="dark min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground overflow-hidden">
      {mode === "compose" ? (
        <ComposeMode
          initialText={storyText}
          isLoading={isNarrating}
          onNarrate={handleNarrate}
        />
      ) : (
        <PlaybackMode
          storyText={storyText}
          wordTimeline={wordTimeline}
          segments={segments}
          currentTime={currentTime}
          progress={progress}
          isPlaying={isPlaying}
          duration={duration}
          onPlayPause={togglePlayPause}
          onSeek={handleSeek}
          onBackToCompose={handleBackToCompose}
        />
      )}

      {/* Audio element ALWAYS mounted */}

      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        onLoadedMetadata={() => {
          if (!audioRef.current) return;

          const d = audioRef.current.duration;
          setDuration(d);

          setSegments(buildRoleTimeline(rawTimelineRef.current, d));
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (!audioRef.current?.duration) return;

          const t = audioRef.current.currentTime;

          setCurrentTime(t);

          setProgress((t / audioRef.current.duration) * 100);
        }}
        onEnded={() => {
          setIsPlaying(false);

          setProgress(100);
        }}
      />
    </div>
  );
}
