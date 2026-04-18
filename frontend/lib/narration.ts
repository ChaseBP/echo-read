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

export type VoiceRole = "narrator" | "male_character" | "female_character";
export type DirectionMode = "cinematic" | "grounded" | "intimate";

export interface NarrationCharTimelineItem {
  char: string;
  index: number;
  start: number;
  end: number;
  role: VoiceRole;
}

export interface NarrationWordTimelineItem {
  word: string;
  start: number;
  end: number;
  char_start: number;
  char_end: number;
  role: VoiceRole;
}

export interface NarrationTimelineItem {
  role: VoiceRole;
  emotion: Emotion;
  intensity: number;
  start: number;
  end: number;
  text: string;
  audio_tag: string;
}

export interface NarrationMetadata {
  cache_hit: boolean;
  analysis_cache_hit: boolean;
  segment_count: number;
  word_count: number;
  duration_seconds: number;
  dominant_emotion: Emotion;
  default_pace: "slow" | "medium" | "fast";
  direction_mode: DirectionMode;
}

export interface NarrationResponse {
  audio: string;
  timeline: NarrationTimelineItem[];
  char_timeline: NarrationCharTimelineItem[];
  word_timeline: NarrationWordTimelineItem[];
  metadata: NarrationMetadata;
}

export interface RoleTimelineSegment extends NarrationTimelineItem {
  startProgress: number;
  endProgress: number;
}

export interface DirectionOption {
  id: DirectionMode;
  label: string;
  description: string;
}

export interface SampleStory {
  id: string;
  title: string;
  hook: string;
  directionMode: DirectionMode;
  text: string;
}

export const MAX_STORY_CHARS = 12000;

export function normalizeStoryText(text: string) {
  return text.replace(/\r\n/g, "\n").normalize("NFKC");
}

export const DIRECTION_OPTIONS: DirectionOption[] = [
  {
    id: "cinematic",
    label: "Cinematic",
    description: "High contrast, sharper beats, and more dramatic pacing.",
  },
  {
    id: "grounded",
    label: "Grounded",
    description: "Subtle, restrained delivery with realism over spectacle.",
  },
  {
    id: "intimate",
    label: "Intimate",
    description: "Closer, softer performances with emotional nuance.",
  },
];

export const SAMPLE_STORIES: SampleStory[] = [
  {
    id: "lighthouse",
    title: "The Lighthouse",
    hook: "Hope versus inevitability on a cold coast.",
    directionMode: "cinematic",
    text: `The old lighthouse stood against the twilight sky, its beacon dark for the first time in a century.

"We can't let it die," Marcus said, his voice breaking through the silence.

Elena turned to him, her eyes reflecting the dying light. "Some things are meant to end, Marcus. That's just how the world works."

"Not this," he insisted, placing his hand on the cold stone. "Not while I still breathe."

The wind picked up, carrying with it the salt of the sea and the weight of countless stories. They stood there, two souls bound by memory and stubborn hope, refusing to let go of what once was.`,
  },
  {
    id: "alley",
    title: "Rain Alley",
    hook: "A noir exchange that works well for voice switching.",
    directionMode: "grounded",
    text: `Rain fell in silver lines between the buildings, turning the alley into a corridor of broken mirrors.

"You came alone?" Mara asked.

Jonah stopped beneath the flickering sign and looked at her through the downpour. "You told me to."

"I told you to be careful."

He laughed once, tired and hollow. "That would've been a different night."`,
  },
  {
    id: "letter",
    title: "The Letter",
    hook: "A quieter scene built for softer emotional contour.",
    directionMode: "intimate",
    text: `Nora unfolded the letter with both hands, as if too much force might bruise the paper.

It was only three sentences long, but every word seemed to breathe.

"I kept waiting for the right moment to come back," she read aloud. "Then I realized the right moment had already passed."

The room stayed still around her, tender and unforgiving.`,
  },
];
