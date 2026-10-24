import { getSafeConfigInfo, loadEnv, captureInheritedModel } from '../server/lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  captureInheritedModel();
  loadEnv();
  const info = getSafeConfigInfo();
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    model: info.model,
    keyConfigured: info.hasKey,
    configSource: info.configSource,
    geminiConfigured: info.hasKey // backward compat
  });
}
