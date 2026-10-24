/**
 * server/lib/config.js
 * Single shared configuration module for Gemini API settings.
 * Used by Express server (local dev) and Vercel API functions (production).
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to server/.env — resolved relative to THIS file, not cwd.
const ENV_PATH = path.resolve(__dirname, '../.env');
const IS_VERCEL = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
let _configSource = IS_VERCEL ? 'Vercel environment' : 'process environment (dotenv not loaded yet)';

/**
 * Load dotenv from the explicit absolute path.
 * Must be called before getConfig().
 * Safe to call multiple times — only loads once per process.
 */
let _loaded = false;
export function loadEnv() {
  if (_loaded || IS_VERCEL) return;
  _loaded = true;

  // Dynamic import of dotenv — it is a CommonJS module, use createRequire.
  const require = createRequire(import.meta.url);
  let dotenv;
  try {
    dotenv = require('dotenv');
  } catch (err) {
    console.warn('[Config] dotenv not available, skipping .env load:', err.message);
    return;
  }

  if (!fs.existsSync(ENV_PATH)) {
    console.warn(`[Config] server/.env not found at ${ENV_PATH}. Using inherited environment.`);
    return;
  }

  // override: true ensures server/.env values take precedence over any
  // inherited shell variables (this is why model was stuck at old value).
  const result = dotenv.config({ path: ENV_PATH, override: true });

  if (result.error) {
    console.warn('[Config] Error loading server/.env:', result.error.message);
    return;
  }

  const inherited = process.env._INHERITED_GEMINI_MODEL; // set below for conflict detection
  _configSource = `server/.env (${ENV_PATH})`;
}

/**
 * Detect and store inherited GEMINI_MODEL before dotenv overwrites it.
 * Call this as early as possible, before loadEnv().
 */
export function captureInheritedModel() {
  if (!IS_VERCEL) {
    process.env._INHERITED_GEMINI_MODEL = process.env.GEMINI_MODEL || '';
  }
}

/**
 * Return validated configuration. Throws with a clear message if required
 * values are missing. Never returns the API key in plain text from the object
 * — use hasApiKey() to check presence.
 */
export function getConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  const fallback = process.env.GEMINI_FALLBACK_MODEL || null;

  const hasKey = Boolean(apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here');
  const inheritedModel = process.env._INHERITED_GEMINI_MODEL || null;

  // Conflict detection (non-fatal, logged once)
  if (!IS_VERCEL && inheritedModel && model && inheritedModel !== model) {
    console.log(`[Config] Model conflict: inherited="${inheritedModel}", server/.env="${model}". Using server/.env value.`);
  }

  if (!model || !model.trim()) {
    const err = new Error(
      'GEMINI_MODEL is not configured. Set it in server/.env (local) or Vercel environment variables.'
    );
    err.statusCode = 500;
    err.code = 'CONFIG_MISSING_MODEL';
    throw err;
  }

  if (!hasKey) {
    const err = new Error(
      'Gemini API key is not configured. Please set GEMINI_API_KEY in server/.env or your Vercel project environment variables.'
    );
    err.statusCode = 500;
    err.code = 'CONFIG_MISSING_KEY';
    throw err;
  }

  return {
    apiKey,          // used only server-side; never sent to frontend
    model: model.trim(),
    fallbackModel: fallback ? fallback.trim() : null,
    hasKey,
    configSource: _configSource,
    envPath: IS_VERCEL ? null : ENV_PATH
  };
}

/** Returns only safe-to-log fields — no API key. */
export function getSafeConfigInfo() {
  const model = process.env.GEMINI_MODEL || '<not set>';
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );
  return { model: model.trim(), hasKey, configSource: _configSource, envPath: IS_VERCEL ? null : ENV_PATH };
}
