# 🎧 EchoRead

### _A real-time AI director that elevates narration from robotic to cinematic._

https://github.com/user-attachments/assets/6bd9d4a9-5eb9-46de-8a67-908c484ddc50

### 📺 [Watch the Full Walkthrough on YouTube](https://www.youtube.com/watch?v=8WW38K6xXhQ)
---

**🏆 Built for the ElevenLabs x Google Cloud AI Accelerate Hackathon**

**Tracks:** ElevenLabs Challenge · Google Cloud Vertex AI
**Tech Focus:** Real-time voice direction, emotional performance, cinematic text–audio sync

---

## 🚨 The Problem: The Audiobook Gap

**High-quality, multi-cast audio storytelling is prohibitively expensive and time-consuming.**

* ❌ Professional audiobook production costs **$5,000+** and takes **weeks**.
* ❌ Standard TTS systems are **flat**: they read text literally, ignoring subtext, tension, and emotion.
* ❌ Most AI narration tools stop at *pronunciation*. They don’t understand **why** a line is whispered or **when** a scream should crack.

---

## 💡 The Solution: An AI Director

**EchoRead introduces a reasoning layer between text and audio, functioning as an AI Director.**

Instead of converting `text → speech` directly, EchoRead:
1.  **Understands the scene** (Contextual Awareness)
2.  **Directs voices like actors** (Assigning emotions & stability)
3.  **Performs the story in real time** (Streaming audio)

The result is a **full-cast, emotionally directed audio performance** generated in **seconds** — not weeks.

---

## ✅ Current Product Upgrades

- **Three direction modes**: `cinematic`, `grounded`, and `intimate` now influence the analysis pass before synthesis.
- **Persistent writing studio**: the frontend stores the active draft and selected direction mode between sessions.
- **Richer playback telemetry**: the UI now shows cache hits, direction metadata, segment cards, and a downloadable render.
- **Harder backend contract**: request validation, bounded caches, environment-based CORS, and clearer API failure messages.

---

## ✨ Key Differentiators

| Feature | Traditional TTS | EchoRead |
| --- | --- | --- |
| **Voice Casting** | Single static voice | **🎭 Dynamic multi-role casting** |
| **Context Scope** | Isolated sentences | **📖 Full scene context analysis** |
| **Emotional Logic** | Flat / Literal | **🧠 Detects subtext (sarcasm, fear)** |
| **Voice Parameters** | Static global settings | **Dynamic per-line tuning (style, speed, stability)** |
| **Dialogue Handling** | Reads quotes | **🎬 Performs characters** |
| **Pacing** | Constant speed | **Micro-pauses & intensity shifts** |

---

## 🏗️ System Architecture

<img width="942" height="392" alt="Image" src="https://github.com/user-attachments/assets/6468984d-975c-40dc-afd4-2b8c81953f94" />

### The EchoRead Engine
Unlike simple TTS wrappers, EchoRead uses a multi-stage **orchestration engine** to construct a performance:

#### 1. 📥 Ingestion
Raw novel text is received from the user.

#### 2. 🧠 Director Agent (Gemini 3 Flash)
The **entire scene** is passed to the LLM to ensure global context. Gemini analyzes the narrative arc and outputs a structured "Performance Script" (JSON) containing roles, emotions, and intensity levels for every line.
> ⚡ **Optimization:** This analysis is stored in the **Analysis Cache**. If audio generation needs a retry, we reuse this existing narrative direction.

#### 3. 🧩 Text Alignment Engine
We map the LLM's generated segments back to the original source text using **exact string matching** with a fallback to **fuzzy matching**. This ensures perfect 1:1 alignment between the script and the audio generation chunks.

#### 4. 🎛️ Segment Orchestrator
The engine translates the JSON parameters (e.g., `intensity: 5`) into specific ElevenLabs voice settings (e.g., `stability: 0.5`, `style: 1.0`, `speed: 1.06`).

#### 5. 🗣️ Directed Synthesis
Audio is generated segment-by-segment.
> 💾 **Optimization:** The final mastered audio is stored in the **Audio Cache**. If the user re-submits the exact same text, the full performance is served instantly.

#### 6. 🎞️ Timeline Builder
The backend stitches audio blobs and aligns word-level timestamps to create the "Karaoke" sync data.

---

## 🧠 Under the Hood: The Director Engine

_EchoRead_ is powered by the **Director Engine**—a reasoning layer that decides *how* something should be spoken **before** it is synthesized.

We force Gemini 3 Flash to output a strict schema that directs the performance:

```json
{
  "global": {
    "dominant_emotion": "tense",
    "default_pace": "fast"
  },
  "segments": [
    {
      "text": "I told you to leave me alone!",
      "role": "male_character",
      "emotion": "angry",
      "intensity": 5,
      "audio_tag": "angry"
    }
  ]
}
```
---

## 🛠️ Installation & Setup

### 📋 Prerequisites

Before you begin, ensure you have the following installed:
* **[Node.js v20+](https://nodejs.org/)** (Required for Next.js 16)
* **[Python 3.10+](https://www.python.org/downloads/)** (Required for FastAPI)
* **API Keys:**
    * **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))
    * **ElevenLabs API Key** (Get it from [ElevenLabs](https://elevenlabs.io/))
---
###  Clone the repository
``` bash
git clone https://github.com/ChaseBP/echo-read
```
---
### 1️⃣ Backend Setup (FastAPI)
*The backend handles the narrative logic (Gemini) and audio synthesis (ElevenLabs).*

**⚠️ Step 1: Configure Environment Variables (Do this first!)**
1. Create a root `.env` file for the backend.
2. Create `frontend/.env.local` for the frontend.

```bash
# /.env
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CACHE_MAX_ITEMS=24
MAX_TEXT_CHARS=12000

# /frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment (Recommended to avoid conflicts)
python3 -m venv venv

# 3. Activate the virtual environment
# ------------------------------------
#  On macOS / Linux:
source venv/bin/activate
#  On Windows:
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Start the server
uvicorn app.main:app --reload

# ✅ Success! The API should be running at: http://localhost:8000

```

### 2️⃣ Frontend Setup (Next.js 16)
*The frontend provides the cinematic playback interface.*

```bash
# 1. Navigate to the frontend directory (Open a new terminal)
cd frontend

# 2. Install dependencies
# Use 'npm ci' instead of 'install' to strictly adhere to the lockfile
# This prevents version mismatches with Next.js 16 / Tailwind v4
npm ci

# 3. Start the development server
npm run dev

# ✅ Success! Open your browser to: http://localhost:3000
```
---

## 💻 Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **AI Brain** | ![Gemini](https://img.shields.io/badge/Google%20Gemini-3%20Flash-8E75B2?style=flat-square&logo=googlebard&logoColor=white) | Handles narrative reasoning, emotion extraction, and text segmentation. |
| **Voice Engine** | ![ElevenLabs](https://img.shields.io/badge/ElevenLabs-v3-333333?style=flat-square&logo=googlepodcasts&logoColor=white) | Generates high-fidelity, context-aware speech with ultra-low latency. |
| **Frontend** | ![Next.js 16](https://img.shields.io/badge/Next.js-16_RC-000000?style=flat-square&logo=next.js) | **App Router & React 19**. Provides a cinematic, glitch-free UI. |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4_Alpha-38B2AC?style=flat-square&logo=tailwind-css) | Utility-first styling for rapid, responsive design. |
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white) | Asynchronous backend handling API orchestration and audio stream buffering. |
---

## 🚀 Future Roadmap

- [ ] **🎙️ Studio-Grade Export (.WAV)** *Allow authors to compile their narrated stories into single, mastered audio files for podcast or audiobook distribution.*

- [ ] **🔊 Dynamic Soundscapes (SFX Injection)** *Use Gemini to detect scene context (e.g., "It was a stormy night") and automatically layer rain, thunder, or city ambience under the voice track.*

## 🧭 Recommended Next Steps

- **Persist caches outside process memory** using Redis, S3, or a database-backed asset store so restarts do not erase analysis/audio work.
- **Replace fixed role buckets with character-level casting** so named speakers can keep their own identities across longer chapters.
- **Add background jobs or streaming synthesis** to avoid long blocking requests on larger passages.
- **Store projects and renders per user** so authors can iterate on scenes, compare direction modes, and keep reusable libraries.







