const STORAGE_KEY = 'mockmate_interview_history';

/**
 * Get all completed interview sessions from localStorage
 */
export function getInterviewHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read interview history from localStorage', err);
    return [];
  }
}

/**
 * Save a completed interview session
 */
export function saveInterviewSession(session) {
  try {
    const current = getInterviewHistory();
    const entry = {
      id: 'session_' + Date.now(),
      date: new Date().toISOString(),
      role: session.role || 'Frontend Developer',
      difficulty: session.difficulty || 'Medium',
      overallScore: session.overallScore || 0,
      technicalScore: session.technicalScore || 0,
      clarityScore: session.clarityScore || 0,
      structureScore: session.structureScore || 0,
      mainImprovementArea: session.mainImprovementArea || 'Continue practicing technical clarity and depth.',
      topWeakTopic: session.topWeakTopic || null,
      questionsCount: session.questionsCount || 5
    };
    const updated = [entry, ...current].slice(0, 30); // Store up to 30 past sessions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save interview session to localStorage', err);
    return [];
  }
}

/**
 * Clear interview history
 */
export function clearInterviewHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.error('Failed to clear interview history', err);
    return [];
  }
}
