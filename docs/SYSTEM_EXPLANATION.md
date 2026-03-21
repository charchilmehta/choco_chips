# System Explanation

## Overview

The AI-Powered Healthcare Automation & Smart Patient Management System is a full-stack telemedicine platform designed to bridge the gap between patients and healthcare providers in India. The system was built to address three critical pain points: the difficulty of reaching a doctor quickly during emergencies, the lack of accessible digital medical records for patients, and the administrative overhead hospitals face when managing appointments and registrations.

The platform supports three distinct user roles — **Admin**, **Doctor**, and **Patient** — each with a tailored interface and strictly enforced API-level permissions. All interactions are secured with JSON Web Tokens (JWT), and the system is designed to remain available even under degraded conditions (e.g., no real-time WebRTC) through fallback simulation modes.

---

## Architecture Overview

The system follows a classic **three-tier architecture**:

```
┌──────────────────────────────────┐
│         CLIENT (React.js)        │  ← Tier 1: Presentation
│  SPA served on port 3000         │
│  Context API + Socket.IO client  │
└──────────────┬───────────────────┘
               │ HTTP + WebSocket
┌──────────────▼───────────────────┐
│       SERVER (Node.js/Express)   │  ← Tier 2: Application Logic
│  REST API on port 5000           │
│  JWT auth middleware             │
│  Socket.IO server                │
│  AI risk-scoring engine          │
└──────────────┬───────────────────┘
               │ Mongoose ODM
┌──────────────▼───────────────────┐
│         DATABASE (MongoDB)       │  ← Tier 3: Data Persistence
│  Collections: users, hospitals,  │
│  appointments, emergencies,      │
│  medicalRecords, healthMetrics   │
└──────────────────────────────────┘
```

---

## Component Deep-Dives

### Authentication & JWT

When a user logs in, the server validates credentials against a bcrypt-hashed password stored in MongoDB. On success, it signs a JWT containing the user's `_id` and `role` with a configurable `JWT_SECRET`. The token is returned to the client and stored in `localStorage`. Every subsequent API call attaches this token in the `Authorization: Bearer <token>` header.

A custom Express middleware (`authMiddleware`) verifies the token on every protected route. A secondary `roleMiddleware` restricts specific routes to certain roles (e.g., only `admin` can approve hospitals, only `doctor` can create medical records).

```
Client                    Server
  │─── POST /auth/login ──►│
  │                         │  Verify password (bcrypt)
  │◄── { token, user } ────│  Sign JWT
  │                         │
  │─── GET /appointments ──►│
  │    Authorization: Bearer│  Decode JWT → req.user
  │◄── [ appointments ] ───│  Role check → respond
```

### Hospital Registration & Approval Workflow

Hospitals register via `POST /api/hospitals` providing their name, address, specializations, and contact details. The registration is stored with `status: "pending"`. An admin then reviews pending hospitals via the admin dashboard (`GET /api/admin/hospitals/pending`) and approves or rejects them (`PUT /api/admin/hospitals/:id/approve`).

Only approved hospitals appear in the public hospital listing. This prevents unverified facilities from receiving patient appointments.

### Patient Registration with Simulated Aadhaar

Patients register with standard credentials, then undergo a two-step simulated government ID verification:

1. **Send OTP** (`POST /api/auth/send-otp`): The patient submits their Aadhaar number. The server validates the format (12-digit number) and generates a 6-digit OTP stored temporarily with a 10-minute TTL.
2. **Verify OTP** (`POST /api/auth/verify-otp`): The patient submits the OTP. On success, their account is marked `govtIdVerified: true`.

In a production system this would integrate with UIDAI's official Aadhaar e-KYC API. The simulation demonstrates the full UI/UX flow without requiring a real API key.

### Emergency System

The emergency system is the most safety-critical component and is engineered with multiple redundant paths:

#### Red Button
`POST /api/emergency/red-button` is explicitly exempt from all misuse-restriction middleware. Regardless of a patient's strike count or account status, this endpoint always succeeds and immediately creates a `HIGH` severity emergency event. The philosophy is: **it is always safer to respond to a false alarm than to block a real emergency**.

#### AI Validation Flow
`POST /api/emergency/validate` accepts a list of symptoms and optional duration. The AI engine (rule-based, no external model required) processes the input:

```
Input: ["chest pain", "shortness of breath", "sweating"]
         │
         ▼
   Keyword Matching
   (weighted symptom dictionary)
         │
         ▼
   Base Score: sum of keyword weights
   Duration Modifier: +points if symptoms > 24 hours
         │
         ▼
   Score >= 7  → HIGH risk   → Emergency escalation
   Score 4–6   → MEDIUM risk → Urgent care recommended
   Score < 4   → LOW risk    → Schedule appointment
```

#### Misuse Detection (3-Strike System)
When a patient uses the **validated** emergency flow (not Red Button) and the resolved event is later flagged as non-emergency by staff, a strike is added to their account. After 3 strikes, the AI validation flow prompts additional confirmation steps. **The Red Button bypass is permanently exempt from strikes.**

#### Fail-safe Mechanism
If a patient begins the AI validation flow (i.e., the server receives the first symptom submission) but does not complete it within a timeout window, `POST /api/emergency/fail-safe` is automatically called by the client. The server treats this abandonment as a potential emergency and creates a `MEDIUM` severity event — because a patient who stops mid-flow during a real emergency may be incapacitated.

### Video Consultation (WebRTC + Socket.IO)

Video consultations use browser-native WebRTC for peer-to-peer media streams. Socket.IO acts as the signaling layer:

```
Patient Browser          Server (Socket.IO)        Doctor Browser
      │─── join-room ──────────►│
      │                          │◄─── join-room ──────│
      │◄── peer-joined ─────────│──── peer-joined ────►│
      │                          │                      │
      │─── offer (SDP) ─────────┼──────────────────────►│
      │◄── answer (SDP) ────────┼──────────────────────│
      │─── ICE candidate ───────┼──────────────────────►│
      │◄── ICE candidate ───────┼──────────────────────│
      │◄════════════ P2P video stream (no server) ═════►│
```

In-call chat messages are relayed through Socket.IO (not stored in DB). If WebRTC negotiation fails (e.g., symmetric NAT without a TURN server), the UI falls back to a simulated call mode with a placeholder video feed.

### Medical Records System

Doctors create medical records via `POST /api/medical`, attaching visit notes, diagnosis, and an optional prescription. Prescriptions are stored as structured JSON (medication name, dosage, frequency, duration) and can be "downloaded" as a formatted response (`GET /api/medical/:id/prescription/download`). Patients can view their own records; doctors can view records of patients assigned to them.

### Health Monitoring

Patients log health metrics (blood pressure, heart rate, oxygen saturation, glucose, weight) via `POST /api/health`. Historical readings are retrieved via `GET /api/health/history` and rendered as trend charts in the frontend. Abnormal readings (e.g., SpO2 < 94%) trigger a UI warning suggesting the patient consult a doctor or use the emergency button.

---

## Role-Based Access Control

| Resource | Admin | Doctor | Patient |
|----------|-------|--------|---------|
| Hospital approval | ✅ | ❌ | ❌ |
| All users list | ✅ | ❌ | ❌ |
| Create medical record | ❌ | ✅ | ❌ |
| View own records | ❌ | ❌ | ✅ |
| Book appointment | ❌ | ❌ | ✅ |
| Update appointment status | ❌ | ✅ | ❌ |
| Red Button | ❌ | ❌ | ✅ |
| Resolve emergency | ✅ | ✅ | ❌ |
| Log health metrics | ❌ | ❌ | ✅ |

Access is enforced both in the React UI (route guards) and at the Express API layer (role middleware), so UI manipulation cannot bypass server-side restrictions.
