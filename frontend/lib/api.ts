import { DirectionMode, NarrationResponse } from "@/lib/narration";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

interface NarrateTextOptions {
  text: string;
  directionMode: DirectionMode;
  signal?: AbortSignal;
}

export async function narrateText({
  text,
  directionMode,
  signal,
}: NarrateTextOptions): Promise<NarrationResponse> {
  const res = await fetch(`${API_BASE_URL}/narrate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      direction_mode: directionMode,
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    try {
      const parsed = JSON.parse(body) as { detail?: string };
      throw new Error(
        parsed.detail || `Narration failed with status ${res.status}.`,
      );
    } catch {
      throw new Error(body || `Narration failed with status ${res.status}.`);
    }
  }

  return (await res.json()) as NarrationResponse;
}
