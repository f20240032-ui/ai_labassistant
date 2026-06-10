# 📑 SPEC.md — AI Lab Assistant Platform Architecture Specification

## 1. Product Vision & Problem Statement

### The Problem
Engineering students face major friction during laboratory practicals. They lose precious hours debugging runtime or syntax errors in code scripts (**MATLAB, Arduino, Python, C**), struggle to identify physical hardware components in complex circuit diagrams, and lack integrated preparation utilities for spontaneous oral viva questions or standard lab report structuring.

### The Solution
**AI Lab Assistant** is a decoupled, multi-service platform that automates laboratory guidance. By splitting the software into dedicated extraction workers, an orchestration backend gateway, and an interactive frontend portal, the platform enables students to seamlessly upload text, code scripts, and circuit diagrams to receive immediate engineering guidance, step-by-step bug fixes, and clean report templates.

---

## 2. Microservices Blueprint & Local Port Configuration

```text
                     +---------------------------------------+
                     |           [3] Student UI              |
                     |           (Port :3001)                |
                     +---+-------------------------------+---+
                         |                               |
                         | Multipart Form Data           | REST / JSON
                         | (PDFs, Images, Code)          |
                         ▼                               ▼
     +-------------------+-------------------+       +---+-------------------+
     |       [4] Lab Report Processor        |       |   [2] Core Backend    |
     |         (Port :3002)                  |       |     (Port :3000)      |
     +---------------------------------------+       +---+-----------+-------+
                                                         |           |
                                         Trigger Context |           | Token Payload
                                                         ▼           |
                                     +-------------------+---+       |
                                     | [1] AI Layer Core     |       ▼
                                     |   (Port :5001)        |   +---+---------------+
                                     +-----------------------+   | [5] Gemini Engine |
                                                                 |   (External API)  |
                                                                 +-------------------+
```

---

## 3. Install & Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.x | Backend services [2], [4] and UI [3] |
| Python | ≥ 3.10 | AI Layer Core [1] |
| pip | latest | Python dependency management |
| npm | ≥ 9.x | JS dependency management |

### Clone & Bootstrap

```bash
git clone https://github.com/<org>/ai-lab-assistant.git
cd ai-lab-assistant
```

Install dependencies for each service:

```bash
# [1] AI Layer Core (Python)
cd services/ai-core
pip install -r requirements.txt
cd ../..

# [2] Core Backend (Node)
cd services/core-backend
npm install
cd ../..

# [3] Student UI (Node/React)
cd services/student-ui
npm install
cd ../..

# [4] Lab Report Processor (Node)
cd services/report-processor
npm install
cd ../..
```

---

## 4. Environment Variables

Create a `.env` file at the root of each service directory. Never commit these files — add `.env` to `.gitignore`.

### [1] AI Layer Core — `services/ai-core/.env`

```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
LOG_LEVEL=info
```

### [2] Core Backend — `services/core-backend/.env`

```env
PORT=3000
AI_CORE_URL=http://localhost:5001
REPORT_PROCESSOR_URL=http://localhost:3002
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3001
```

### [3] Student UI — `services/student-ui/.env`

```env
VITE_CORE_BACKEND_URL=http://localhost:3000
VITE_REPORT_PROCESSOR_URL=http://localhost:3002
PORT=3001
```

### [4] Lab Report Processor — `services/report-processor/.env`

```env
PORT=3002
AI_CORE_URL=http://localhost:5001
MAX_UPLOAD_SIZE_MB=10
ALLOWED_MIME_TYPES=application/pdf,image/png,image/jpeg,text/plain
```

---

## 5. Start All Services

Open four terminal windows/tabs and run each command in the corresponding service directory.

### Option A — Manual (one terminal per service)

```bash
# Terminal 1 — [1] AI Layer Core
cd services/ai-core && python app.py

# Terminal 2 — [2] Core Backend
cd services/core-backend && npm run dev

# Terminal 3 — [3] Student UI
cd services/student-ui && npm run dev

# Terminal 4 — [4] Lab Report Processor
cd services/report-processor && npm run dev
```

### Option B — Concurrent (single terminal, requires `concurrently`)

```bash
npm install -g concurrently

concurrently \
  "cd services/ai-core && python app.py" \
  "cd services/core-backend && npm run dev" \
  "cd services/student-ui && npm run dev" \
  "cd services/report-processor && npm run dev"
```

### Verify All Services Are Up

| Service | URL | Health Check |
|---------|-----|-------------|
| AI Layer Core | http://localhost:5001 | `GET /health` |
| Core Backend | http://localhost:3000 | `GET /health` |
| Student UI | http://localhost:3001 | Open in browser |
| Lab Report Processor | http://localhost:3002 | `GET /health` |

---

## 6. Three-Step Workflow

### Step 1 — Upload

The student navigates to the **Student UI** (`localhost:3001`) and uploads one or more of the following:

- A **code script** (`.m`, `.ino`, `.py`, `.c`) for bug detection
- A **circuit diagram image** (`.png`, `.jpg`) for component identification
- A **lab worksheet PDF** for report structuring or viva prep

The UI submits the payload as multipart form data to either the **Core Backend** (`:3000`) for AI tasks or the **Lab Report Processor** (`:3002`) for document extraction tasks.

### Step 2 — Process

**Path A — Code / Image (via Core Backend → AI Layer Core → Gemini)**

1. Core Backend (`:3000`) receives the upload and extracts metadata.
2. It forwards a structured context payload to the **AI Layer Core** (`:5001`).
3. AI Layer Core constructs a domain-specific prompt and calls the **Gemini Engine** (external API).
4. Gemini returns a token payload; AI Layer Core parses it and sends the structured result back to Core Backend.

**Path B — PDF / Report (via Lab Report Processor → AI Layer Core)**

1. Lab Report Processor (`:3002`) receives the PDF/image upload.
2. It extracts text blocks and triggers the AI Layer Core with section context.
3. AI Layer Core returns a structured report template or viva Q&A set.

### Step 3 — Respond

The result is returned to the **Student UI** as a clean JSON response and rendered as:

- Annotated bug fixes with line-by-line explanations (code path)
- Labelled component list with descriptions (circuit path)
- Structured lab report template or viva question bank (report path)

---

## 7. Project Scope Boundaries

### In Scope

- **Code debugging** for MATLAB, Arduino (C++), Python, and C — syntax errors, runtime exceptions, and logic antipatterns.
- **Circuit diagram analysis** — identification of standard passive and active components (resistors, capacitors, op-amps, MOSFETs, etc.) from uploaded images.
- **Lab report structuring** — generating standard report templates (Aim, Theory, Procedure, Observations, Results, Conclusion) from uploaded worksheets.
- **Viva preparation** — generating probable viva questions with model answers based on the experiment topic extracted from uploaded material.
- **Multi-language support** at the AI layer for the four target languages listed above.
- **Local-only deployment** — all services run on localhost; no cloud infrastructure is required to run the platform.

### Out of Scope

- **Real-time collaborative editing** of lab reports between multiple students.
- **LMS/VLE integration** (Moodle, Canvas, Google Classroom) — no grade submission or course sync.
- **Simulation or code execution** — the platform does not run student code; it only analyses it statically.
- **Hardware interfacing** — no serial port communication or live sensor data ingestion.
- **User authentication & persistence** — no login system, user accounts, or database storage of sessions in v1.
- **Mobile-native apps** — the Student UI is a responsive web app only; no iOS/Android builds.
- **Support for languages outside** MATLAB, Arduino, Python, and C (e.g. Verilog, VHDL, LabVIEW) in v1.
- **Production deployment, SSL termination, or load balancing** — out of scope for the current specification.