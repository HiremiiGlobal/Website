# AQYR Global Service

Next.js App Router project that brings the existing bilingual AQYR website demo into a Next.js application while preserving its current pages, styles, language switch, and interactions.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Build for deployment

```bash
pnpm build
pnpm start
```

The existing HTML pages are copied into `content/` as the content source during this first import, so the visual demo stays intact. The route files in `app/` render those pages through the Next.js App Router; shared styles and the existing browser script are loaded by the root layout. Internal `.html` links are preserved with rewrites in `next.config.ts`.
