"use client";

import { useState, useRef } from "react";

import { Play, Pause, Sparkles } from "lucide-react";

import { narrateText } from "@/lib/api";

import {
  NarrationVisualization,
  RoleTimelineSegment,
} from "@/components/NarrationVisualization";

import {
  WordHighlightText,
  WordTimelineItem,
} from "@/components/WordHighlightText";

export default function Page() {
  const [storyText, setStoryText] = useState("");

  const [isNarrating, setIsNarrating] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const [isDramatic, setIsDramatic] = useState(false);

  const [progress, setProgress] = useState(0);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [wordTimeline, setWordTimeline] = useState<WordTimelineItem[]>([]);

  const [currentTime, setCurrentTime] = useState(0); // seconds

  /** Timeline used ONLY for visualization */

  const [segments, setSegments] = useState<RoleTimelineSegment[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  const rawTimelineRef = useRef<any[]>([]); // backend timeline (seconds)

  /* -------------------- helpers -------------------- */

  function togglePlayPause() {
    if (!audioRef.current) return;

    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current?.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const percent = (e.clientX - rect.left) / rect.width;

    audioRef.current.currentTime = percent * audioRef.current.duration;
  }

  /** Convert backend timeline (seconds) → UI progress (%) */

  function buildRoleTimeline(
    timeline: any[],

    duration: number,
  ): RoleTimelineSegment[] {
    if (!duration || duration === 0) return [];

    return timeline.map((seg) => ({
      role: seg.role,

      startProgress: (seg.start / duration) * 100,

      endProgress: (seg.end / duration) * 100,
    }));
  }

  /* -------------------- narrate -------------------- */

  async function handleNarrate() {
    if (!storyText.trim()) return;

    try {
      setIsNarrating(true);

      setIsPlaying(false);

      setProgress(0);

      setAudioUrl(null);

      setSegments([]);

      const data = await narrateText(storyText, isDramatic);

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],

        { type: "audio/mpeg" },
      );

      const url = URL.createObjectURL(audioBlob);

      setAudioUrl(url);

      // store raw backend timeline (seconds)

      rawTimelineRef.current = data.timeline;
      setWordTimeline(data.word_timeline);

      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    } catch {
      alert("Narration failed. Try a shorter text.");
    } finally {
      setIsNarrating(false);
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}

        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-indigo-400" />

            <h1 className="text-5xl font-medium tracking-tight">EchoRead</h1>
          </div>

          <p className="text-gray-400 text-lg">
            Adaptive AI Voice Narration for Light Novels
          </p>
        </header>

        {/* Two-column layout */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}

          <div className="space-y-8">
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="Paste your light novel text here…"
              className="w-full h-80 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isNarrating}
            />

            <div className="flex gap-4">
              <button
                onClick={handleNarrate}
                disabled={isNarrating || !storyText.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl"
              >
                {isNarrating ? "Narrating…" : "Narrate"}
              </button>

              <button
                onClick={() => setIsDramatic(!isDramatic)}
                className={`px-6 py-4 rounded-xl border-2 ${isDramatic
                    ? "bg-purple-600 border-purple-600"
                    : "border-zinc-800 text-gray-400"
                  }`}
              >
                More Dramatic
              </button>
            </div>

            {/* Audio controls + slider */}

            {audioUrl && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlayPause}
                    className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center"
                  >
                    {isPlaying ? <Pause /> : <Play />}
                  </button>

                  <div
                    className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}

          <div className="space-y-6">
            <WordHighlightText
              text={storyText}
              words={wordTimeline}
              currentTime={currentTime}
            />
            <NarrationVisualization
              segments={segments}
              currentProgress={progress}
              isPlaying={isPlaying}
            />
          </div>
        </div>

        {/* Hidden audio element */}

        <audio
          ref={audioRef}
          src={audioUrl ?? undefined}
          onLoadedMetadata={() => {
            if (!audioRef.current) return;

            const duration = audioRef.current.duration;

            const timeline = buildRoleTimeline(
              rawTimelineRef.current,

              duration,
            );

            setSegments(timeline);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (!audioRef.current?.duration) return;

            const t = audioRef.current.currentTime;
            setCurrentTime(t);

            setProgress(
              (audioRef.current.currentTime / audioRef.current.duration) * 100,
            );
          }}
          onEnded={() => {
            setIsPlaying(false);

            setProgress(100);
          }}
        />
      </div>
    </div>
  );
}
