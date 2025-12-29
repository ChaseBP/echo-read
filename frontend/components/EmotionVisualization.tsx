import { motion } from "motion/react";
import { Activity, Waves } from "lucide-react";

export type Emotion =
  | "calm"
  | "tense"
  | "anxious"
  | "dramatic"
  | "romantic"
  | "relieved"
  | "excited"
  | "sad"
  | "angry";

interface EmotionVisualizationProps {
  emotion: Emotion;
  intensity: number; // 1-5
}

const EMOTION_CONFIG = {
  calm: {
    label: "Calm",
    color: "from-blue-400 to-cyan-400",
    bgColor: "rgba(59, 130, 246, 0.2)",
  },

  tense: {
    label: "Tense",
    color: "from-orange-400 to-red-500",
    bgColor: "rgba(249, 115, 22, 0.25)",
  },

  anxious: {
    label: "Anxious",
    color: "from-yellow-400 to-amber-500",
    bgColor: "rgba(245, 158, 11, 0.25)",
  },

  dramatic: {
    label: "Dramatic",
    color: "from-purple-400 to-fuchsia-500",
    bgColor: "rgba(168, 85, 247, 0.25)",
  },

  romantic: {
    label: "Romantic",
    color: "from-pink-400 to-rose-500",
    bgColor: "rgba(244, 114, 182, 0.25)",
  },

  relieved: {
    label: "Relieved",
    color: "from-green-400 to-emerald-500",
    bgColor: "rgba(34, 197, 94, 0.25)",
  },

  excited: {
    label: "Excited",
    color: "from-sky-400 to-indigo-500",
    bgColor: "rgba(99, 102, 241, 0.25)",
  },

  sad: {
    label: "Sad",
    color: "from-slate-400 to-blue-500",
    bgColor: "rgba(100, 116, 139, 0.25)",
  },

  angry: {
    label: "Angry",
    color: "from-red-500 to-rose-600",
    bgColor: "rgba(220, 38, 38, 0.3)",
  },
};

export function EmotionVisualization({
  emotion,
  intensity,
}: EmotionVisualizationProps) {
  const config = EMOTION_CONFIG[emotion];
  const intensityPct = Math.min(100, Math.max(0, (intensity / 5) * 100));
  const activeDots = Math.round((intensity / 5) * 8);

  return (
    <div className="space-y-4">
      {/* Emotion Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Current Emotion
          </h3>
          <span
            className={`text-sm bg-linear-to-r ${config.color} bg-clip-text text-transparent`}
          >
            {config.label}
          </span>
        </div>

        {/* Emotion Bar */}
        <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-linear-to-r ${config.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.div
            className={`absolute inset-0 bg-linear-to-r ${config.color} opacity-50`}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>

      {/* Intensity Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Waves className="w-4 h-4" />
            Intensity
          </h3>
          <span className="text-sm text-slate-200">{intensity}</span>
        </div>

        {/* Intensity Meter */}
        <div className="relative">
          <div className="h-16 bg-slate-800/50 rounded-2xl overflow-hidden relative">
            {/* Background grid */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-full border-r border-slate-600"
                  style={{ width: "20%", float: "left" }}
                />
              ))}
            </div>

            {/* Intensity fill */}
            <motion.div
              className={`absolute inset-y-0 left-0 bg-linear-to-r ${config.color} opacity-60`}
              animate={{ width: `${intensityPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Breathing effect overlay */}
            <motion.div
              className="absolute inset-0 bg-linear-to-t from-transparent via-white/5 to-transparent"
              animate={{
                y: ["0%", "-100%", "0%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Radial gauge visualization */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <motion.div
                className="relative w-10 h-10"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full bg-linear-to-r ${config.color}`}
                    style={{
                      top: "50%",
                      left: "50%",
                      transformOrigin: "0 0",
                      transform: `rotate(${i * 45}deg) translate(15px, -50%)`,
                    }}
                    animate={{
                      opacity: i < activeDots ? 1 : 0.2,
                      scale: i < activeDots ? [1, 1.5, 1] : 1,
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="h-12 flex items-end justify-center gap-1 bg-slate-900/50 rounded-xl p-2">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-1 bg-linear-to-t ${config.color} rounded-full`}
            animate={{
              height: `${Math.random() * intensityPct}%`,
            }}
            transition={{
              duration: 0.3 + Math.random() * 0.3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            style={{ minHeight: "20%" }}
          />
        ))}
      </div>
    </div>
  );
}
