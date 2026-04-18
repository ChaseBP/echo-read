import { motion } from "motion/react";
import { Activity, Waves } from "lucide-react";

import { Emotion } from "@/lib/narration";

interface EmotionVisualizationProps {
  emotion: Emotion;
  intensity: number;
}

const EMOTION_CONFIG: Record<Emotion, { label: string; accent: string }> = {
  calm: { label: "Calm", accent: "bg-stone-500" },
  tense: { label: "Tense", accent: "bg-amber-700" },
  anxious: { label: "Anxious", accent: "bg-yellow-700" },
  dramatic: { label: "Dramatic", accent: "bg-rose-700" },
  romantic: { label: "Romantic", accent: "bg-pink-700" },
  relieved: { label: "Relieved", accent: "bg-emerald-700" },
  excited: { label: "Excited", accent: "bg-blue-700" },
  sad: { label: "Sad", accent: "bg-slate-600" },
  angry: { label: "Angry", accent: "bg-red-700" },
};

export function EmotionVisualization({
  emotion,
  intensity,
}: EmotionVisualizationProps) {
  const config = EMOTION_CONFIG[emotion];
  const safeIntensity = Math.min(5, Math.max(1, intensity));

  return (
    <div className="rounded-[22px] border border-stone-300/80 bg-[#fffaf2]/90 p-5 shadow-[0_12px_30px_rgba(70,52,34,0.06)] dark:border-espresso-700/70 dark:bg-espresso-900/90 dark:shadow-[0_12px_30px_rgba(28,22,18,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium text-stone-700 dark:text-espresso-100">Delivery</div>
        <span className="text-sm text-stone-600 dark:text-espresso-200">{config.label}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-stone-600 dark:text-espresso-200">
            <span className="inline-flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Emotion
            </span>
            <span>{config.label}</span>
          </div>
          <div className="h-2 rounded-full bg-stone-200 dark:bg-espresso-700/70">
            <motion.div
              className={`h-full rounded-full ${config.accent}`}
              animate={{ width: `${(safeIntensity / 5) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-stone-600 dark:text-espresso-200">
            <span className="inline-flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Intensity
            </span>
            <span>{safeIntensity}/5</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index < safeIntensity ? config.accent : "bg-stone-200 dark:bg-espresso-700/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
