"use client";

import { motion } from "motion/react";
import { Mic, User, UserRound } from "lucide-react";

import { RoleTimelineSegment, VoiceRole } from "@/lib/narration";

interface Props {
  segments: RoleTimelineSegment[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSelectSegment?: (segment: RoleTimelineSegment) => void;
}

const ROLE_UI: Record<
  VoiceRole,
  { label: string; icon: typeof Mic; bar: string; dot: string }
> = {
  narrator: {
    label: "Narrator",
    icon: Mic,
    bar: "bg-stone-500",
    dot: "bg-stone-500",
  },
  male_character: {
    label: "Male voice",
    icon: User,
    bar: "bg-sky-700",
    dot: "bg-sky-700",
  },
  female_character: {
    label: "Female voice",
    icon: UserRound,
    bar: "bg-rose-700",
    dot: "bg-rose-700",
  },
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function NarrationVisualization({
  segments,
  currentTime,
  duration,
  isPlaying,
  onSelectSegment,
}: Props) {
  const playheadProgress =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const playheadLeft = `clamp(0px, calc(${playheadProgress}% - 0.1875rem), calc(100% - 0.375rem))`;

  return (
    <div className="rounded-[24px] border border-stone-300/80 bg-[#fffaf2]/90 p-5 shadow-[0_12px_30px_rgba(70,52,34,0.06)] dark:border-espresso-700/70 dark:bg-espresso-900/90 dark:shadow-[0_12px_30px_rgba(28,22,18,0.35)]">
      <div className="mb-4">
        <div className="text-sm font-medium text-stone-700 dark:text-espresso-100">Scene map</div>
        <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-espresso-300">
          Dialogue shifts and narration changes across the current passage.
        </p>
      </div>

      <div className="relative mb-5 h-4 rounded-full bg-stone-200 dark:bg-espresso-700/70">
        {segments.map((segment, index) => (
          <div
            key={`${segment.start}-${segment.end}-${index}`}
            className={`absolute inset-y-0 rounded-full ${ROLE_UI[segment.role].bar}`}
            style={{
              left: `${segment.startProgress}%`,
              width: `${Math.max(segment.endProgress - segment.startProgress, 0.5)}%`,
            }}
          />
        ))}

        <motion.div
          className="absolute top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-stone-900 shadow dark:bg-cream"
          animate={{ left: playheadLeft, opacity: isPlaying ? 1 : 0.8 }}
          transition={{ duration: 0.12, ease: "linear" }}
        />
      </div>

      <div className="space-y-2">
        {segments.map((segment, index) => {
          const Icon = ROLE_UI[segment.role].icon;
          const active =
            currentTime >= segment.start && currentTime <= segment.end + 0.05;

          return (
            <button
              key={`segment-card-${index}-${segment.start}`}
              onClick={() => onSelectSegment?.(segment)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? "border-stone-400 bg-stone-100/80 dark:border-espresso-400 dark:bg-espresso-700"
                  : "border-stone-200 bg-white/80 hover:bg-stone-50 dark:border-espresso-700 dark:bg-espresso-950 dark:hover:bg-espresso-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-white ${ROLE_UI[segment.role].dot}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-stone-800 dark:text-cream">
                      {ROLE_UI[segment.role].label}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-espresso-300">
                      {formatTime(segment.start)} to {formatTime(segment.end)}
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-espresso-200">
                    {segment.text}
                  </p>
                  <div className="mt-2 text-xs text-stone-500 dark:text-espresso-300">
                    {segment.emotion} · intensity {segment.intensity}
                    {segment.audio_tag !== "none" ? ` · ${segment.audio_tag}` : ""}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
