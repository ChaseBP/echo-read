"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { narrateText } from "@/lib/api";
import { ComposeMode } from "@/components/ComposeMode";
import { PlaybackMode } from "@/components/PlaybackMode";
import {
  DirectionMode,
  NarrationMetadata,
  NarrationTimelineItem,
  NarrationWordTimelineItem,
  normalizeStoryText,
  RoleTimelineSegment,
  SAMPLE_STORIES,
  SampleStory,
} from "@/lib/narration";

type AppMode = "compose" | "playback";

const STORAGE_KEY = "echoread-studio-state";
const THEME_STORAGE_KEY = "echoread-theme";
const DEFAULT_SAMPLE = SAMPLE_STORIES[0];
type ThemeMode = "light" | "dark";

export default function Page() {
  const [mode, setMode] = useState<AppMode>("compose");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [draftText, setDraftText] = useState(DEFAULT_SAMPLE.text);
  const [directionMode, setDirectionMode] =
    useState<DirectionMode>(DEFAULT_SAMPLE.directionMode);
  const [storyText, setStoryText] = useState("");
  const [isNarrating, setIsNarrating] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Analyzing scene");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [wordTimeline, setWordTimeline] = useState<NarrationWordTimelineItem[]>(
    [],
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [segments, setSegments] = useState<RoleTimelineSegment[]>([]);
  const [metadata, setMetadata] = useState<NarrationMetadata | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const rawTimelineRef = useRef<NarrationTimelineItem[]>([]);
  const requestControllerRef = useRef<AbortController | null>(null);
  const shouldAutoplayRef = useRef(false);
  const hydratedRef = useRef(false);

  function togglePlayPause() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      return;
    }

    void audioRef.current.play().catch(() => {
      setIsPlaying(false);
    });
  }

  function handleSeek(time: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration || time, time));
  }

  function buildRoleTimeline(
    timeline: NarrationTimelineItem[],
    duration: number,
  ): RoleTimelineSegment[] {
    if (!duration) return [];

    return timeline.map((seg) => ({
      ...seg,
      role: seg.role,
      emotion: seg.emotion,
      intensity: seg.intensity,
      start: seg.start,
      end: seg.end,
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

  function handleUseSample(sample: SampleStory) {
    setDraftText(sample.text);
    setDirectionMode(sample.directionMode);
    setErrorMessage(null);
  }

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      hydratedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(saved) as {
        text?: string;
        directionMode?: DirectionMode;
      };

      if (parsed.text) {
        setDraftText(parsed.text);
      }

      if (parsed.directionMode) {
        setDirectionMode(parsed.directionMode);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as
      | ThemeMode
      | null;

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        text: draftText,
        directionMode,
      }),
    );
  }, [directionMode, draftText]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  async function handleNarrate() {
    const text = draftText.trim();
    if (!text) return;

    const normalizedText = normalizeStoryText(text);

    try {
      requestControllerRef.current?.abort();

      const controller = new AbortController();
      requestControllerRef.current = controller;

      setIsNarrating(true);
      setLoadingStage("Analyzing scene");
      setErrorMessage(null);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setAudioUrl(null);
      setSegments([]);
      setWordTimeline([]);
      setMetadata(null);
      setStoryText(normalizedText);

      const data = await narrateText({
        text: normalizedText,
        directionMode,
        signal: controller.signal,
      });

      setLoadingStage("Rendering performance");

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
        { type: "audio/mpeg" },
      );

      const url = URL.createObjectURL(audioBlob);

      setAudioUrl(url);
      rawTimelineRef.current = data.timeline;
      setWordTimeline(data.word_timeline);
      setMetadata(data.metadata);
      setDuration(data.metadata.duration_seconds);
      setSegments(
        buildRoleTimeline(data.timeline, data.metadata.duration_seconds),
      );

      setMode("playback");
      shouldAutoplayRef.current = true;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Narration failed. Try a shorter or cleaner excerpt.";

      setErrorMessage(message);
      setMode("compose");
    } finally {
      setIsNarrating(false);
      requestControllerRef.current = null;
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f4efe7_0%,#efe8dc_52%,#e6ddcf_100%)] text-foreground transition-colors dark:bg-[linear-gradient(180deg,#181411_0%,#201a17_48%,#14100e_100%)]">
      <button
        type="button"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-[#fffaf2]/90 px-4 py-2 text-sm text-stone-700 shadow-[0_10px_24px_rgba(70,52,34,0.08)] backdrop-blur-sm transition hover:bg-white dark:border-stone-700/80 dark:bg-[#26211d]/92 dark:text-stone-200 dark:hover:bg-[#302924] lg:right-6 lg:top-6"
      >
        {theme === "light" ? (
          <>
            <Moon className="h-4 w-4" />
            Dark mode
          </>
        ) : (
          <>
            <Sun className="h-4 w-4" />
            Light mode
          </>
        )}
      </button>
      {mode === "compose" ? (
        <ComposeMode
          text={draftText}
          directionMode={directionMode}
          isLoading={isNarrating}
          loadingStage={loadingStage}
          errorMessage={errorMessage}
          onTextChange={setDraftText}
          onDirectionChange={setDirectionMode}
          onUseSample={handleUseSample}
          onNarrate={handleNarrate}
        />
      ) : (
        <PlaybackMode
          storyText={storyText}
          audioUrl={audioUrl}
          metadata={metadata}
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

      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        onLoadedMetadata={() => {
          if (!audioRef.current) return;

          const d = audioRef.current.duration;
          setDuration(d);
          setSegments(
            buildRoleTimeline(rawTimelineRef.current, d || metadata?.duration_seconds || 0),
          );

          if (shouldAutoplayRef.current) {
            shouldAutoplayRef.current = false;
            void audioRef.current.play().catch(() => {
              setIsPlaying(false);
            });
          }
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
          setCurrentTime(audioRef.current?.duration ?? duration);
          setProgress(100);
        }}
      />
    </div>
  );
}
