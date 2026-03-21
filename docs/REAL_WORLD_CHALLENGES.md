# Real-World Challenges

This document explores the regulatory, infrastructure, and operational challenges that would need to be addressed before this system could be deployed as a real healthcare product in India or internationally.

---

## 1. Digital Health Regulations

### India
- **DPDP Act, 2023 (Digital Personal Data Protection Act):** Health data is classified as "sensitive personal data." Collecting, processing, or storing it requires explicit, informed consent from the patient. The Act mandates a Data Protection Officer (DPO), breach notification within 72 hours, and a right-to-erasure mechanism.
- **NMC Telemedicine Practice Guidelines (2020):** The National Medical Commission mandates that only registered medical practitioners (RMPs) can provide teleconsultation. The system must verify the doctor's Medical Registration Number (MRC) with the respective State Medical Council before allowing them to consult patients.
- **IT Act, 2000 (Section 43A):** Any entity handling sensitive personal data must implement "reasonable security practices." Failure to do so creates civil liability in case of a data breach.

### International
- **HIPAA (USA):** Required for any system serving US patients. Mandates encryption at rest and in transit, Business Associate Agreements (BAAs) with all third-party vendors, and strict access controls with audit trails.
- **GDPR (EU):** Applies if EU citizens' data is processed. Requires a lawful basis for each data processing activity, data minimization, and the right to data portability.

---

## 2. Aadhaar API Legal Requirements

The Aadhaar e-KYC API is not publicly available. To use it, an organization must:
- Register as an **Authentication User Agency (AUA)** or **e-KYC User Agency (KUA)** with UIDAI.
- Sign a legal agreement with UIDAI and pay annual licensing fees.
- Host the integration on servers with a static IP whitelisted by UIDAI.
- Use an **HSM (Hardware Security Module)** to store the private key used for encrypting data sent to UIDAI — software-based key storage is explicitly prohibited.
- Comply with the **Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016** and the **Aadhaar Authentication for Good Governance Rules, 2020**.

Healthcare is not yet in the list of permitted use cases for mandatory Aadhaar authentication, so voluntary use (with patient consent) would be required.

---

## 3. WebRTC Connectivity Across Networks and Firewalls

WebRTC peer-to-peer connections work reliably on open networks but face serious obstacles in production:
- **Symmetric NAT:** Many enterprise firewalls and some mobile carrier-grade NATs use symmetric NAT, which blocks STUN-based hole-punching. A TURN relay server is mandatory.
- **Corporate firewalls:** Often block UDP entirely. WebRTC must fall back to TCP, which requires TURN server support for TCP relay.
- **Government/hospital networks:** May restrict outbound connections to specific whitelisted ports, making WebRTC setup non-trivial.
- **TURN server cost:** Relaying video through a TURN server consumes significant bandwidth (a 720p video call ≈ 1–2 Mbps relayed). At scale, TURN infrastructure becomes a major cost center.

---

## 4. Medical Data Sovereignty and Storage Requirements

India's DPDP Act and various sectoral regulations impose requirements on where health data may be stored:
- Patient health records may need to be stored on servers physically located **within India** (data localization).
- Cross-border transfer of health data requires specific contractual safeguards.
- Using a foreign cloud provider (e.g., AWS us-east-1) for primary data storage could violate these requirements. Indian regions (AWS ap-south-1, Azure India Central) must be used.
- Backup and disaster recovery copies must also comply with data residency rules.

---

## 5. Internet Connectivity in Rural India

Over 600 million Indians live in rural areas, many with limited or unreliable internet connectivity:
- **2G/3G networks** are still common in Tier-3 and Tier-4 cities. Video consultation at 2G speeds (< 100 kbps) is not feasible.
- **Power outages** can interrupt both the patient's device and local cell towers simultaneously.
- **Low-end Android devices** (1–2 GB RAM) may struggle to run a React.js SPA with WebRTC simultaneously.
- A real deployment would need a lightweight mobile app (React Native or Flutter), audio-only consultation fallback, and an offline-first architecture for medical records.

---

## 6. Multi-Language Support

India has 22 scheduled languages and hundreds of dialects. A healthcare platform serving rural populations must support:
- UI translation into at least Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, and Gujarati.
- Voice input for symptom entry (many rural users have low literacy).
- Medical terminology translation that is clinically accurate (not just Google Translate output).
- Right-to-left support is not required for Indian languages but font rendering for Devanagari, Tamil, and other scripts requires careful CSS and font loading.

---

## 7. Device Compatibility on Low-End Hardware

- **WebRTC** requires hardware with camera access and a browser supporting the `getUserMedia` API. Many low-end Android devices running Android 7 or older have partial support.
- **React.js 18 with concurrent features** may be sluggish on 1 GB RAM devices.
- **Progressive Web App (PWA)** approach with code splitting and lazy loading would be required to achieve acceptable performance.
- The system must degrade gracefully: if the camera is unavailable, skip Camera Assist; if WebRTC fails, fall back to audio-only or chat-only consultation.

---

## 8. Emergency Service Integration (108 Ambulance API)

For true emergency response, the system should integrate with India's **108 emergency ambulance service**. This requires:
- A partnership agreement with the respective state's 108 operator (operated by GVK EMRI in most states).
- An API or data integration to dispatch ambulances with patient GPS coordinates.
- HIPAA/DPDP-compliant sharing of minimum necessary health information with the ambulance crew.
- Currently, no public API exists for 108 dispatch — integration would require a government partnership.

---

## 9. Doctor Licensing and Credential Verification

- Every doctor on the platform must hold a valid medical registration from a State Medical Council.
- Registration numbers must be verified against the **NMC National Medical Register**, which does not yet provide a real-time public API.
- Specialist credentials (DM, MCh, DNB) require additional verification with respective super-specialty boards.
- Doctor registration must be re-verified periodically, as licenses can be suspended or revoked.

---

## 10. Health Insurance Integration

- Most Indians use either government schemes (Ayushman Bharat / PMJAY) or private health insurance.
- Integrating with PMJAY requires empanelment as a healthcare provider with the **National Health Authority (NHA)** and implementing their FHIR-based claims API.
- Private insurance integration requires individual agreements with each insurer (there are 30+ health insurers in India) or a middleware like a **Third Party Administrator (TPA)**.
- Real-time eligibility checks and pre-authorization workflows add significant complexity.

---

## 11. AI Liability and Malpractice for Recommendations

- The AI risk score influences whether a patient seeks emergency care. An incorrect "LOW risk" classification for a heart attack patient could have fatal consequences.
- Under Indian law, a software company providing medical recommendations may be held liable under the **Consumer Protection Act, 2019** and potentially under criminal negligence provisions.
- The system must display prominent disclaimers that the AI output is **not a medical diagnosis** and that patients should always seek professional evaluation.
- Malpractice insurance for AI-assisted medical tools is an emerging and unresolved area of law in India.

---

## 12. Sensitive Health Data Breach Risks

- Health records are among the most valuable data for identity theft and blackmail (they contain diagnoses, medications, and contact information).
- The average cost of a healthcare data breach globally is $10.9 million (IBM Cost of a Data Breach Report 2023).
- Specific attack vectors to mitigate in production:
  - **Injection attacks** on MongoDB (NoSQL injection via unsanitized query operators)
  - **Broken access control** (horizontal privilege escalation — patient A accessing patient B's records)
  - **Insecure file download** (path traversal in prescription download endpoints)
  - **JWT algorithm confusion** (accepting `alg: none`)
  - **Exposed API keys** in frontend bundles
