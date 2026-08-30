# AlumniConnect – Backend

Node.js + Express + MongoDB backend for the AlumniConnect platform (alumni networking, mentorship, events, and job/internship opportunities).

## Setup

```bash
cd alumniconnect-backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (local Compass URI or Atlas URI) and JWT_SECRET
npm run dev
```

Server runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

## Folder structure

```
config/         MongoDB connection
models/         Mongoose schemas (User, Connection, Mentorship, Event, Opportunity)
controllers/    Route logic
routes/         Express routers
middleware/     JWT auth + role-based authorization
server.js       App entry point
```

## Auth

Every protected route needs a header:
```
Authorization: Bearer <token>
```
Token is returned from `/api/auth/register` and `/api/auth/login`.

## API Reference

### Auth (`/api/auth`)
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/register` | `name, email, password, role, batch, branch, company` | `role`: student / alumni / admin |
| POST | `/login` | `email, password` | |
| GET | `/me` | — | requires auth |

### Users (`/api/users`)
| Method | Route | Notes |
|---|---|---|
| GET | `/?batch=&branch=&company=&skills=&role=&search=` | Alumni directory search |
| GET | `/mentors?expertise=` | List mentors |
| GET | `/:id` | Get one profile |
| PUT | `/me` | Update own profile |

### Connections (`/api/connections`)
| Method | Route | Body |
|---|---|---|
| POST | `/` | `toUser` (userId) |
| PUT | `/:id` | `status: accepted \| rejected` |
| GET | `/me?status=` | List own connections |

### Mentorships (`/api/mentorships`)
| Method | Route | Body |
|---|---|---|
| POST | `/` | `mentor, expertiseArea, message` |
| GET | `/me?status=` | List own mentorships (as mentor or mentee) |
| PUT | `/:id/status` | `status: active \| declined \| completed` (mentor only) |
| POST | `/:id/sessions` | `date, notes` |

### Events (`/api/events`)
| Method | Route | Body |
|---|---|---|
| POST | `/` | `title, description, eventType, date, location, meetingLink` |
| GET | `/?past=true` | List events (upcoming by default) |
| GET | `/:id` | Get one event |
| POST | `/:id/rsvp` | — |
| DELETE | `/:id` | organizer/admin only |

### Opportunities (`/api/opportunities`)
| Method | Route | Body |
|---|---|---|
| POST | `/` | `title, company, type, location, description, applyLink` |
| GET | `/?type=&search=` | List opportunities |
| POST | `/:id/apply` | — |
| PUT | `/:id/applicants/:userId` | `status: applied \| shortlisted \| rejected \| hired` (poster only) |
| DELETE | `/:id` | poster/admin only |

## Next steps

- Connect the React frontend to these endpoints.
- Deploy: MongoDB Atlas + Render/Railway for the API, Vercel for the frontend (same pattern as your CouponVault deploy).
- Optional: add an AI-powered mentor-matching endpoint using Ollama, similar to NeonLedger's insights tab.
