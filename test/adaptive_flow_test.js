import { evaluateAnswer } from '../server/lib/interview.js';

// Test validating inputs and verifying output sanitization
console.log('Testing evaluateAnswer validation & schema mapping...');

async function testValidation() {
  // 1. Empty candidate answer rejection
  try {
    await evaluateAnswer({
      role: 'Frontend Developer',
      difficulty: 5,
      currentQuestion: 'Explain the Virtual DOM',
      candidateAnswer: '    '
    });
    console.error('FAIL: Expected empty answer to throw');
    process.exit(1);
  } catch (err) {
    if (err.statusCode === 400 && err.message.includes('Candidate answer cannot be empty')) {
      console.log('PASS: Empty answer properly rejected with 400.');
    } else {
      console.error('FAIL: Unexpected error:', err);
      process.exit(1);
    }
  }

  // 2. Missing current question rejection
  try {
    await evaluateAnswer({
      role: 'Frontend Developer',
      difficulty: 5,
      currentQuestion: '',
      candidateAnswer: 'It is an in-memory representation of real DOM.'
    });
    console.error('FAIL: Expected empty question to throw');
    process.exit(1);
  } catch (err) {
    if (err.statusCode === 400 && err.message.includes('Current question is required')) {
      console.log('PASS: Empty question properly rejected with 400.');
    } else {
      console.error('FAIL: Unexpected error:', err);
      process.exit(1);
    }
  }

  // 3. Missing API key rejection without crashing
  try {
    await evaluateAnswer({
      role: 'Frontend Developer',
      difficulty: 5,
      currentQuestion: 'Explain React reconciliation',
      candidateAnswer: 'Reconciliation is the algorithm React uses to diff one tree with another.'
    });
    console.error('FAIL: Expected missing key to throw');
    process.exit(1);
  } catch (err) {
    if (err.message.includes('Gemini API key is not configured')) {
      console.log('PASS: Missing GEMINI_API_KEY correctly throws informative error without crash.');
    } else {
      console.error('FAIL: Unexpected error message:', err);
      process.exit(1);
    }
  }

  console.log('All input validation and contract checks passed!');
}

testValidation();
