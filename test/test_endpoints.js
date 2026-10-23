process.env.TEST_MODE = 'true';
import http from 'http';
import { app } from '../server/server.js';

const server = http.createServer(app);

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  console.log(`[Test Server] Listening on port ${port}`);

  function fetchUrl(path, options = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request(`http://127.0.0.1:${port}${path}`, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        });
      });
      req.on('error', reject);
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  }

  try {
    // 1. Check GET /api/health
    const health = await fetchUrl('/api/health');
    console.log('[Test GET /api/health]:', health.status, health.data);
    if (health.status !== 200 || health.data.status !== 'ok') {
      throw new Error('Health check failed');
    }

    // 2. Check POST /api/interview/start without API key (verify clear user error, no crash)
    const startNoKey = await fetchUrl('/api/interview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'Frontend Developer', difficulty: 'Medium' })
    });
    console.log('[Test POST /api/interview/start (no key handling)]:', startNoKey.status, startNoKey.data);
    if (!startNoKey.data.error || !startNoKey.data.error.includes('Gemini API key is not configured')) {
      throw new Error('Expected clear API key error message');
    }

    // 3. Check POST /api/interview/answer empty answer validation
    const answerEmpty = await fetchUrl('/api/interview/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentQuestion: 'Tell me about React', candidateAnswer: '' })
    });
    console.log('[Test POST /api/interview/answer (empty answer validation)]:', answerEmpty.status, answerEmpty.data);
    if (answerEmpty.status !== 400 || !answerEmpty.data.error.includes('Candidate answer cannot be empty')) {
      throw new Error('Expected empty answer rejection');
    }

    console.log('--- ALL BACKEND CONTRACT & ERROR HANDLING CHECKS PASSED ---');
  } catch (err) {
    console.error('[Test Failed]:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
