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

This app needs a **single long-running Node server** (in-memory live state + SSE).  
Deploy with Render / Railway / Fly using `npm run build && npm start`, or connect the GitHub repo to a free Node host.
