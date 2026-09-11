# LiveVote

Interactive contest / Mentimeter-style voting with **no participant caps**.

## Audience flow

1. Share the hosted home page link with your audience.
2. They enter the **contest code** or **scan the QR** on the present screen.
3. Host clicks **Go live · open voting (3 min)** — voting opens immediately and **auto-closes after 3 minutes**.
4. For large lists (100+ names), voters use the **search bar** to find who to vote for.

## Host features

- Create contests and slides in the editor
- **Import voting options from Excel** (`.xlsx` / `.xls` / `.csv`) — first column or a `Name` / `Option` / `Nominee` header
- Present mode with QR + live results
- Demo contest code: **DEMO01**

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

**GitHub:** https://github.com/josh19ab/livevote

This app needs a **single long-running Node server** (live voting state + SSE).

### Free hosting (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/josh19ab/livevote)

Or: Render dashboard → New → Web Service → connect `josh19ab/livevote` → build `npm install && npm run build` → start `npm start`.

> Avoid plain Vercel/Netlify serverless for live contests — in-memory votes and SSE need one persistent process.
