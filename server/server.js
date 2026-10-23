import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { startInterview, evaluateAnswer, getModelName } from './lib/interview.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security and body limits
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    model: getModelName(),
    geminiConfigured: hasKey
  });
});

// Start interview endpoint
app.post('/api/interview/start', async (req, res, next) => {
  try {
    const { role, difficulty, interviewerPersona, resumeText, maxQuestions, practiceTopic } = req.body || {};
    const result = await startInterview({
      role,
      difficulty,
      interviewerPersona,
      resumeText,
      maxQuestions,
      practiceTopic
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Submit answer & evaluate endpoint
app.post('/api/interview/answer', async (req, res, next) => {
  try {
    const {
      role,
      difficulty,
      interviewerPersona,
      resumeText,
      currentQuestion,
      candidateAnswer,
      questionNumber,
      maxQuestions,
      previousQuestions,
      previousEvaluations,
      practiceTopic
    } = req.body || {};

    const result = await evaluateAnswer({
      role,
      difficulty,
      interviewerPersona,
      resumeText,
      currentQuestion,
      candidateAnswer,
      questionNumber,
      maxQuestions,
      previousQuestions,
      previousEvaluations,
      practiceTopic
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Centralized error handler - ensures server never crashes
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.message || err);
  const status = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
  res.status(status).json({
    error: err.message || 'An unexpected error occurred while processing your request.',
    code: err.code || 'INTERNAL_ERROR'
  });
});

export { app };

const isMainModule = process.argv[1] && (
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
  process.argv[1].endsWith('server.js')
);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[MOCKMATE Server] Running on http://localhost:${PORT}`);
    console.log(`[MOCKMATE Server] Model: ${getModelName()}`);
    console.log(`[MOCKMATE Server] API Key configured: ${Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')}`);
  });
}

