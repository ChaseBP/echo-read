export async function narrateText(
  text: string,
  dramatic: boolean
) {
  const res = await fetch("http://localhost:8000/narrate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      reader_feedback: dramatic ? "more_dramatic" : null,
    }),
  });

  if (!res.ok) {
    const t = res.text().catch(() => "");
    throw new Error("Narration failed: " + t || res.statusText);
  }
  return res.json();
}
