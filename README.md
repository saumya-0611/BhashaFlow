# 🇮🇳 BhashaFlow: Multilingual GenAI for Citizen Social Grievances

**NIIT University B.Tech CSE Capstone Project**

---

## 📖 Project Overview

- **Problem:** Manual grievance handling causes severe delays, and language barriers prevent Indian citizens from efficiently reporting localized issues to the correct government authority.
- **Objective:** Automatically capture, classify, summarize, and route social grievances submitted in various Indian languages to the appropriate government portal with actionable next steps.
- **Approach:** OCR + Speech-to-Text → Sarvam AI Translation → Gemini LLM Classification & Summarization → Intelligent Portal Routing.
- **Outcome:** Faster resolution times, seamless multilingual accessibility, a streamlined citizen dashboard, and an administrative interface for authorities.

---

## ✨ Key Features

### 🗣️ Multilingual Input (22+ Languages)
Citizens can submit grievances in **any Indian language** using:
- **Text Input** — Type in Hindi, Tamil, Bengali, Marathi, etc.
- **Voice Input** — Speak directly; the AI transcribes and translates automatically.
- **PDF Proof** — Optionally attach supporting documents in PDF format.

### 🤖 AI-Powered Analysis Pipeline
1. **Text Extraction** — OCR (EasyOCR) for images, Sarvam AI STT for audio.
2. **Translation** — Sarvam AI translates all inputs to English for LLM processing.
3. **Classification** — Google Gemini categorizes the grievance into one of **29 hyper-granular categories** (e.g., `cybercrime`, `banking`, `railways`, `passport`, `food_safety`).
4. **Priority Detection** — AI assigns `low`, `medium`, `high`, or `critical` priority based on urgency rules.
5. **Verification** — The citizen is shown the AI's understanding and can confirm or reject it.

### 🏛️ Intelligent Government Portal Routing
Each grievance is automatically mapped to **the exact relevant government portal** with:
- Direct clickable portal links
- Helpline numbers
- Step-by-step filing procedures
- Expected resolution timelines

The system covers **40+ Indian government portals** across these categories:

| Category | Portal(s) |
|---|---|
| Cybercrime | National Cyber Crime Portal (`cybercrime.gov.in`) |
| Telecom Fraud | Sanchar Saathi |
| Human Rights | NHRC |
| Corruption | Lokpal of India |
| Consumer Rights | National Consumer Helpline, E-Daakhil |
| Banking | RBI Complaint Management System |
| Stock Market | SEBI SCORES |
| Insurance | IRDAI Bima Bharosa |
| Telecom | TRAI, TDSAT |
| Railways | Rail Madad |
| Airlines | AirSewa |
| Road Transport | Parivahan |
| Real Estate | RERA |
| Sanitation | Swachhata Platform |
| Food Safety | FSSAI |
| Medicines | CDSCO |
| Health Schemes | Ayushman Bharat |
| Environment | CPCB |
| Aadhaar | UIDAI |
| Passport | Passport Seva |
| Income Tax | Income Tax e-Nivaran |
| Provident Fund | EPFO Grievance |
| Pensions | Pension Portal |
| Postal Services | India Post |
| RTI | RTI Online |
| Electricity/Water | State-specific portals (Delhi Jal Board, MSEDCL, etc.) |
| National General | CPGRAMS, DARPG, PMO, DPG |
| State General | Delhi PGMS, UP Jansunwai, Maharashtra Aaple Sarkar, AP PGRS |

### 🔐 Authentication & Security
- **Email/Password** login with bcrypt hashing
- **Google OAuth 2.0** single sign-on
- **Forgot Password** flow with secure email-based reset tokens (1-hour expiry)
- **JWT-based** session management with protected routes
- **Role-based access** — Citizen vs Admin dashboards

### 📊 Admin Dashboard
- View and manage all submitted grievances
- Filter by status, category, and priority
- Update grievance status (pending → in_progress → resolved → closed)
- Assign grievances to specific teams

---

## 🛠️ Tech Stack & Architecture

This project uses a **microservices architecture**, fully containerized with Docker.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Frontend   │────▶│   Backend    │────▶│    AI Engine      │
│  React/Vite  │     │  Express.js  │     │  FastAPI/Python   │
│  Port 3000   │     │  Port 5000   │     │  Port 8000        │
└──────────────┘     └──────┬───────┘     └────────┬──────────┘
                            │                      │
                     ┌──────▼───────┐        ┌─────▼──────────┐
                     │  MongoDB     │        │  Sarvam AI     │
                     │  Atlas       │        │  Google Gemini  │
                     └──────────────┘        └────────────────┘
```

### 1. Frontend (Port `3000`)
- **Framework:** React.js 18 + Vite (Node 20)
- **Animations:** Framer Motion
- **Styling:** Vanilla CSS with design tokens
- **Key Pages:**
  - `CitizenAuth` — Login, Register, Google OAuth, Forgot Password
  - `SubmitGrievance` — Text/Voice input + optional PDF proof
  - `VerifyGrievance` — AI understanding confirmation
  - `GrievanceForm` — Location and contact details
  - `AIAnalysis` — AI results, portal links, procedure steps, helplines
  - `Dashboard` — Citizen's grievance history and status tracking
  - `AdminDashboard` — Admin management interface
  - `ResetPassword` — Secure token-based password recovery

### 2. Backend API (Port `5000`)
- **Framework:** Node.js + Express.js (Node 20)
- **Database:** MongoDB Atlas via Mongoose
- **Authentication:** JWT + bcrypt + Google OAuth 2.0
- **File Uploads:** Multer
- **Email:** Nodemailer (Gmail SMTP) for password resets and follow-ups
- **Cron Jobs:** Automated follow-up emails for unresolved grievances
- **Key Models:**
  - `User` — Citizen & admin accounts (with password reset token support)
  - `Grievance` — Core grievance record with 29-category enum validation
  - `AiAnalysis` — LLM output (summary, keywords, confidence score)
  - `StatusUpdate` — Audit trail of status changes
  - `TrainingData` — Confirmed grievances for future model improvement
- **Portal Intelligence:** `portalData.js` contains a comprehensive directory of 40+ government portals with a `getPortalsForCategory(category, state)` helper function for intelligent routing.

### 3. AI Engine (Port `8000`)
- **Framework:** Python 3.11 + FastAPI
- **Services:**
  - `gemini_service.py` — Google Gemini 3 Flash for structured classification (Pydantic response schema)
  - `translate_service.py` — Sarvam AI for Indian language → English translation
  - `speech_service.py` — Sarvam AI for Speech-to-Text transcription
  - `ocr_service.py` — EasyOCR + Gemini Vision for handwritten text extraction
  - `grievance_service.py` — Orchestrates the full pipeline (extract → translate → classify → return)
- **Resilience:** Exponential backoff retries for Gemini API rate limits, graceful fallback when quota is exhausted

### 4. DevOps & CI/CD
- **Containerization:** Docker & Docker Compose (3 services)
- **Pipeline:** Jenkins (with Docker Socket)
- **Integration:** GitHub Webhooks via Ngrok

---

## 🔄 Grievance Processing Flow

```
Step 1: SUBMIT ─────────────────────────────────────────────────────────
  Citizen types/speaks grievance → React sends to /api/grievance/ingest

Step 2: AI INGEST ─────────────────────────────────────────────────────
  Backend forwards input to AI Engine (port 8000)
  AI Engine: Extract text → Translate to English → Gemini Analysis
  Returns: title, summary, category, priority, keywords, confidence

Step 3: VERIFY ────────────────────────────────────────────────────────
  Citizen sees AI's understanding in their own language
  Confirms (Yes) or rejects (No → resubmit)

Step 4: DETAILS ───────────────────────────────────────────────────────
  Citizen fills location form (state, district, pincode, address)
  Backend maps category + state → specific government portal(s)

Step 5: AI RESULT ─────────────────────────────────────────────────────
  Citizen sees:
    → Exact government portal links to file complaint
    → Helpline numbers
    → Step-by-step procedure guidelines
    → Expected resolution timeline
    → Nearby offices (with Google Maps links)
    → Option to download PDF summary
```

---

## 🚀 Local Development Setup

### Prerequisites
1. [Git](https://git-scm.com/downloads)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (must be running)
3. VS Code or any code editor

### Step 1: Clone & Configure
```bash
git clone https://github.com/saumya-0611/BhashaFlow.git
cd BhashaFlow
cp .env.example .env
```

Edit `.env` and fill in your actual credentials:
```env
# MongoDB Atlas connection string
MONGO_URI=<your_mongo_uri>

# JWT secret for token signing
JWT_SECRET=<your_jwt_secret>

# Gmail SMTP for emails (use App Password, not regular password)
GMAIL_USER=<your_gmail>
GMAIL_PASS=<your_gmail_app_password>

# AI Engine API keys
SARVAM_API_KEY=<your_sarvam_key>
GEMINI_API_KEY=<your_gemini_key>
GEMINI_MODEL=gemini-3-flash-preview

# Google OAuth credentials
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
VITE_GOOGLE_CLIENT_ID=<same_as_GOOGLE_CLIENT_ID>

# URLs
VITE_BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Step 2: Build & Start
```bash
docker compose up --build
```
> First run takes 5-10 minutes to download ML libraries. Subsequent runs are near-instant.

### Step 3: Access
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Engine | http://localhost:8000 |

### When to Rebuild
| Change Made | Action Needed |
|---|---|
| Frontend code (`.jsx`, `.css`) | `docker compose up --build` (code is baked into image) |
| Backend code (`.js`) | Restart picks up changes automatically via Nodemon |
| AI Engine code (`.py`) | `docker compose up --build` (Pydantic schema changes need rebuild) |
| `.env` changes | `docker compose down` then `docker compose up` |
| New npm/pip dependency | `docker compose up --build` |

---

## 📁 Project Structure

```
BhashaFlow/
├── frontend/                  # React + Vite frontend
│   └── src/
│       ├── pages/             # All page components
│       ├── components/        # Shared components (DashboardLayout, etc.)
│       └── utils/             # API client, auth guards
├── backend/                   # Node.js + Express backend
│   ├── models/                # Mongoose schemas (User, Grievance, etc.)
│   ├── routes/                # Express route handlers
│   │   ├── authRoutes.js      # Login, register, forgot/reset password
│   │   ├── googleAuthRoutes.js # OAuth 2.0 flow
│   │   ├── grievanceRoutes.js # Ingest, confirm, submit, status
│   │   └── adminRoutes.js     # Admin management endpoints
│   ├── middleware/             # JWT auth middleware
│   └── utils/
│       ├── portalData.js      # 40+ government portals directory
│       ├── mailer.js          # Email utilities (reset, follow-up)
│       └── cronJobs.js        # Scheduled follow-up jobs
├── ai-engine/                 # Python + FastAPI AI service
│   ├── main.py                # FastAPI app + route definitions
│   └── services/
│       ├── gemini_service.py  # Gemini LLM analysis (29 categories)
│       ├── grievance_service.py # Full processing pipeline
│       ├── translate_service.py # Sarvam AI translation
│       ├── speech_service.py  # Sarvam AI speech-to-text
│       └── ocr_service.py     # EasyOCR + Gemini Vision
├── docker-compose.yml         # Development orchestration
├── docker-compose.ci.yml      # CI/CD orchestration
├── Jenkinsfile                # CI/CD pipeline definition
└── .env.example               # Environment variable template
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|---|---|
| `Port is already allocated` | Stop conflicting services or change ports in `docker-compose.yml` |
| `Module Not Found` | Run `docker compose up --build` to install new dependencies |
| `category is not a valid enum` | Ensure all 3 services (Gemini schema, Mongoose model, portalData) share the same category list |
| Forgot Password email not sent | Verify `GMAIL_USER` and `GMAIL_PASS` in `.env` (use Google App Password) |
| AI returns `other` for everything | Check `GEMINI_API_KEY` is valid and quota is not exhausted |

---

## 👥 Team & Roles

- **Tech Lead / DevOps:** Saumya Srivastava — CI/CD pipeline, Docker architecture, cross-service integration
- **Frontend Developer:** — `frontend/` directory
- **Backend Developer:** — `backend/` directory
- **AI/ML Engineer:** — `ai-engine/` directory

---

## 📄 License

This project is developed as part of the NIIT University B.Tech CSE Capstone Program.