# Known Limitations

This document transparently lists the limitations of the current implementation, distinguishing between features that are **simulated** (placeholder for a real integration) and features that are **not yet implemented** (out of scope for this prototype).

---

## 1. Aadhaar / Government ID Verification (Simulated)

**Current state:** The OTP flow is fully functional end-to-end within the application, but the "Aadhaar lookup" is mocked. Any 12-digit number is accepted; no real UIDAI API call is made.

**Production requirement:** Integration with UIDAI's Aadhaar e-KYC API requires a licensed Authentication User Agency (AUA) agreement, a dedicated server with a static IP whitelisted by UIDAI, HSM-based key storage for private keys, and end-to-end encryption (AES-256 + RSA-2048) of all PII transmitted to UIDAI endpoints. This is a legal and infrastructure requirement, not just a coding task.

---

## 2. Payment Gateway

**Current state:** Consultation fee amounts are stored in appointment records, but no actual payment is collected.

**Production requirement:** Integration with a PCI-DSS-compliant payment gateway (e.g., Razorpay, PayU, or Stripe India) is needed, including webhook handling for payment confirmation, refunds, and failed-payment retries.

---

## 3. HIPAA / DPDP Compliance

**Current state:** Standard JWT auth and bcrypt password hashing are implemented. No healthcare-specific compliance controls are in place.

**Production requirement:** Full compliance with India's **Digital Personal Data Protection (DPDP) Act, 2023** and (if serving international patients) **HIPAA** requires: data minimization policies, explicit consent management, a Data Protection Officer designation, breach notification procedures within 72 hours, and a right-to-erasure workflow for patient data.

---

## 4. WebRTC Without STUN/TURN (NAT Traversal)

**Current state:** WebRTC is configured with a public Google STUN server (`stun:stun.l.google.com:19302`). This works when both peers are on different public IPs.

**Production requirement:** Approximately 15–20% of users are behind symmetric NAT (common in corporate networks and some mobile carriers), where STUN alone fails. A **TURN server** (e.g., Coturn) is required for reliable connectivity. TURN relay incurs bandwidth costs and must be hosted or purchased from a provider (e.g., Twilio Network Traversal Service).

---

## 5. Push Notifications (Simulated)

**Current state:** Notification events are emitted via Socket.IO to connected clients. If the client is not connected, the notification is lost.

**Production requirement:** Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNs) integration is needed for reliable delivery to mobile/PWA clients when the app is backgrounded or closed.

---

## 6. SMS / Email OTP (Simulated)

**Current state:** The OTP is logged to the server console and returned in the API response (development only). No real SMS or email is sent.

**Production requirement:** Integration with an SMS gateway (e.g., Twilio, MSG91, or AWS SNS) and a transactional email service (e.g., SendGrid, Amazon SES) is required. SMS delivery in India also requires a registered DLT (Distributed Ledger Technology) sender ID per TRAI regulations.

---

## 7. AI Risk Scoring (Rule-Based, Not ML)

**Current state:** The AI engine uses a static weighted-keyword dictionary. It reliably identifies common emergency keywords (e.g., "chest pain", "unconscious", "seizure") but has no ability to learn from new data or handle paraphrased symptom descriptions.

**Production requirement:** A production-grade symptom checker would use a trained NLP model (e.g., fine-tuned on medical corpora like MIMIC-III or PubMed) or integrate with an established medical AI API (e.g., Ada Health, Infermedica). The rule-based engine is sufficient for a prototype but should not be used for real clinical triage decisions.

---

## 8. File Uploads (Metadata Only)

**Current state:** Medical record attachments (lab reports, X-rays, prescriptions) store only metadata (filename, MIME type, size). No actual file content is saved or served.

**Production requirement:** Integration with object storage (AWS S3, Google Cloud Storage, or Azure Blob Storage) with server-side encryption (SSE-S3 or SSE-KMS), signed URL generation for time-limited access, and DICOM support for medical imaging files.

---

## 9. Single Server / No Horizontal Scaling

**Current state:** The application runs as a single Node.js process. Socket.IO state (active rooms, connected sockets) is held in memory.

**Production requirement:** Horizontal scaling requires a shared Socket.IO adapter (e.g., `@socket.io/redis-adapter`) so that WebSocket events are broadcast across all instances. The REST API is stateless (JWT) and can scale horizontally behind a load balancer without changes, but the in-memory session state cannot.

---

## 10. No Audit Logging

**Current state:** Server actions are logged to `console.log` only; no structured audit trail is maintained.

**Production requirement:** Healthcare regulations in most jurisdictions require a tamper-proof audit log of all access to patient data (who accessed what record, when, from which IP). This is typically implemented with an append-only log store (e.g., AWS CloudTrail, a separate MongoDB collection with no-delete policy, or a dedicated SIEM tool).

---

## 11. Development-Grade MongoDB Configuration

**Current state:** The application connects to a single MongoDB instance with no replica set.

**Production requirement:** MongoDB Atlas (or a self-hosted replica set with at least 3 nodes) is required for high availability, automatic failover, and oplog-based change streams (needed for real-time features). Single-node MongoDB has no automatic recovery from hardware failure.

---

## Summary Table

| Feature | Status | Production Path |
|---------|--------|-----------------|
| Aadhaar verification | Simulated | UIDAI AUA agreement + HSM |
| Payment | Not implemented | Razorpay / PayU integration |
| HIPAA/DPDP compliance | Not implemented | Legal + technical controls |
| WebRTC (NAT traversal) | Partial (STUN only) | Self-hosted Coturn TURN server |
| Push notifications | Simulated (Socket.IO) | FCM / APNs |
| OTP delivery | Simulated (console log) | Twilio SMS + SendGrid email |
| AI triage | Rule-based | Fine-tuned NLP model |
| File uploads | Metadata only | S3 + SSE encryption |
| Horizontal scaling | Not supported | Redis adapter + load balancer |
| Audit logging | Console only | Append-only structured log store |
| MongoDB HA | Single node | Atlas replica set (3 nodes) |
