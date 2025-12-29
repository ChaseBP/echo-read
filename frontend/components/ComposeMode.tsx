import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface ComposeModeProps {
  initialText: string;
  isLoading: boolean;
  onNarrate: (text: string) => void;
}

const SAMPLE_STORY = `The old lighthouse stood against the twilight sky, its beacon dark for the first time in a century.

"We can't let it die," Marcus said, his voice breaking through the silence.

Elena turned to him, her eyes reflecting the dying light. "Some things are meant to end, Marcus. That's just how the world works."

"Not this," he insisted, placing his hand on the cold stone. "Not while I still breathe."

The wind picked up, carrying with it the salt of the sea and the weight of countless stories. They stood there, two souls bound by memory and stubborn hope, refusing to let go of what once was.`;

export function ComposeMode({
  initialText,
  isLoading,
  onNarrate,
}: ComposeModeProps) {
  const [text, setText] = useState(initialText);

  const handleNarrate = () => {
    if (text.trim() || SAMPLE_STORY) {
      onNarrate(text.trim() || SAMPLE_STORY);
    }
  };

  const handleUseSample = () => {
    setText(SAMPLE_STORY);
  };

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4 lg:p-8"
    >
      <div className="max-w-4xl w-full space-y-6 lg:space-y-8">
        {/* Logo and Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2 lg:space-y-3"
        >
          <div className="flex items-center justify-center gap-2 lg:gap-3">
            <div className="relative">
              <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-blue-400" />
              <div className="absolute inset-0 blur-xl bg-blue-400/30 animate-pulse" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif bg-linear-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              EchoRead
            </h1>
          </div>
          <p className="text-slate-400 text-base lg:text-lg">
            Cinematic Multi-Voice AI Narration
          </p>
        </motion.div>

        {/* Story Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl lg:rounded-3xl blur-2xl" />

          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl lg:rounded-3xl p-1 shadow-2xl">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your story here, or use our sample story to experience EchoRead..."
              className="w-full h-64 lg:h-96 bg-slate-900/70 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-serif leading-relaxed text-sm lg:text-base"
            />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4"
        >
          {!text && (
            <button
              onClick={handleUseSample}
              className="w-full sm:w-auto px-6 py-3 rounded-xl lg:rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all text-sm lg:text-base"
            >
              Use Sample Story
            </button>
          )}

          <button
            onClick={handleNarrate}
            disabled={isLoading || !text.trim()}
            className="w-full sm:w-auto group relative px-10 lg:px-12 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 text-sm lg:text-base"
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 rounded-xl lg:rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
            <span className="relative text-white flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
              {isLoading ? "Narrating..." : "Narrate Story"}
            </span>
          </button>
        </motion.div>

        {/* Feature Hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 text-xs lg:text-sm text-slate-500"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Multi-Voice</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Dynamic Emotions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <span>Real-Time Sync</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
