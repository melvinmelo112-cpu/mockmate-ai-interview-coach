import { startInterview, evaluateAnswer, getModelName } from '../server/lib/interview.js';

async function runUnitTests() {
  console.log('Running interview logic unit tests...');

  // 1. Model default check
  const model = getModelName();
  console.log('Default model:', model);
  if (!model.includes('gemini')) {
    throw new Error('Default model is not set to a gemini model');
  }

  // 2. startInterview throws descriptive error when GEMINI_API_KEY is not set
  let keyErrorCaught = false;
  try {
    await startInterview({ role: 'Frontend Developer', difficulty: 'Medium' });
  } catch (err) {
    if (err.message && err.message.includes('Gemini API key is not configured')) {
      keyErrorCaught = true;
      console.log('PASS: startInterview properly detects missing API key with clear message.');
    } else {
      console.error('Unexpected error message:', err);
    }
  }
  if (!keyErrorCaught) {
    throw new Error('Expected startInterview to reject missing API key');
  }

  // 3. evaluateAnswer rejects empty candidateAnswer
  let emptyAnswerCaught = false;
  try {
    await evaluateAnswer({ currentQuestion: 'What is a closure?', candidateAnswer: '   ' });
  } catch (err) {
    if (err.statusCode === 400 && err.message.includes('Candidate answer cannot be empty')) {
      emptyAnswerCaught = true;
      console.log('PASS: evaluateAnswer rejects empty candidateAnswer with 400.');
    }
  }
  if (!emptyAnswerCaught) {
    throw new Error('Expected evaluateAnswer to reject empty answer');
  }

  // 4. evaluateAnswer rejects empty currentQuestion
  let emptyQuestionCaught = false;
  try {
    await evaluateAnswer({ currentQuestion: '', candidateAnswer: 'A closure is...' });
  } catch (err) {
    if (err.statusCode === 400 && err.message.includes('Current question is required')) {
      emptyQuestionCaught = true;
      console.log('PASS: evaluateAnswer rejects empty question with 400.');
    }
  }
  if (!emptyQuestionCaught) {
    throw new Error('Expected evaluateAnswer to reject empty question');
  }

  console.log('All interview logic unit tests passed successfully!');
}

runUnitTests().catch(err => {
  console.error('Unit tests failed:', err);
  process.exit(1);
});
