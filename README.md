# Bayern Tickets — Frontend

> React + Vite single-page application for the stadium ticket reservation system.

[![Live Site](https://img.shields.io/badge/site-live-success)](https://football-frontend-olive.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF)](https://vitejs.dev)

## Live site

**https://football-frontend-olive.vercel.app**

Companion backend: [Stadium-Ticket-Reservation-backend](https://github.com/mohammed-aljaberi777/Stadium-Ticket-Reservation-backend) → https://stadium-ticket-reservation-backend.onrender.com

## Features

- **Registration + 2FA setup flow** — the user scans a QR code with Google Authenticator and enters a 6-digit code to finish enrollment.
- **Login with email + password + TOTP code** — every login requires all three.
- **Browse matches** with competition filters and team logos. The page background changes on hover to reflect the competition (Bundesliga, DFB Pokal, Champions League, friendly).
- **Interactive Allianz Arena map** — a custom SVG component with 13 sections across three rings, colored by category, with hover highlights and click-to-select.
- **Seat selection** with a hard limit of 4 seats per fan.
- **Hold timer** — visible 5-minute countdown after the hold is acquired.
- **Booking confirmation** with itemized price summary.
- **My Tickets wallet** — ticket cards with embedded QR codes fetched as authenticated PNGs.
- **Admin panel** (visible only to ADMIN users) — create teams with logo uploads (base64 data URIs), create matches with auto-generated inventory.
- **Gate Scanner** (visible only to GATE_SCANNER users) — html5-qrcode camera scanning plus a manual paste fallback. APPROVED / REJECTED feedback with seat info.

## Tech stack

- **React 18** + **Vite**
- **react-router-dom** for client-side routing
- **html5-qrcode** for camera-based QR scanning
- **AuthContext** (React Context) for session state
- Custom CSS variables for theming (Bayern red + navy palette)

## Run locally

```bash
git clone https://github.com/mohammed-aljaberi777/Stadium-Ticket-Reservation-frontend
cd Stadium-Ticket-Reservation-frontend
npm install
npm run dev
```

Open http://localhost:5173.

> By default the dev server talks to `http://localhost:8000`. To point at the live backend, set `VITE_API_BASE` in a `.env` file:
>
> ```
> VITE_API_BASE=https://stadium-ticket-reservation-backend.onrender.com
> ```

## Build for production

```bash
npm run build         # outputs to dist/
npm run preview       # serves the built bundle locally
```

## Project structure

```
src/
├── api/
│   └── client.js         # Fetch wrapper, all API calls live here
├── auth/
│   └── AuthContext.jsx   # Session, login, logout, refresh
├── components/
│   ├── StadiumMap.jsx    # SVG Allianz Arena map (custom-drawn)
│   └── ...
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── TwoFASetup.jsx
│   ├── Matches.jsx
│   ├── MatchDetail.jsx   # Stadium map + seat picker
│   ├── ConfirmBooking.jsx
│   ├── MyTickets.jsx
│   ├── Admin.jsx         # Teams, matches creation
│   └── Scanner.jsx       # Gate scanner
├── utils/
│   └── teamLogos.jsx     # Logo URL map + colored-circle fallback
├── App.jsx
├── main.jsx
└── index.css             # Design system: variables, animations
public/                   # Static assets (competition backgrounds)
vercel.json               # SPA rewrite for client-side routes
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_BASE` | Yes (in production) | Backend URL. Falls back to `http://localhost:8000`. |

## Deployment

The app is deployed to Vercel and re-deploys automatically on every push to `main`:

```bash
# One-time setup (already done):
npx vercel              # interactive deploy
npx vercel env add VITE_API_BASE     # set the backend URL
npx vercel --prod       # publish

# After: just git push, Vercel handles the rest.
```

A `vercel.json` rewrite rule ensures that direct navigation to `/admin`, `/matches/{id}`, etc. doesn't return 404 — every path falls back to `index.html` so React Router takes over.

## Roles in the UI

| Role | Sees in nav | Pages |
|---|---|---|
| FAN | Matches, My Tickets | Browse + book |
| ADMIN | Matches, My Tickets, **Admin** | + Create teams, stadiums, matches |
| GATE_SCANNER | **Scanner** | Camera QR scanner |

To promote a user to ADMIN or GATE_SCANNER, see the helper script in the backend repo (`promote_admin.py`).

## Author

**Mohammed Al-Jaberi** — final-year project, 2026.
