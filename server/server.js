import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { captureInheritedModel, loadEnv, getSafeConfigInfo } from './lib/config.js';
import { startInterview, evaluateAnswer, getModelName } from './lib/interview.js';

// interview.js already calls captureInheritedModel + loadEnv on import.
// These calls here are no-ops (idempotent) — kept for explicitness.
captureInheritedModel();
loadEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and body limits
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const info = getSafeConfigInfo();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    model: info.model,
    keyConfigured: info.hasKey,
    configSource: info.configSource,
    // Legacy field for backward compat
    geminiConfigured: info.hasKey
  });
});

// Start interview endpoint
app.post('/api/interview/start', async (req, res, next) => {
  const t0 = Date.now();
  try {
    const { role, difficulty, interviewerPersona, resumeText, maxQuestions, practiceTopic } = req.body || {};
    const result = await startInterview({ role, difficulty, interviewerPersona, resumeText, maxQuestions, practiceTopic });
    console.log(`[API] POST /api/interview/start completed in ${Date.now() - t0}ms`);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Submit answer & evaluate endpoint
app.post('/api/interview/answer', async (req, res, next) => {
  const t0 = Date.now();
  try {
    const {
      role, difficulty, interviewerPersona, resumeText,
      currentQuestion, candidateAnswer, questionNumber, maxQuestions,
      previousQuestions, previousEvaluations, practiceTopic
    } = req.body || {};

    const result = await evaluateAnswer({
      role, difficulty, interviewerPersona, resumeText,
      currentQuestion, candidateAnswer, questionNumber, maxQuestions,
      previousQuestions, previousEvaluations, practiceTopic
    });
    console.log(`[API] POST /api/interview/answer completed in ${Date.now() - t0}ms`);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Centralized error handler — server never crashes
app.use((err, req, res, next) => {
  // Sanitize: never log or return the API key
  const safeMsg = (err.message || 'An unexpected error occurred.').replace(
    /AIza[^\s"']*/gi, '[REDACTED]'
  );
  console.error('[API Error]:', safeMsg);
  const status = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
  res.status(status).json({
    error: safeMsg,
    code: err.code || 'INTERNAL_ERROR'
  });
});

export { app };

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && (
  __filename === path.resolve(process.argv[1]) ||
  process.argv[1].endsWith('server.js')
);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  const info = getSafeConfigInfo();
  app.listen(PORT, () => {
    console.log(`[MOCKMATE Server] Running on http://localhost:${PORT}`);
    console.log(`[MOCKMATE Server] Model: ${info.model}`);
    console.log(`[MOCKMATE Server] Model source: ${info.configSource}`);
    console.log(`[MOCKMATE Server] API Key configured: ${info.hasKey}`);
  });
}
