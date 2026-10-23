import { evaluateAnswer } from '../../server/lib/interview.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    return res.status(200).json(result);
  } catch (err) {
    console.error('[Vercel API Answer Error]:', err.message || err);
    const status = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
    return res.status(status).json({
      error: err.message || 'An error occurred while evaluating the answer.'
    });
  }
}
