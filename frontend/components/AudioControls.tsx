import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

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
  return (
    <div className="rounded-[22px] border border-stone-300/80 bg-[#fffaf2]/90 p-5 shadow-[0_12px_30px_rgba(70,52,34,0.06)]">
      <div className="mb-3 text-sm font-medium text-stone-700">Playback</div>

      <input
        aria-label="Seek playback"
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="w-full accent-amber-700"
      />

      <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          aria-label="Skip back 10 seconds"
          onClick={() => onSeek(Math.max(0, currentTime - 10))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-50"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          aria-label={isPlaying ? "Pause playback" : "Play playback"}
          onClick={onPlayPause}
          className="flex h-14 min-w-28 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 fill-current" />
              Pause
            </>
          ) : (
            <>
              <Play className="ml-0.5 h-4 w-4 fill-current" />
              Play
            </>
          )}
        </button>

        <button
          aria-label="Skip forward 10 seconds"
          onClick={() => onSeek(Math.min(duration, currentTime + 10))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-50"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-stone-500">
        {isPlaying ? "Playback in progress" : "Paused"}
      </div>
    </div>
  );
}
