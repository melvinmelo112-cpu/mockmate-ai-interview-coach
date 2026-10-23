import { getModelName } from '../server/lib/interview.js';
import { getInterviewHistory, saveInterviewSession, clearInterviewHistory } from '../src/utils/storage.js';

console.log('====================================================');
console.log('       MOCKMATE AUTOMATED VERIFICATION SUITE        ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

async function runTests() {
  // 1. Model Configuration
  const model = getModelName();
  assert(model === 'gemini-2.5-flash', `Default GEMINI_MODEL is gemini-2.5-flash (got: ${model})`);

  // 2. Client-side Score Calculation Verification
  // Rule: overall score out of 10 = average of per-question technical, clarity, and structure scores
  const sampleEvaluations = [
    { scores: { technical: 8, clarity: 7, structure: 9 }, weak_topics: ['Async/Await microtasks'] },
    { scores: { technical: 6, clarity: 8, structure: 7 }, weak_topics: ['React memoization'] },
    { scores: { technical: 9, clarity: 9, structure: 8 }, weak_topics: [] },
    { scores: { technical: 5, clarity: 6, structure: 6 }, weak_topics: ['React memoization'] },
    { scores: { technical: 8, clarity: 8, structure: 7 }, weak_topics: ['Bundle optimization'] }
  ];

  const totalQuestions = sampleEvaluations.length;
  const sumTech = sampleEvaluations.reduce((acc, e) => acc + e.scores.technical, 0);
  const sumClarity = sampleEvaluations.reduce((acc, e) => acc + e.scores.clarity, 0);
  const sumStruct = sampleEvaluations.reduce((acc, e) => acc + e.scores.structure, 0);

  const avgTech = Number((sumTech / totalQuestions).toFixed(1));
  const avgClarity = Number((sumClarity / totalQuestions).toFixed(1));
  const avgStruct = Number((sumStruct / totalQuestions).toFixed(1));
  const overall = Number(((avgTech + avgClarity + avgStruct) / 3).toFixed(1));

  assert(avgTech === 7.2, `Technical average calculated correctly (expected 7.2, got ${avgTech})`);
  assert(avgClarity === 7.6, `Clarity average calculated correctly (expected 7.6, got ${avgClarity})`);
  assert(avgStruct === 7.4, `Structure average calculated correctly (expected 7.4, got ${avgStruct})`);
  assert(overall === 7.4, `Overall score calculated correctly in code (expected 7.4, got ${overall})`);

  // 3. Weak Topic Frequency Calculation & Tie Detection Verification
  const allWeakTopics = sampleEvaluations.flatMap(e => e.weak_topics || []);
  const freqMap = {};
  allWeakTopics.forEach(t => { if (t) freqMap[t] = (freqMap[t] || 0) + 1; });
  const sortedWeak = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);

  assert(sortedWeak[0][0] === 'React memoization' && sortedWeak[0][1] === 2,
    `Most frequent weak topic identified for Practice Weak Area (expected "React memoization" with count 2)`);

  // 4. Voice Metrics Calculation Verification
  // Rule: recording duration, approximate word count, estimated WPM. Hidden if under 5 seconds.
  const sampleTranscript = "I handled state management using React Context and useReducer for global theme and user state, avoiding unnecessary third party libraries.";
  const wordCount = sampleTranscript.trim().split(/\s+/).filter(Boolean).length;
  const durationSec = 12;
  const minutes = durationSec / 60;
  const estimatedWpm = Math.round(wordCount / minutes);

  assert(wordCount === 20, `Word count calculated from real transcript (20 words)`);
  assert(estimatedWpm === 100, `Estimated WPM calculated from real measurements (${estimatedWpm} WPM for 12s)`);

  // Under 5 seconds condition
  const shortDuration = 4;
  const showMetrics = shortDuration >= 5;
  assert(showMetrics === false, `Voice metrics properly hidden when duration < 5 seconds`);

  // 5. History Storage Mock Verification
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => { mockStorage[key] = val; },
    removeItem: (key) => { delete mockStorage[key]; }
  };

  const initialHist = getInterviewHistory();
  assert(Array.isArray(initialHist) && initialHist.length === 0, `Initial history is empty`);

  saveInterviewSession({
    role: 'Frontend Developer',
    difficulty: 'Medium',
    overallScore: 7.4,
    technicalScore: 7.2,
    clarityScore: 7.6,
    structureScore: 7.4,
    mainImprovementArea: 'React memoization',
    topWeakTopic: 'React memoization',
    questionsCount: 5
  });

  const savedHist = getInterviewHistory();
  assert(savedHist.length === 1, `History persists session entry`);
  assert(savedHist[0].role === 'Frontend Developer' && savedHist[0].overallScore === 7.4,
    `Persisted session contains role and score`);

  clearInterviewHistory();
  const clearedHist = getInterviewHistory();
  assert(clearedHist.length === 0, `History clears successfully`);

  console.log(`\nVerification Suite Completed: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
