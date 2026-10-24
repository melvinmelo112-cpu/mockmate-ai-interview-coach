import http from 'http';

const body = JSON.stringify({
  role: 'ECE Engineer',
  difficulty: 'Medium',
  interviewerPersona: 'FRIENDLY',
  resumeText: '',
  maxQuestions: 5,
  practiceTopic: 'Microcontrollers and Embedded C'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/interview/start',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  timeout: 30000
};

const t0 = Date.now();
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const elapsed = Date.now() - t0;
    console.log(`HTTP ${res.statusCode} — ${elapsed}ms`);
    try {
      const parsed = JSON.parse(data);
      if (parsed.error) {
        console.log('Error:', parsed.error);
        console.log('Code:', parsed.code);
      } else {
        console.log('question:', parsed.question);
        console.log('startingDifficulty:', parsed.startingDifficulty);
      }
    } catch (e) {
      console.log('Raw response:', data.slice(0, 500));
    }
  });
});
req.on('timeout', () => { req.destroy(); console.log('Request timed out'); });
req.on('error', err => console.log('Request error:', err.message));
req.write(body);
req.end();
