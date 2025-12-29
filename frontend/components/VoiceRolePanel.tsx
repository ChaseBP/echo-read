import { motion } from "motion/react";
import { User, Users, UserRound } from "lucide-react";

export type VoiceRole = "narrator" | "male_character" | "female_character";

interface VoiceRolePanelProps {
  activeRole: VoiceRole;
}

const VOICE_ROLES = [
  {
    id: "narrator" as VoiceRole,
    label: "Narrator",
    icon: Users,
    color: "from-cyan-400 to-blue-500",
    glowColor: "rgba(34, 211, 238, 0.3)",
  },
  {
    id: "male_character" as VoiceRole,
    label: "Male Character",
    icon: User,
    color: "from-purple-400 to-violet-500",
    glowColor: "rgba(168, 85, 247, 0.3)",
  },
  {
    id: "female_character" as VoiceRole,
    label: "Female Character",
    icon: UserRound,
    color: "from-pink-400 to-rose-500",
    glowColor: "rgba(244, 114, 182, 0.3)",
  },
];

export function VoiceRolePanel({ activeRole }: VoiceRolePanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider">
        Active Voice
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {VOICE_ROLES.map((role) => {
          const isActive = role.id === activeRole;
          const Icon = role.icon;

          return (
            <motion.div
              key={role.id}
              animate={{
                scale: isActive ? 1.05 : 1,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Glow effect for active role */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl blur-xl"
                  style={{ backgroundColor: role.glowColor }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              <div
                className={`relative bg-slate-900/70 backdrop-blur-sm border rounded-2xl p-4 transition-all ${isActive ? "border-white/20" : "border-slate-700/30"
                  }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${role.color} flex items-center justify-center ${isActive ? "shadow-lg" : ""
                      }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-200">{role.label}</p>
                  </div>
                </div>

                {/* Active pulse indicator */}
                {isActive && (
                  <motion.div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
