# AlumniConnect – Frontend

React + Vite frontend for AlumniConnect, styled to match the HKP102004 portfolio aesthetic: black matte background, glowing white text, Audiowide + Electrolize fonts, blue glow accents, pill-shaped nav.

## Setup

```bash
cd alumniconnect-frontend
npm install
cp .env.example .env
# set VITE_API_URL to your backend URL (default http://localhost:5000/api)
npm run dev
```

Runs on `http://localhost:5173` by default. Make sure the backend is running first.

## Pages

| Route | Description |
|---|---|
| `/` | Landing / hero |
| `/login`, `/register` | Auth |
| `/directory` | Alumni & student search |
| `/profile` | Edit your own profile, opt in as a mentor |
| `/mentorship` | Browse mentors, request mentorship, track your mentorships |
| `/events` | Browse events, host your own, RSVP |
| `/opportunities` | Job/internship board, post & apply |

## Design tokens

Defined in `src/styles/global.css`:
- **Fonts:** Audiowide (display/headings), Electrolize (body)
- **Colors:** near-black background (`--bg`), matte slate-blue accent (`--blue: #5b8fd9`), white glow (`text-shadow`) on headings
- **Components:** `.pill` (nav/tags), `.btn-primary` (matte blue gradient), `.card` (dark surface with hover glow), `.tag-badge` (skill/type chips)

## Next steps

- Connect to the AlumniConnect backend (see its README for the full API reference)
- Deploy: Vercel (same pattern as your other projects)
- Optional: add profile pictures, notifications, or an AI-powered mentor-match suggestion tab
