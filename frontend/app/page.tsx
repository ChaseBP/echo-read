"use client";

import { useState, useRef } from "react";
import { Play, Pause, Sparkles } from "lucide-react";
import { narrateText } from "@/lib/api";

export default function Page() {
  const [storyText, setStoryText] = useState("");
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDramatic, setIsDramatic] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleNarrate = async () => {
    if (!storyText.trim()) return;

    try {
      setIsNarrating(true);
      setIsPlaying(false);
      setProgress(0);
      setAudioUrl(null);

      const data = await narrateText(storyText, isDramatic);

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    } catch (err) {
      alert("Narration failed. Try a shorter text.");
    } finally {
      setIsNarrating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current?.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    audioRef.current.currentTime =
      (clickX / rect.width) * audioRef.current.duration;
  };

  const characterCount = storyText.length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            <h1 className="text-5xl tracking-tight ">EchoRead</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Adaptive AI Voice Narration for Light Novels
          </p>
        </header>

        {/* Story Input */}
        <div className="mb-8">
          <div className="relative">
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="Paste your light novel text here…"
              className="w-full h-80 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
              disabled={isNarrating}
            />
            {characterCount > 0 && (
              <div className="absolute bottom-4 right-6 text-sm text-gray-500">
                {characterCount.toLocaleString()} characters
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={handleNarrate}
            disabled={isNarrating || !storyText.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-gray-600 px-8 py-4 rounded-xl transition-all shadow-lg"
          >
            {isNarrating ? "Narrating…" : "Narrate"}
          </button>

          <button
            onClick={() => setIsDramatic(!isDramatic)}
            disabled={isNarrating}
            className={`px-6 py-4 rounded-xl border-2 transition-all ${
              isDramatic
                ? "bg-purple-600 border-purple-600 text-white"
                : "border-zinc-800 text-gray-400 hover:border-zinc-700"
            }`}
          >
            More Dramatic
          </button>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-6">
              <button
                onClick={togglePlayPause}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" fill="currentColor" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                )}
              </button>

              <div
                className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={audioUrl ?? undefined}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (!audioRef.current?.duration) return;
            setProgress(
              (audioRef.current.currentTime /
                audioRef.current.duration) *
                100
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
