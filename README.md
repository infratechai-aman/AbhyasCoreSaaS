# AbhyasCore

Premium AI-powered JEE and NEET mock test platform built with Next.js 14, TypeScript, TailwindCSS, Framer Motion, Firebase, and OpenAI.

## Stack

- Next.js 14 App Router
- TypeScript
- TailwindCSS
- Framer Motion
- Firebase Authentication + Firestore
- OpenAI `gpt-4o-mini`
- Vercel-ready deployment

## Routes

- `/` premium marketing homepage
- `/pricing` pricing experience
- `/dashboard` student dashboard
- `/dashboard/tests` test selection
- `/dashboard/tests/mock-live` real exam-style interface
- `/dashboard/performance` analytics
- `/dashboard/ai-tutor` AI tutor workspace
- `/dashboard/leaderboard` leaderboard

## Setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill in Firebase and OpenAI credentials
4. Run `npm run dev`

## Architecture Notes

- Firebase is used here instead of PostgreSQL so the project matches your latest plan.
- API routes are ready for AI analysis and tutoring.
- The UI is modular, so we can plug in live auth, Firestore question banks, and exam attempt persistence next.
