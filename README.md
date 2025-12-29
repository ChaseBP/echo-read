# 🎧 EchoRead

### _A real-time narrative performance engine that directs AI voices to **act**, not just read._

![EchoRead Cinematic Demo](insert_link_here)

**🏆 Built for the ElevenLabs x Google Cloud AI Accelerate Hackathon**

**Tracks:** ElevenLabs Challenge · Google Cloud Vertex AI

**Tech Focus:** Real-time voice direction, emotional performance, cinematic text–audio sync

---

## 🚨 Why EchoRead Exists (The Audiobook Gap)

### The Problem

High-quality, multi-cast audio storytelling is **gatekept**.

- Professional audiobook production costs **$5,000+**

- Takes **weeks** of casting, direction, and post-production

- Standard TTS systems are _flat_: they read text literally, ignoring **subtext**, **tension**, and **emotion**

Most AI narration tools stop at _pronunciation_.

They don’t understand **why** a line is whispered… or **when** a scream should crack.

---

### The Solution — _EchoRead_

EchoRead acts as an **AI Audio Director**.

Instead of converting text → speech directly, EchoRead:

1. **Understands the scene**

2. **Directs voices like actors**

3. **Performs the story in real time**

The result is a **full-cast, emotionally directed audio performance** generated in seconds — not weeks.

---

## ✨ Key Differentiators

| Feature | Traditional TTS | **EchoRead** |

|------|-----------------|--------------|

| Voice Casting | Single static voice | 🎭 Dynamic multi-role casting |

| Emotional Awareness | Flat / sentence-level | 🧠 Scene-aware emotional flow |

| Pace Control | Linear | 🎚️ Intensity-driven micro-variation |

| Dialogue Handling | Reads quotes | 🎬 Performs characters |

| Creative Direction | None | 🎧 AI Director Engine |

| Playback Sync | Audio only | 🎥 Real-time word-level cinematic sync |

---

## 🏗️ System Architecture

![System Architecture](insert_link_to_architecture_screenshot_here)

**High-level Flow:**

1. User submits story text

2. **Gemini-3-Flash** analyzes narrative structure & emotion

3. Structured JSON “performance script” is generated

4. **ElevenLabs v3** synthesizes emotionally directed audio

5. Frontend renders synced text, roles, emotion, and intensity in real time

---

## 🧠 Under the Hood: The Director Engine

EchoRead’s core innovation is its **Director Engine** — a reasoning layer that decides _how_ something should be spoken **before** it is synthesized.

At the heart of this is a carefully constrained system prompt and schema that forces Gemini to think like a **performance analyst**, not a summarizer.

---

## 🛠️ Installation Instructions

### Prerequisites

- Node.js v20+

- Python 3.10+

- FFmpeg (Installed and in PATH)

### 1️⃣ Frontend Setup (Next.js 16)

We use `npm ci` to ensure you get the exact lockfile versions for Next.js 16 and Tailwind v4.

```bash

cd frontend

npm ci

npm run dev

# App runs at http://localhost:3000



```

### 2️⃣ Backend Setup (FastAPI)

```bash

cd backend

python -m venv venv

source venv/bin/activate    # Windows: venv\Scripts\activate

pip install -r requirements.txt



# Create .env file with your keys

# ELEVENLABS_API_KEY=...

# GOOGLE_API_KEY=...



uvicorn app.main:app --reload

# Backend runs at http://localhost:8000



```

---

## 💻 Tech Stack

- **Narrative Intelligence:** Google Gemini 3 Flash (Reasoning)

- **Voice Synthesis:** ElevenLabs v3 (High-fidelity performance)

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (Beta)

- **Backend:** Python FastAPI

---

## 🚀 Future Roadmap

- **Export to Mastered Audio (.WAV):** Allow authors to download the final mix for podcasts/audiobooks.

- **User Voice Cloning:** Authors can clone their own voice to be the "Narrator" role.

- **Ambient Soundscape Injection:** Automatically generating rain, city noise, or battle sounds based on the text context.

---

**License:** MIT

---
