# EchoRead Frontend

Next.js 16 frontend for EchoRead's directed narration experience.

## What It Covers

- Story compose view with sample scenes and direction modes
- Playback view with word-level sync, role timeline, and metadata panels
- API integration for FastAPI narration responses

## Local Development

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Then run:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```

## Key Files

- `app/page.tsx`: top-level app state and audio lifecycle
- `components/ComposeMode.tsx`: compose workflow and scene presets
- `components/PlaybackMode.tsx`: synchronized playback surface
- `lib/api.ts`: typed backend API client

## Notes

- The frontend expects the backend to return base64 audio plus segment and word timeline metadata.
- If you change the backend origin, keep `NEXT_PUBLIC_API_BASE_URL` and backend `CORS_ORIGINS` aligned.
