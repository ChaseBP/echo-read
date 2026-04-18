import { motion } from "motion/react";
import { BookOpenText, LoaderCircle } from "lucide-react";

import {
  DIRECTION_OPTIONS,
  DirectionMode,
  MAX_STORY_CHARS,
  SAMPLE_STORIES,
  SampleStory,
} from "@/lib/narration";

interface ComposeModeProps {
  text: string;
  directionMode: DirectionMode;
  isLoading: boolean;
  loadingStage: string;
  errorMessage: string | null;
  onTextChange: (text: string) => void;
  onDirectionChange: (directionMode: DirectionMode) => void;
  onUseSample: (sample: SampleStory) => void;
  onNarrate: () => void;
}

function formatMinutes(wordCount: number) {
  if (!wordCount) return "0m";
  const minutes = Math.max(1, Math.round(wordCount / 150));
  return `${minutes}m`;
}

export function ComposeMode({
  text,
  directionMode,
  isLoading,
  loadingStage,
  errorMessage,
  onTextChange,
  onDirectionChange,
  onUseSample,
  onNarrate,
}: ComposeModeProps) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characterCount = text.length;
  const selectedDirection = DIRECTION_OPTIONS.find(
    ({ id }) => id === directionMode,
  );
  const canNarrate =
    text.trim().length > 0 && characterCount <= MAX_STORY_CHARS && !isLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-6 lg:px-7 lg:py-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="max-w-3xl space-y-3">
          <div className="text-sm font-medium tracking-[0.08em] text-stone-500 dark:text-stone-400">
            EchoRead
          </div>
          <h1 className="text-4xl leading-tight text-stone-900 dark:text-stone-100 lg:text-6xl">
            A quieter interface for shaping narrated scenes.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">
            Paste a passage, choose the reading style, and generate a
            performance with voice shifts, emotional direction, and synced text.
          </p>
        </header>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.28fr)_330px]">
          <section className="rounded-[28px] border border-stone-300/80 bg-[#fffaf2]/92 p-4 shadow-[0_18px_44px_rgba(70,52,34,0.08)] dark:border-stone-700/70 dark:bg-[#231d19]/92 dark:shadow-[0_18px_44px_rgba(0,0,0,0.28)] lg:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-stone-200 bg-[#f8f1e8] px-4 py-3 text-sm text-stone-600 dark:border-stone-700/70 dark:bg-[#2b2420] dark:text-stone-300">
              <div className="flex flex-wrap items-center gap-3">
                <span>{wordCount} words</span>
                <span>{characterCount}/{MAX_STORY_CHARS} chars</span>
                <span>{formatMinutes(wordCount)} listen</span>
              </div>
              <span>{selectedDirection?.description}</span>
            </div>

            <textarea
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="Paste a scene, chapter excerpt, or dialogue passage."
              className="mx-auto h-[460px] w-full max-w-[65ch] resize-none rounded-[24px] border border-stone-200 bg-[#fbf7ef] px-5 py-5 text-[1.125rem] leading-[1.8rem] text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 dark:border-stone-700/70 dark:bg-[#191512] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500 lg:h-[560px] lg:px-7 lg:py-6"
            />

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onUseSample(SAMPLE_STORIES[0])}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-[#2a241f] dark:text-stone-200 dark:hover:bg-[#342d28]"
                >
                  Featured sample
                </button>
                <button
                  onClick={() => onTextChange("")}
                  className="rounded-full border border-stone-300 bg-transparent px-4 py-2 text-sm text-stone-600 transition hover:bg-white/60 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-[#2a241f]"
                >
                  Clear
                </button>
              </div>

              <button
                onClick={onNarrate}
                disabled={!canNarrate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    {loadingStage}
                  </>
                ) : (
                  "Generate narration"
                )}
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[24px] border border-stone-300/80 bg-[#fffaf2]/92 p-5 shadow-[0_12px_30px_rgba(70,52,34,0.06)] dark:border-stone-700/70 dark:bg-[#231d19]/92 dark:shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
                <BookOpenText className="h-4 w-4" />
                Direction
              </div>
              <div className="space-y-2">
                {DIRECTION_OPTIONS.map((option) => {
                  const active = option.id === directionMode;

                  return (
                    <button
                      key={option.id}
                      onClick={() => onDirectionChange(option.id)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-stone-400 bg-stone-100 dark:border-stone-500 dark:bg-[#312922]"
                          : "border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-700 dark:bg-[#1a1613] dark:hover:bg-[#26201c]"
                      }`}
                    >
                      <div className="text-sm font-medium text-stone-800 dark:text-stone-100">
                        {option.label}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[24px] border border-stone-300/80 bg-[#fffaf2]/92 p-5 shadow-[0_12px_30px_rgba(70,52,34,0.06)] dark:border-stone-700/70 dark:bg-[#231d19]/92 dark:shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-200">
                Sample passages
              </div>
              <div className="space-y-2">
                {SAMPLE_STORIES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onUseSample(sample)}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:bg-stone-50 dark:border-stone-700 dark:bg-[#1a1613] dark:hover:bg-[#26201c]"
                  >
                    <div className="text-sm font-medium text-stone-800 dark:text-stone-100">
                      {sample.title}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
                      {sample.hook}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
