import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Literata } from "next/font/google";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("echoread-theme");
    const theme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {}
})();
`;

export const metadata: Metadata = {
  title: "EchoRead | Directed AI Narration",
  description:
    "An AI-directed narration studio that analyzes story context, casts voices, and plays back synchronized multi-voice performances.",
  applicationName: "EchoRead",
  keywords: [
    "AI narration",
    "audiobook",
    "text to speech",
    "ElevenLabs",
    "Gemini",
    "storytelling",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${literata.variable} ${atkinson.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
