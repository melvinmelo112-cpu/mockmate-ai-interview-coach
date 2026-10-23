# MOCKMATE 🎙️🤖
> **Adaptive AI Technical Interview Coach with Voice**

MOCKMATE is an end-to-end technical interview platform powered by Google Gemini. It conducts realistic, voice-interactive technical mock interviews with dynamic difficulty scaling, instant rubric-based evaluations, and targeted weak-area practice drills.

---

## 🌟 Key Features

- **Adaptive Interview Engine**: Dynamically scales technical difficulty (1–10) based on answer depth; probes deeper on strong answers or introduces diagnostic fundamentals on weak topics.
- **Interviewer Personas**:
  - **Friendly**: Supportive, welcoming, encouraging, and constructive.
  - **Strict**: Direct, concise, challenging, and rigorous.
- **Role Seeds & Resume Personalization**: Role-specific topic seeds for Frontend Developers, ECE Engineers, Data Analysts, or custom roles, with optional resume project personalization.
- **Bi-Directional Voice Interaction**:
  - **Text-to-Speech (TTS)**: Spoken questions via browser `speechSynthesis` with asynchronous voice resolution and automatic cancellation.
  - **Speech-to-Text (STT)**: Continuous microphone speech recognition (`webkitSpeechRecognition`) with live interim streaming and editable transcripts.
- **Real Voice Delivery Metrics**:
  - Measures duration, approximate word count, and estimated words per minute (WPM).
  - Strictly measured from actual speech (hidden if recording is under 5 seconds; never generates fake filler or confidence scores).
- **4-State CSS Animated Avatar**:
  - States: `idle`, `speaking`, `listening`, and `analyzing` with real-time waveform animation.
- **Strict Single-Call Evaluation**:
  - Uses structured JSON output with Gemini schemas for technical, clarity, and structure scores (1–10).
- **Client-Side Analytical Reporting**:
  - Overall score calculated strictly in code as the average of technical, clarity, and structure scores.
  - Competency radar chart powered by **Recharts**.
  - Aggregated strengths, improvements, and specific technical weak topics.
- **Targeted "Practice Weak Area" Mode**:
  - Automatically identifies the most frequent weak topic (with interactive tie resolution) and initiates a focused 3-question adaptive session.
- **Local Session History**:
  - Persists completed session statistics in browser `localStorage`.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Recharts, Lucide React, CSS3 Design System (Glassmorphic Cyberpunk Theme)
- **Backend**: Node.js, Express (local dev on port 5000), Vercel Serverless Functions (`api/`)
- **AI SDK**: Official Google Gen AI JavaScript SDK (`@google/genai`)
- **Model**: Default `gemini-2.5-flash` (fast, structured JSON support)
- **APIs**: Web Speech API (`SpeechSynthesis` & `SpeechRecognition`), `localStorage`

---

## 📁 Repository Structure

```
Mockmate/
├── api/                           # Vercel Serverless Functions (Production)
│   ├── health.js                  # GET /api/health
│   └── interview/
│       ├── start.js               # POST /api/interview/start
│       └── answer.js              # POST /api/interview/answer
├── server/
│   ├── lib/
│   │   └── interview.js           # Shared Gemini logic, schemas & validation
│   ├── server.js                  # Express dev server on port 5000
│   ├── .env.example               # Placeholder template (tracked by git)
│   └── .env                       # Local secrets (ignored by git)
├── src/
│   ├── components/
│   │   ├── Avatar.jsx             # 4-state animated avatar
│   │   ├── Waveform.jsx           # Animated audio waveform
│   │   ├── VoiceMetrics.jsx       # Duration, word count, WPM metrics
│   │   ├── SetupScreen.jsx        # Role, persona, difficulty & resume input
│   │   ├── InterviewScreen.jsx    # Live interview loop with speech & evaluation
│   │   ├── ResultsScreen.jsx      # Scoring, radar chart & weak area launcher
│   │   └── HistoryModal.jsx       # Stored interview history
│   ├── hooks/
│   │   ├── useSpeechRecognition.js# Continuous webkitSpeechRecognition hook
│   │   └── useSpeechSynthesis.js  # TTS playback and voice loader hook
│   ├── utils/
│   │   └── storage.js             # localStorage persistence
│   ├── App.jsx                    # Core state machine
│   ├── main.jsx                   # React entrypoint
│   └── index.css                  # Futuristic theme and animation rules
├── test/                          # Automated verification suite
│   ├── adaptive_flow_test.js
│   ├── comprehensive_test.js
│   ├── interview_logic_test.js
│   └── test_endpoints.js
├── index.html
├── package.json
├── vercel.json                    # Minimal Vercel deployment config
└── vite.config.js                 # Dev proxy routing /api -> http://localhost:5000
```

---

## ⚙️ Environment Variables

The application requires the following environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your Google AI Studio API Key ([Get one here](https://aistudio.google.com/apikey)) | *Required* |
| `GEMINI_MODEL` | Fast, structured Gemini model | `gemini-2.5-flash` |
| `PORT` | Local Express server port | `5000` |

### Setting Up Environment Variables Locally:

1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```
2. Open `server/.env` and paste your Google AI Studio API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   PORT=5000
   ```

*Security Note: `server/.env` is strictly excluded by `.gitignore` to prevent committing keys to version control. Never expose API keys to client-side code.*

---

## 🚀 Running the Application Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Express Server
In a terminal window:
```bash
npm run server
```
The server will run on `http://localhost:5000`.

### 3. Start the Frontend Dev Server
In a second terminal window:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser (Google Chrome recommended for full Web Speech API support). Vite automatically proxies all `/api` requests to `http://localhost:5000`.

---

## 🧪 Testing & Verification

Automated test suites are included to verify functionality:

1. **Interview Logic & API Key Validation**:
   ```bash
   node test/interview_logic_test.js
   ```
2. **Contract & Input Validation**:
   ```bash
   node test/adaptive_flow_test.js
   ```
3. **Scoring, Voice Metrics & Storage Suite**:
   ```bash
   node test/comprehensive_test.js
   ```
4. **Local Express HTTP Endpoints**:
   ```bash
   node test/test_endpoints.js
   ```
5. **Production Build Verification**:
   ```bash
   npm run build
   ```

---

## 🚢 GitHub & Vercel Deployment Guide

The repository is configured to deploy directly to Vercel without architectural changes.

### Step 1: Push to GitHub
1. Create a new GitHub repository at `https://github.com/new`.
2. Push your local repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your imported GitHub repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (Project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
   - `GEMINI_MODEL`: `gemini-2.5-flash`
5. Click **"Deploy"**.

Vercel automatically compiles the static frontend into `dist` and deploys the endpoints in `api/` (`/api/health`, `/api/interview/start`, `/api/interview/answer`) as serverless functions.

---

## ⚠️ Known Limitations & Browser Support

1. **Speech Recognition**: The Web Speech Recognition API (`webkitSpeechRecognition`) is natively supported in **Google Chrome**, **Microsoft Edge**, and Chromium-based browsers. On unsupported browsers (such as Firefox or Safari), an alert is displayed and the candidate can seamlessly type answers using the built-in typed fallback.
2. **Microphone Permissions**: Browsers require either a `localhost` origin or an `HTTPS` connection to grant microphone access.
3. **AI Evaluations**: All scores and evaluations are labeled as AI estimates based on evidence provided in the candidate's answers.
