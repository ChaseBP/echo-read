"use client";

import { Mic, UserRound } from "lucide-react";
import { Emotion } from "./EmotionVisualization";

export interface RoleTimelineSegment {
  role: "narrator" | "male_character" | "female_character";
  emotion: Emotion;
  intensity: number; // 1-5
  startProgress: number;
  endProgress: number;
}

interface Props {
  segments: RoleTimelineSegment[]; // timeline
  currentProgress: number;
  isPlaying: boolean;
}

const ROLE_UI = {
  narrator: {
    label: "Narrator",
    color: "text-slate-300",
    bg: "bg-slate-800/40",
    active: "bg-slate-700",
    icon: Mic,
  },
  male_character: {
    label: "Male",
    color: "text-blue-300",
    bg: "bg-blue-900/30",
    active: "bg-blue-800/60",
    icon: UserRound,
  },
  female_character: {
    label: "Female",
    color: "text-pink-300",
    bg: "bg-pink-900/30",
    active: "bg-pink-800/60",
    icon: UserRound,
  },
} as const;

const ALL_ROLES = Object.keys(ROLE_UI) as Array<keyof typeof ROLE_UI>;

export function NarrationVisualization({
  segments,
  currentProgress,
  isPlaying,
}: Props) {
  const activeSegment = segments.find(
    (s) =>
      currentProgress >= s.startProgress && currentProgress < s.endProgress,
  );

  const activeRole = activeSegment?.role;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="border-b border-zinc-800 px-6 py-3 text-sm text-gray-400">
        Live Voice Roles
      </div>

      <div className="p-6 space-y-4">
        {ALL_ROLES.map((role) => {
          const ui = ROLE_UI[role];
          const Icon = ui.icon;
          const isActive = role === activeRole;

          return (
            <div
              key={role}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                ${isActive ? ui.active : ui.bg}
                border-zinc-800`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${isActive ? ui.active : "bg-zinc-800"}`}
              >
                <Icon className={`w-5 h-5 ${ui.color}`} />
              </div>

              <div className="flex-1">
                <div
                  className={`text-lg font-medium ${isActive ? "text-white" : ui.color
                    }`}
                >
                  {ui.label}
                </div>

                {isActive && isPlaying && (
                  <div className="mt-1 h-1 w-24 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
