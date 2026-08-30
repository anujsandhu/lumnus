# 🎓 Lumnus — Alumni & Student Networking Platform

[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite%208-646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express-339933?logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Auth%2FStorage-Firebase-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?logo=cloudinary)](https://cloudinary.com/)

**Lumnus** is a full-stack web platform designed to bridge the gap between college alumni, current students, and faculty. It facilitates mentorship programs, alumni directory discovery, career opportunity listings, campus & virtual event RSVPs, and professional connection building.

---

## 🌟 Key Features

### 🔍 1. Interactive Alumni & Student Directory
- **Advanced Filtering**: Filter community members by batch year, branch/department, company, skills, or platform role (`student`, `alumni`, `admin`).
- **Real-Time Search**: Search by name, designation, or keyword.
- **Connection Requests**: Send, accept, or reject peer-to-peer connection requests.

### 🤝 2. Mentorship Program
- **Mentor Profiles**: Browse mentors filtered by expertise area (e.g., Software Engineering, Data Science, Product Management).
- **Session Booking**: Book 1-on-1 mentorship sessions with custom agenda notes and preferred time slots.
- **Mentorship Tracker**: Dedicated dashboard to track active, pending, declined, and completed mentorship requests for both mentors and mentees.

### 💼 3. Career Opportunities Portal
- **Job & Internship Board**: Post and explore full-time jobs, internships, and research roles.
- **Direct Application Pipeline**: One-click application process for students.
- **Applicant Status Tracking**: Opportunity posters can manage candidates through status stages (`applied`, `shortlisted`, `hired`, `rejected`).

### 📅 4. Events & Reunions Hub
- **Upcoming & Past Events**: Explore workshops, webinars, panel discussions, and alumni meetups.
- **Instant RSVP**: Confirm attendance with live guest count updates.
- **Virtual Integration**: Direct meeting links (Google Meet, Zoom, etc.) for registered participants.

### 👤 5. Comprehensive Profile & Media Management
- **Rich User Profiles**: Display bio, graduation batch, branch, current employer, skills, LinkedIn/GitHub links.
- **Avatar Adjustment & Cloud Upload**: Crop and adjust profile images with real-time preview powered by Cloudinary and Multer.

---

## 🏗️ Architecture & Project Structure

The project is structured as an **npm workspace monorepo**, managing both the frontend React client and Node.js Express backend from a single repository.

```
lumnus-workspace/
├── package.json                   # Monorepo root configuration & scripts
├── README.md                      # Workspace documentation
│
├── lumnus-backend/                # Node.js + Express REST API
│   ├── config/                    # MongoDB connection configuration (db.js)
│   ├── controllers/               # Request handlers (auth, user, mentorship, events, jobs)
│   ├── middleware/                # JWT verification & role authorization middleware
│   ├── models/                    # Mongoose database schemas
│   │   ├── User.js                # User accounts & profile data
│   │   ├── Connection.js          # Peer connection state
│   │   ├── Mentorship.js          # Mentorship requests & sessions
│   │   ├── Event.js               # Events & RSVP records
│   │   └── Opportunity.js         # Jobs, internships & applications
│   ├── routes/                    # API route definitions
│   ├── server.js                  # Express app entry point
│   ├── .env.example               # Backend environment variable template
│   └── package.json
│
└── lumnus-frontend/               # Vite + React 19 Single Page Application
    ├── src/
    │   ├── api/                   # Axios client & API endpoints config
    │   ├── components/            # Reusable UI components (Navbar, Footer, Modals)
    │   ├── context/               # React Context (AuthContext, ToastContext)
    │   ├── pages/                 # Application views
    │   │   ├── Landing.jsx        # Landing page with hero banner & stats
    │   │   ├── Directory.jsx      # Member search & network discovery
    │   │   ├── Profile.jsx        # User profile & avatar editor
    │   │   ├── Mentorship.jsx     # Mentorship discovery & booking
    │   │   ├── Events.jsx         # Event management & RSVPs
    │   │   ├── Opportunities.jsx  # Job board & application management
    │   │   ├── Login.jsx / Register.jsx # Authentication pages
    │   │   └── Contact / About / Legal pages
    │   ├── styles/                # Global CSS tokens & styles
    │   ├── firebase.js            # Firebase client SDK initialization
    │   └── App.jsx                # Router configuration & protected routes
    ├── .env.example               # Frontend environment variable template
    └── package.json
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite 8
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **State & Context**: React Context API (AuthContext, ToastContext)
- **Styling**: Modern Vanilla CSS with CSS variables, Glassmorphism, Responsive Grid/Flexbox
- **Animations & Icons**: `@dotlottie/player-component` (Lottie Animations)
- **Services**: Firebase Web SDK

### Backend
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS password hashing
- **File & Media Storage**: Cloudinary API + Multer Middleware
- **Security**: CORS, Dotenv environment management

---

## ⚡ Quick Start & Local Setup

### Prerequisites
Make sure you have the following installed on your local machine:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` OR a MongoDB Atlas connection string.

---

### 1. Clone the Repository & Install Dependencies

From the root directory of the workspace, run:

```bash
# Clone the repository
git clone https://github.com/Hkp102004/Alumni-Connect.git
cd Alumni-Connect

# Install all workspace dependencies (root, frontend, and backend)
npm install
```

---

### 2. Environment Variables Configuration

#### Backend Configuration
Copy `.env.example` to `.env` inside `alumniconnect-backend`:

```bash
cd alumniconnect-backend
cp .env.example .env
```

Edit `alumniconnect-backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/alumniconnect
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary configuration for avatar image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend Configuration
Copy `.env.example` to `.env` inside `alumniconnect-frontend`:

```bash
cd ../alumniconnect-frontend
cp .env.example .env
```

Edit `alumniconnect-frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api

# Firebase Web Config (Optional)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

### 3. Run the Application

You can start both frontend and backend servers concurrently from the root directory:

```bash
# From workspace root directory
npm run dev
```

Alternatively, run each service individually:

```bash
# Backend (http://localhost:5000)
npm run dev:backend

# Frontend (http://localhost:5173)
npm run dev:frontend
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 📡 API Reference Overview

All protected backend endpoints require a JWT token in the request header:
`Authorization: Bearer <YOUR_JWT_TOKEN>`

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new account (`student`, `alumni`, `admin`) |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile |

### User & Directory Routes (`/api/users`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | Query directory (search by batch, branch, company, skills) |
| `GET` | `/api/users/mentors` | Retrieve users open to mentorship |
| `GET` | `/api/users/:id` | Fetch public profile of a user |
| `PUT` | `/api/users/me` | Update authenticated user profile |

### Connection Routes (`/api/connections`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/connections` | Send connection request (`toUser`) |
| `GET` | `/api/connections/me` | Fetch connection requests / active connections |
| `PUT` | `/api/connections/:id` | Update connection request status (`accepted` / `rejected`) |

### Mentorship Routes (`/api/mentorships`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/mentorships` | Send mentorship application to a mentor |
| `GET` | `/api/mentorships/me` | List mentorship engagements (as mentor or mentee) |
| `PUT` | `/api/mentorships/:id/status` | Accept, decline, or complete mentorship |
| `POST` | `/api/mentorships/:id/sessions` | Schedule session details |

### Events Routes (`/api/events`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/events` | List upcoming or past events |
| `POST` | `/api/events` | Create new event (organizer / admin) |
| `GET` | `/api/events/:id` | Get detailed information for an event |
| `POST` | `/api/events/:id/rsvp` | Toggle user RSVP status |
| `DELETE` | `/api/events/:id` | Remove an event |

### Opportunities Routes (`/api/opportunities`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/opportunities` | Search job & internship postings |
| `POST` | `/api/opportunities` | Post a job or internship opportunity |
| `POST` | `/api/opportunities/:id/apply` | Apply to an opportunity |
| `PUT` | `/api/opportunities/:id/applicants/:userId` | Update candidate status (`shortlisted`, `hired`, etc.) |

---

## 🚀 Deployment Guide

### Backend Deployment (Render / Railway)
1. Provision a MongoDB database on **MongoDB Atlas**.
2. Connect your repository to **Render** or **Railway**.
3. Set root directory to `alumniconnect-backend` or build command to `npm install`.
4. Configure environment variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`).
5. Set start command: `node server.js`.

### Frontend Deployment (Vercel / Firebase Hosting / Netlify)
1. Connect repository to **Vercel** or **Firebase Hosting**.
2. Root directory: `alumniconnect-frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set environment variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
