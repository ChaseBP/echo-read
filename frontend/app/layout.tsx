import type { Metadata } from "next";
import { Literata } from "next/font/google";
import "./globals.css";

const literata = Literata({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={literata.className}>{children}</body>
    </html>
  );
}
