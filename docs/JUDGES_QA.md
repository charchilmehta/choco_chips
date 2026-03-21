# Judges Q&A

Anticipated questions a panel of judges, investors, or technical evaluators might ask — with thorough answers.

---

## Q1: Why use WebRTC instead of a third-party video SDK like Twilio Video or Agora?

**A:** We chose native WebRTC for three reasons. First, **cost** — Twilio Video charges per-participant-minute, which at scale can be prohibitive for a healthcare startup targeting rural India. Second, **data privacy** — with a third-party SDK, video frames pass through the vendor's servers, which conflicts with medical data privacy requirements. WebRTC is peer-to-peer; no video data touches our servers. Third, **learning and ownership** — implementing the WebRTC signaling stack ourselves gives us full control over the architecture. In production, we would add a TURN server for users behind symmetric NAT, but the core media path remains peer-to-peer.

---

## Q2: How does the AI risk scoring work?

**A:** The AI engine is rule-based with a weighted keyword dictionary. Each symptom keyword has an associated severity weight (e.g., "chest pain" = 9, "mild headache" = 2). The engine tokenizes the patient's symptom input and sums the weights of matched keywords. A duration modifier adds extra points if symptoms have persisted for more than 24 hours. The final score maps to three tiers: **High** (≥ 7) triggers emergency escalation, **Medium** (4–6) recommends urgent care, and **Low** (< 4) recommends scheduling a routine appointment. We are fully transparent that this is not a machine learning model — it is deterministic and explainable, which is actually an advantage in a regulated medical context where black-box predictions are harder to certify.

---

## Q3: What happens if the patient has no internet during an emergency?

**A:** The Red Button makes a best-effort API call. If it fails due to no connectivity, the frontend displays the emergency contact numbers (112, 108) prominently. We also recommend that a production deployment include a **Service Worker** with offline caching of the emergency contact information, so even without connectivity, the patient sees actionable information. The system cannot dispatch help without connectivity — that is a physical limitation — but it should never silently fail; it must always show the patient what to do next.

---

## Q4: How is data security handled?

**A:** Several layers: passwords are hashed with **bcrypt** (cost factor 10); all API routes that touch patient data require a valid JWT; role middleware prevents cross-role data access; MongoDB queries use Mongoose schemas that prevent arbitrary field injection. In production, we would add TLS/HTTPS (required for WebRTC anyway), MongoDB Atlas with encryption at rest, and a WAF (Web Application Firewall) to block common attack patterns. We would also add rate limiting on authentication endpoints to prevent brute-force attacks.

---

## Q5: Can doctors misuse the system (e.g., access records of patients not assigned to them)?

**A:** The API enforces that `GET /api/medical/patient/:userId` returns records only if `req.user.role === 'doctor'` and the patient has an appointment with that doctor (or the doctor created the record). A doctor cannot query another doctor's patient records. Admins can see all records for oversight purposes but cannot create or modify clinical records. In a production system, we would add comprehensive audit logging so that any data access anomaly (e.g., a doctor accessing 200 patient records at 2 AM) triggers an alert.

---

## Q6: How is Aadhaar verification simulated?

**A:** The simulation mirrors the real UIDAI KYC flow exactly in terms of UX: the patient enters their 12-digit Aadhaar number, a 6-digit OTP is "sent" (logged to console in dev mode), and they submit it to complete verification. The server validates the Aadhaar format, generates and stores a hashed OTP with a 10-minute TTL, and marks the account `govtIdVerified: true` on success. The only missing piece is the actual UIDAI API call. This design means swapping in the real API requires changing only the Aadhaar lookup function — the entire surrounding OTP flow, database schema, and UI remain identical.

---

## Q7: What is the misuse detection logic?

**A:** The 3-strike system applies only to the **AI validation flow**, not the Red Button. When a doctor or admin resolves an emergency event as "non-emergency / misuse," the patient's `strikeCount` in MongoDB is incremented. At 3 strikes, the AI validation UI adds a mandatory confirmation step ("Are you sure this is an emergency? You have been flagged for misuse before."). The Red Button endpoint completely bypasses this check — it always works. The strike system is designed to discourage frivolous use of the AI validation path while preserving unconditional access to emergency help. Strikes can be reset by an Admin after reviewing the case.

---

## Q8: Is this HIPAA compliant?

**A:** No — and we are transparent about that. HIPAA compliance is not a feature you add to code; it is a continuous organizational, legal, and technical program. What we have implemented are foundational security controls (bcrypt, JWT, role-based access) that are prerequisites for compliance, but we have not implemented the full control set: audit logs, Business Associate Agreements with cloud vendors, formal risk assessments, breach notification procedures, or a HIPAA Privacy Officer. A production deployment targeting US patients would require 6–12 months of compliance work on top of this codebase.

---

## Q9: How does the Red Button differ from the normal emergency flow?

**A:** There are four key differences:

| Aspect | Red Button | AI Validation Flow |
|--------|------------|--------------------|
| Route | `POST /emergency/red-button` | `POST /emergency/validate` then `POST /emergency/from-validation` |
| Severity | Always HIGH | HIGH / MEDIUM / LOW based on AI score |
| Misuse check | Completely bypassed | Subject to 3-strike system |
| Steps | 1 tap | 3 steps (symptoms → AI result → confirm) |

The Red Button is intentionally minimal. It does one thing: immediately create a high-severity emergency record. It is designed for patients who are in distress and cannot go through a multi-step flow.

---

## Q10: Can this scale to millions of patients?

**A:** The current single-node architecture cannot handle millions of concurrent users, but the design is scalable with targeted changes. The REST API is stateless (JWT), so it scales horizontally behind a load balancer immediately. MongoDB Atlas supports sharding and auto-scaling. The primary bottleneck is Socket.IO, which requires a Redis adapter to share event state across multiple server instances. WebRTC is inherently peer-to-peer, so video does not scale through our server at all — it scales by itself. With these changes, the system can scale to millions of patients using standard cloud infrastructure patterns.

---

## Q11: What is the failsafe mechanism?

**A:** If a patient opens the AI validation flow and submits their symptoms but then becomes unresponsive (e.g., they lose consciousness), the client-side JavaScript detects that the flow has not been completed within a configurable timeout. It automatically fires `POST /api/emergency/fail-safe`, which creates a MEDIUM-severity emergency event with the last known symptom data and a note indicating the event was created by failsafe. The logic is: *a patient who stops mid-flow during a genuine emergency is more likely to need help than someone who deliberately closed the app*. Treating abandonment as a potential emergency is the safer default.

---

## Q12: How are emergency contacts notified?

**A:** In the current implementation, emergency events are broadcast to connected Admin and Doctor clients via Socket.IO in real time. In a production system, this would be augmented by: SMS alerts to on-call doctors via Twilio, push notifications to the hospital's mobile app via FCM, and optionally an automated call to the patient's registered emergency contact using a programmable voice API (e.g., Twilio Voice or Exotel). We deliberately scoped these integrations out to avoid hard dependencies on paid external services during development.

---

## Q13: What if a doctor is offline during an emergency?

**A:** Emergency events are not assigned to a specific doctor — they go to the Admin dashboard and are visible to all connected doctors. Any available doctor can accept the case. In production, the on-call scheduling system would maintain a list of duty doctors, and the notification system would escalate through the duty list until someone accepts. After a configurable timeout (e.g., 5 minutes), the system would escalate to the Admin who could manually contact on-call staff.

---

## Q14: Why MongoDB over a relational database like PostgreSQL?

**A:** Several reasons specific to this domain. Medical records have a highly variable schema — a cardiology record looks nothing like a dermatology record. MongoDB's flexible document model handles this naturally; in SQL, you would need complex EAV tables or JSONB columns. Appointment slots, health metrics time series, and emergency event logs all benefit from document-oriented storage. That said, there are tradeoffs: MongoDB does not enforce foreign key constraints, so referential integrity must be enforced at the application layer. For financial transactions (if payment is added), a relational database would be the right choice.

---

## Q15: What are the monetization options?

**A:** Multiple revenue streams are viable:

1. **SaaS subscription for hospitals:** Monthly/annual fee per hospital for platform access and administration tools.
2. **Per-consultation fee:** A small platform fee on each video consultation (e.g., 5–10% of the doctor's fee).
3. **Government contract:** The PMJAY scheme and state health missions are actively looking for digital health platforms. A per-beneficiary fee from the government is a proven model (used by startups like Practo, 1mg, and HealthPlix).
4. **Premium patient features:** Free tier for basic appointments; premium tier for priority booking, health metric analysis, and family account management.
5. **Data analytics (anonymized, aggregated):** Disease prevalence trends, hospital capacity analytics sold to public health agencies and pharmaceutical companies (with strict anonymization).

---

## Q16: How is the doctor's schedule managed?

**A:** Doctors set their availability via `PUT /api/doctors/schedule`, specifying available days and time slots. The appointment booking flow (`GET /api/appointments/slots`) queries this schedule and returns only slots that are not already booked. A doctor can block specific slots (e.g., for lunch or a procedure). Emergency consultations override the schedule and are flagged separately so doctors can identify them at a glance.

---

## Q17: What happens to an appointment if the hospital is rejected by the Admin?

**A:** Hospital approval happens before any appointments can be booked at that hospital — only approved hospitals appear in the doctor listing and booking flow. However, if a hospital's approval is **revoked** after appointments have been made, those appointments would need to be handled by a cancellation workflow (not yet implemented). In production, any status change on a hospital would trigger notifications to all affected patients and flag their upcoming appointments for rebooking.

---

## Q18: How are prescriptions generated and verified?

**A:** Prescriptions are structured JSON objects stored in the medical record document: medication name, dosage (e.g., "500mg"), frequency (e.g., "twice daily"), duration (e.g., "7 days"), and any special instructions. The `GET /api/medical/:id/prescription/download` endpoint formats this into a human-readable response. In production, prescriptions would be digitally signed by the doctor using a certificate issued by the NMC's **Health Professional Registry**, making them legally valid digital prescriptions per the telemedicine guidelines.

---

## Q19: How is the Camera Assist feature used clinically?

**A:** Camera Assist is designed for conditions where a visual assessment can help a doctor guide a patient before the appointment. For dental checkups, the patient holds their phone camera to their mouth and follows on-screen instructions (e.g., "Open wide, position camera at molar area"). For skin conditions, it guides the patient to photograph the affected area with consistent lighting. The doctor reviews these photos as part of the consultation. Currently the feature is simulated (no actual image capture is implemented in the demo), but the UI flow is complete.

---

## Q20: What is your competitive advantage over Practo or Apollo 247?

**A:** Practo and Apollo 247 are excellent platforms, but they are designed primarily for urban, smartphone-savvy, paying users. Our differentiation is:

1. **Emergency system** — Neither competitor has an always-on Red Button with AI triage and misuse-detection. They focus on scheduled care, not emergency routing.
2. **Government ID integration** — Simulated Aadhaar verification demonstrates a path to serving beneficiaries of government health schemes (PMJAY) who need verified identity.
3. **Open architecture** — Built on open-source technologies with no dependency on proprietary SDKs, making it accessible for government deployment.
4. **Rural focus** — The architecture is designed with offline-first and low-bandwidth fallbacks as first-class concerns, not afterthoughts.

---

## Q21: Could this be used for mental health consultations?

**A:** Yes, with additional safeguards. Mental health consultations over telemedicine are explicitly permitted by the NMC guidelines. We would add: a mandatory disclaimer that the AI triage does not assess mental health risk, an explicit "I am having thoughts of self-harm" option that immediately routes to a crisis line (iCall, Vandrevala Foundation), and strict privacy controls so mental health records are further access-restricted even within the doctor role. The video consultation and medical records systems already support this use case.

---

## Q22: How would you handle a situation where AI misclassifies a critical symptom?

**A:** The system is designed so that the AI is an **aid**, not a gatekeeper. Even if the AI classifies a symptom as LOW risk, the patient always has the Red Button available and the UI always shows emergency contact numbers. The AI classification affects routing and priority, not access. We also plan to implement a feedback loop: when an AI-classified LOW risk appointment is later documented by the doctor as having been a serious condition, the case is flagged for review to refine the keyword weights. No patient can be blocked from seeking help by an AI decision.
