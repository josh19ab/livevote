# LiveVote

Mentimeter-style live contests with **no participant caps**.

## Live URL (no laptop needed)

**https://livevote-production.up.railway.app**

| Who | Open |
| --- | --- |
| **Audience** | https://livevote-production.up.railway.app |
| **Host** | https://livevote-production.up.railway.app/host |

You do **not** need to run `npm run dev` on your laptop for contests.

## Two links (important)

| Who | Open this |
| --- | --- |
| **Audience** | `/` — code or QR only |
| **Host** | `/host` — create contests, edit, **Present → Go live** |

Never share `/host` with the audience.

## Host flow

1. Open `/host`
2. Create / edit contest (Excel import for names)
3. Click **Present / Go live**
4. Show the QR + code on the big screen
5. Click **Go live · open voting (3 min)**

## Deploy (Railway)

Already deployed to Railway. To redeploy after code changes:

```bash
railway up --service livevote
```

**GitHub:** https://github.com/josh19ab/livevote

## Run locally (optional)

```bash
npm install
npm run dev
```

- Audience: http://localhost:3000  
- Host: http://localhost:3000/host  
