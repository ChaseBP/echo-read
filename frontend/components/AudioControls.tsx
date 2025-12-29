import { motion } from "motion/react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioControls({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
}: AudioControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden group cursor-pointer">
          {/* Progress fill */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
            style={{ width: `${progress}%` }}
          />

          {/* Hover indicator */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              className="absolute top-0 bottom-0 w-1 bg-white/50 rounded-full"
              style={{ left: `${progress}%` }}
            />
          </div>

          {/* Seek interaction */}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => onSeek(Math.min(0, currentTime - 10))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play/Pause Button */}
        <motion.button
          onClick={onPlayPause}
          className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

          <motion.div
            key={isPlaying ? "pause" : "play"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </motion.div>
        </motion.button>

        <button
          onClick={() => onSeek(Math.min(duration, currentTime + 10))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Playback Status */}
      <div className="text-center">
        <motion.div
          animate={{
            opacity: isPlaying ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="inline-flex items-center gap-2 text-sm text-slate-400"
        >
          {isPlaying ? (
            <>
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 h-3 bg-blue-400 rounded-full"
                    animate={{
                      height: ["8px", "16px", "8px"],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <span>Now Playing</span>
            </>
          ) : (
            <span>Paused</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
