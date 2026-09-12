# LiveVote

Mentimeter-style live contests with **no participant caps**.

## Two links (important)

| Who | Open this |
| --- | --- |
| **Audience** | `/` (home) — code or QR only. No dashboard. |
| **Host** | `/host` — create contests, edit slides, **Present → Go live** |

Never share `/host` with the audience. Share only your public URL (home page).

## Audience flow

1. Open the public link
2. Enter the contest code **or** tap **Scan QR code**
3. Wait until the host goes live, then vote (3‑minute window)

## Host flow

1. Open `/host`
2. Create / edit contest (Excel import for names)
3. Click **Present / Go live**
4. Show the QR + code on the big screen
5. Click **Go live · open voting (3 min)**

## Should the local server stay on?

**Yes, if you’re only running locally** (`npm run dev` + optional Cloudflare tunnel): the contest dies when your PC sleeps or the terminal stops.

For a real event, deploy once to a free always-on host (Render) from GitHub, then you don’t need the local server.

## Run locally

```bash
npm install
npm run dev
```

- Audience: http://localhost:3000  
- Host: http://localhost:3000/host  

## Deploy

**GitHub:** https://github.com/josh19ab/livevote  

[Deploy to Render](https://render.com/deploy?repo=https://github.com/josh19ab/livevote)
