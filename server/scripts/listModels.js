/**
 * server/scripts/listModels.js
 * Lists Gemini model identifiers available to the configured API key.
 * Run: node server/scripts/listModels.js
 * Shows model IDs and generateContent support. Never prints the API key.
 */
import { captureInheritedModel, loadEnv, getConfig } from '../lib/config.js';

captureInheritedModel();
loadEnv();

let cfg;
try {
  cfg = getConfig();
} catch (err) {
  console.error('[listModels] Configuration error:', err.message);
  process.exit(1);
}

console.log(`[listModels] Using config source: ${cfg.configSource}`);
console.log(`[listModels] Target model to verify: ${cfg.model}\n`);

import('@google/genai').then(async ({ GoogleGenAI }) => {
  const ai = new GoogleGenAI({ apiKey: cfg.apiKey });

  let allModels = [];
  try {
    const pager = await ai.models.list();
    // Collect all pages
    for await (const model of pager) {
      allModels.push(model);
    }
  } catch (err) {
    console.error('[listModels] Failed to list models:', err.message);
    process.exit(1);
  }

  if (allModels.length === 0) {
    console.log('[listModels] No models returned by API.');
    process.exit(0);
  }

  // Filter to models that support generateContent
  const capable = allModels.filter(m =>
    Array.isArray(m.supportedActions)
      ? m.supportedActions.includes('generateContent')
      : true // include if capability info not present
  );

  console.log(`[listModels] Total models returned: ${allModels.length}`);
  console.log(`[listModels] Models supporting generateContent (or all if field absent):\n`);

  capable.forEach(m => {
    const id = m.name || m.displayName || m.model || JSON.stringify(m);
    console.log('  ' + id);
  });

  // Check if our configured model is in the list
  const configuredModel = cfg.model;
  const found = capable.some(m => {
    const id = String(m.name || m.displayName || '');
    return id === configuredModel || id.endsWith('/' + configuredModel) || id.includes(configuredModel);
  });

  console.log(`\n[listModels] Configured model "${configuredModel}" found in list: ${found}`);
  if (!found) {
    console.log('[listModels] WARNING: Model may not be available to this API key.');
    console.log('[listModels] Consider using one of the listed models above.');
  }
}).catch(err => {
  console.error('[listModels] Import error:', err.message);
  process.exit(1);
});
