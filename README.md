# Birthday Experience

A mobile-first Next.js birthday experience with a countdown, animated birthday splash, confetti, Framer Motion, Neon-ready database utilities, and Groq-ready AI utilities.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Neon PostgreSQL
- Groq
- Lucide React

## Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add your Neon and Groq credentials.

Add your own licensed/allowed 10-second audio file:

`public/audio/happy-birthday.mp3`

## Changes in this revision

- Reskinned from a rose/heart romance theme to a warm bakery/cake theme (cupcakes, sprinkles, caramel/gold/frosting palette).
- Fixed a real bug: `FloatingHearts` (now `FloatingTreats`) referenced the bare global `innerHeight`, which doesn't exist during Next.js server-side rendering and would throw on the server. It now reads `window.innerHeight` safely inside `useEffect`.

## Still incomplete (not fixed here — bigger feature work)

- `lib/ai.ts` (Groq chat) and `lib/db.ts` (Neon) are unused — no API route or UI calls them, so the "private chat" feature mentioned in the code's system prompt doesn't exist yet.
- `public/audio/happy-birthday.mp3` is not included; you must add your own licensed file.

## Important

The first page is currently a frontend prototype. For production, move the September 27 access check to a server-side route/middleware, add authentication, and protect the private chat/API routes.

The Neon and Groq helpers are included so the next stages can be added without changing the visual foundation.
