# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require:
```
Authorization: Bearer <token>
```

---

## Auth Routes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /auth/register | No | — | Register new user |
| POST | /auth/login | No | — | Login |
| GET | /auth/me | Yes | Any | Get current user |
| POST | /auth/send-otp | Yes | Patient | Send OTP for Govt ID |
| POST | /auth/verify-otp | Yes | Patient | Verify OTP |

## Hospital Routes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /hospitals | Yes | Any | Register hospital |
| GET | /hospitals | No | — | List approved hospitals |
| GET | /hospitals/search | No | — | Search hospitals |
| GET | /hospitals/:id | No | — | Get hospital details |

## Admin Routes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /admin/hospitals/pending | Yes | Admin | List pending hospitals |
| PUT | /admin/hospitals/:id/approve | Yes | Admin | Approve hospital |
| PUT | /admin/hospitals/:id/reject | Yes | Admin | Reject hospital |
| GET | /admin/users | Yes | Admin | List all users |
| GET | /admin/misuse-reports | Yes | Admin | Misuse reports |
| GET | /admin/dashboard | Yes | Admin | Dashboard stats |

## Appointment Routes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /appointments | Yes | Patient | Book appointment |
| GET | /appointments | Yes | Any | My appointments |
| GET | /appointments/:id | Yes | Any | Appointment details |
| PUT | /appointments/:id/status | Yes | Doctor | Update status |
| GET | /appointments/slots | Yes | Any | Available slots |
| GET | /doctors | No | — | List doctors |
| PUT | /doctors/schedule | Yes | Doctor | Update schedule |

## Emergency Routes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /emergency/red-button | Yes | Patient | RED BUTTON — never blocked |
| POST | /emergency/validate | Yes | Patient | AI validation |
| POST | /emergency/from-validation | Yes | Patient | Create from validation |
| POST | /emergency/fail-safe | Yes | Patient | Failsafe trigger |
| GET | /emergency | Yes | Admin/Doctor | List events |
| PUT | /emergency/:id/resolve | Yes | Admin/Doctor | Resolve event |

## Medical Routes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /medical | Yes | Doctor | Create record |
| GET | /medical/patient/:userId | Yes | Doctor/Patient | Patient records |
| GET | /medical/:id | Yes | Doctor/Patient | Single record |
| POST | /medical/:id/prescription | Yes | Doctor | Add prescription |
| GET | /medical/:id/prescription/download | Yes | Any | Download prescription |

## Health Routes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /health | Yes | Patient | Log health metrics |
| GET | /health/history | Yes | Patient | Health history |

---

## Request / Response Examples

### POST /auth/register
```json
// Request
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secret@123",
  "role": "patient",
  "phone": "9876543210"
}

// Response 201
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "patient",
    "govtIdVerified": false
  }
}
```

### POST /auth/login
```json
// Request
{
  "email": "patient@healthcare.com",
  "password": "Patient@123"
}

// Response 200
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Demo Patient",
    "email": "patient@healthcare.com",
    "role": "patient",
    "govtIdVerified": true
  }
}
```

### POST /emergency/red-button
```json
// Request
{
  "location": { "lat": 28.6139, "lng": 77.2090 },
  "notes": "Severe chest pain, cannot breathe"
}

// Response 201
{
  "success": true,
  "message": "Emergency alert created. Help is on the way.",
  "emergency": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
    "patient": "64a1b2c3d4e5f6a7b8c9d0e1",
    "severity": "HIGH",
    "source": "red-button",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /emergency/validate
```json
// Request
{
  "symptoms": ["chest pain", "shortness of breath", "sweating"],
  "duration": "2 hours",
  "additionalNotes": "Pain radiating to left arm"
}

// Response 200
{
  "success": true,
  "aiResult": {
    "score": 9,
    "severity": "HIGH",
    "recommendation": "Seek emergency care immediately.",
    "matchedKeywords": ["chest pain", "shortness of breath"]
  }
}
```

### POST /appointments
```json
// Request
{
  "doctor": "64a1b2c3d4e5f6a7b8c9d0e3",
  "hospital": "64a1b2c3d4e5f6a7b8c9d0e4",
  "date": "2024-02-01",
  "slot": "10:00",
  "type": "normal",
  "symptoms": "Recurring headache for 3 days",
  "fee": 500
}

// Response 201
{
  "success": true,
  "appointment": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e5",
    "patient": "64a1b2c3d4e5f6a7b8c9d0e1",
    "doctor": "64a1b2c3d4e5f6a7b8c9d0e3",
    "date": "2024-02-01T10:00:00.000Z",
    "status": "pending",
    "fee": 500
  }
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request — validation error |
| 401 | Unauthorized — no or invalid token |
| 403 | Forbidden — insufficient role |
| 404 | Resource not found |
| 500 | Internal server error |

### Error Response Format
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```
