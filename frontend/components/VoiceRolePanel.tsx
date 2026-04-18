import { motion } from "motion/react";
import { Mic, User, UserRound } from "lucide-react";

import { VoiceRole } from "@/lib/narration";

interface VoiceRolePanelProps {
  activeRole: VoiceRole;
}

const VOICE_ROLES = [
  {
    id: "narrator" as VoiceRole,
    label: "Narrator",
    icon: Mic,
  },
  {
    id: "male_character" as VoiceRole,
    label: "Male voice",
    icon: User,
  },
  {
    id: "female_character" as VoiceRole,
    label: "Female voice",
    icon: UserRound,
  },
];

export function VoiceRolePanel({ activeRole }: VoiceRolePanelProps) {
  return (
    <div className="rounded-[22px] border border-stone-300/80 bg-[#fffaf2]/90 p-5 shadow-[0_12px_30px_rgba(70,52,34,0.06)]">
      <div className="mb-3 text-sm font-medium text-stone-700">Voice focus</div>

      <div className="space-y-2">
        {VOICE_ROLES.map((role) => {
          const isActive = role.id === activeRole;
          const Icon = role.icon;

          return (
            <motion.div
              key={role.id}
              animate={{ opacity: isActive ? 1 : 0.62 }}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                isActive
                  ? "border-stone-400 bg-stone-100/80"
                  : "border-stone-200 bg-white/80"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-stone-50">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-800">
                  {role.label}
                </div>
              </div>
              {isActive ? (
                <motion.div
                  className="h-2.5 w-2.5 rounded-full bg-amber-700"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
