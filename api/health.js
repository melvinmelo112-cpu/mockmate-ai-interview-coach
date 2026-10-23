import { getModelName } from '../server/lib/interview.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    model: getModelName(),
    geminiConfigured: hasKey
  });
}
