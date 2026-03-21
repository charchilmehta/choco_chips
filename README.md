# AI-Powered Healthcare Automation & Smart Patient Management System

A full-stack, role-based telemedicine and patient management platform built for modern healthcare delivery in India. It combines AI-driven risk scoring, real-time video consultations, an always-available emergency response system, and simulated government ID verification into a single cohesive product.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18 |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (role-based: Admin / Doctor / Patient) |
| Real-time | Socket.IO (WebRTC signaling + in-call chat) |
| Extra | AI risk scoring, simulated Aadhaar verification |

## Project Structure

```
choco_chips/
├── client/          # React.js frontend
├── server/          # Node.js + Express backend
├── docs/            # Documentation
├── package.json     # Root monorepo
└── README.md
```

## Quick Start / Setup

### Prerequisites

- Node.js >= 16.0.0
- MongoDB (local or MongoDB Atlas)
- npm >= 8.0.0

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd choco_chips

# Install all dependencies (root + server + client)
npm run install-all
```

### Configuration

1. Copy `/server/.env.example` to `/server/.env` and fill in values:
   - `MONGO_URI` — your MongoDB connection string
   - `JWT_SECRET` — any random secret string

2. Copy `/client/.env.example` to `/client/.env` (defaults work for local dev)

### Seed Data

```bash
# Create admin, doctor, patient, and hospital in DB
npm run seed
```

**Seed credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@healthcare.com | Admin@123 |
| Doctor | doctor@healthcare.com | Doctor@123 |
| Patient | patient@healthcare.com | Patient@123 |

### Run (Development)

```bash
# Run both server and client concurrently
npm run dev
```

- Server runs on: http://localhost:5000
- Client runs on: http://localhost:3000

### Run (Separate)

```bash
# Server only
npm run server

# Client only
npm run client
```

---

## User Roles & Access

### Admin
- Approve/reject hospital registrations
- View all users
- Monitor emergency events
- View misuse reports

### Doctor
- View assigned patient records
- Create visit notes and prescriptions
- Manage schedule/availability
- Join video consultations

### Patient
- Register with Govt ID verification (simulated Aadhaar)
- Book appointments (normal & emergency)
- Use **RED EMERGENCY BUTTON** (always available, never blocked)
- View personal medical records
- Video consultation with doctor
- Monitor health metrics

---

## Core Features

### 🚨 Emergency System
- **RED BUTTON** — One-tap, never blocked, always works regardless of account status
- **AI Validation** — Symptom-based risk scoring (High / Medium / Low)
- **Misuse Detection** — 3-strike system; Red Button itself is unaffected by strikes
- **Fail-safe** — If a patient abandons the AI validation flow, the system auto-escalates to emergency

### 📹 Video Consultation
- WebRTC peer-to-peer video (signaling via Socket.IO)
- In-call chat powered by Socket.IO
- Fallback simulated mode when WebRTC is unavailable

### 🤖 AI Risk Score
- Keyword analysis of reported symptoms
- Severity score (1–10) combined with symptom duration weighting
- Routes patients to the appropriate care level (emergency / urgent / routine)

### 📸 Camera Assist Mode
- Designed for dental and visual checkups
- Simulated flashlight and zoom controls
- On-screen patient instructions

---

## API Documentation

See [`docs/API_DOCS.md`](docs/API_DOCS.md) for the complete API reference.

## Project Documentation

| Document | Description |
|----------|-------------|
| [System Explanation](docs/SYSTEM_EXPLANATION.md) | Architecture & component deep-dive |
| [Limitations](docs/LIMITATIONS.md) | Known limitations & simulated features |
| [Real-World Challenges](docs/REAL_WORLD_CHALLENGES.md) | Regulatory & infrastructure challenges |
| [Judges Q&A](docs/JUDGES_QA.md) | 20+ anticipated Q&A pairs |
| [Defense Points](docs/DEFENSE_POINTS.md) | Innovation, viability & social impact |
| [API Documentation](docs/API_DOCS.md) | Full REST API reference |
