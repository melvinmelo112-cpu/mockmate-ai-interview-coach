import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen.jsx';
import InterviewScreen from './components/InterviewScreen.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import HistoryModal from './components/HistoryModal.jsx';
import { saveInterviewSession } from './utils/storage.js';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('setup'); // 'setup' | 'interview' | 'results'
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Active Session State
  const [sessionConfig, setSessionConfig] = useState({
    role: 'Frontend Developer',
    difficulty: 'Medium',
    interviewerPersona: 'FRIENDLY',
    resumeText: '',
    maxQuestions: 5,
    practiceTopic: null
  });

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [nextQuestionPending, setNextQuestionPending] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);

  // Loading States
  const [isStarting, setIsStarting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Practice Weak Area Pre-fill
  const [practiceWeakTopic, setPracticeWeakTopic] = useState('');
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  /**
   * Start a new interview session
   */
  const handleStartInterview = async (config) => {
    setIsStarting(true);
    setGlobalError(null);

    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start interview.');
      }

      setSessionConfig(config);
      setCurrentQuestion(data.question);
      setCurrentDifficulty(data.startingDifficulty || 5);
      setQuestionNumber(1);
      setPreviousQuestions([data.question]);
      setEvaluations([]);
      setCurrentEvaluation(null);
      setNextQuestionPending(null);
      setSessionComplete(false);
      setSessionSummary(null);

      setView('interview');
    } catch (err) {
      console.error('Error starting interview:', err);
      setGlobalError(err.message || 'Failed to connect to AI Interviewer.');
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * Submit an answer for evaluation
   */
  const handleSubmitAnswer = async (candidateAnswer) => {
    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const payload = {
        role: sessionConfig.role,
        difficulty: currentDifficulty,
        interviewerPersona: sessionConfig.interviewerPersona,
        resumeText: sessionConfig.resumeText,
        currentQuestion,
        candidateAnswer,
        questionNumber,
        maxQuestions: sessionConfig.maxQuestions,
        previousQuestions,
        previousEvaluations: evaluations.map(e => ({
          scores: e.scores,
          weak_topics: e.weak_topics
        })),
        practiceTopic: sessionConfig.practiceTopic
      };

      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answer.');
      }

      const evalData = data.evaluation;
      setCurrentEvaluation(evalData);
      setEvaluations((prev) => [...prev, evalData]);

      if (data.session_complete) {
        setSessionComplete(true);
        setSessionSummary(data.session_summary || null);
        setNextQuestionPending(null);
      } else {
        setNextQuestionPending(data.next_question);
        if (data.next_difficulty) {
          setCurrentDifficulty(data.next_difficulty);
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setGlobalError(err.message || 'Evaluation error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Proceed to next question or show results
   */
  const handleNextQuestion = () => {
    if (sessionComplete) {
      // Complete session: save to history and show results screen
      const totalQ = evaluations.length || 1;
      const sumTech = evaluations.reduce((acc, e) => acc + (e.scores?.technical || 0), 0);
      const sumClarity = evaluations.reduce((acc, e) => acc + (e.scores?.clarity || 0), 0);
      const sumStruct = evaluations.reduce((acc, e) => acc + (e.scores?.structure || 0), 0);

      const avgT = Number((sumTech / totalQ).toFixed(1));
      const avgC = Number((sumClarity / totalQ).toFixed(1));
      const avgS = Number((sumStruct / totalQ).toFixed(1));
      const overall = Number(((avgT + avgC + avgS) / 3).toFixed(1));

      const mainImp = evaluations.flatMap(e => e.improvements || [])[0] ||
        (sessionSummary?.recommendations ? sessionSummary.recommendations[0] : 'Practice technical clarity and depth.');

      const topWeak = sessionSummary?.top_weak_topics?.[0] ||
        evaluations.flatMap(e => e.weak_topics || [])[0] || null;

      saveInterviewSession({
        role: sessionConfig.role,
        difficulty: sessionConfig.difficulty,
        overallScore: overall,
        technicalScore: avgT,
        clarityScore: avgC,
        structureScore: avgS,
        mainImprovementArea: mainImp,
        topWeakTopic: topWeak,
        questionsCount: evaluations.length
      });

      setView('results');
    } else if (nextQuestionPending) {
      setCurrentQuestion(nextQuestionPending);
      setPreviousQuestions((prev) => [...prev, nextQuestionPending]);
      setQuestionNumber((prev) => prev + 1);
      setCurrentEvaluation(null);
      setNextQuestionPending(null);
    }
  };

  /**
   * Early session end
   */
  const handleEndInterview = () => {
    if (evaluations.length > 0) {
      setView('results');
    } else {
      setView('setup');
    }
  };

  /**
   * Practice weak area drill (3 questions)
   */
  const handlePracticeWeakArea = (weakTopic) => {
    setPracticeWeakTopic(weakTopic);
    setIsPracticeMode(true);
    setView('setup');
  };

  const handleRestart = () => {
    handleStartInterview(sessionConfig);
  };

  const handleGoHome = () => {
    setPracticeWeakTopic('');
    setIsPracticeMode(false);
    setView('setup');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Global Error Banner */}
      {globalError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          maxWidth: '650px',
          width: '90%',
          padding: '14px 18px',
          background: 'rgba(244, 63, 94, 0.95)',
          color: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(244, 63, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {view === 'setup' && (
          <SetupScreen
            onStartInterview={handleStartInterview}
            isLoading={isStarting}
            initialPracticeTopic={practiceWeakTopic}
            initialRole={sessionConfig.role}
            isPracticeWeakArea={isPracticeMode}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {view === 'interview' && (
          <InterviewScreen
            sessionConfig={sessionConfig}
            currentQuestion={currentQuestion}
            questionNumber={questionNumber}
            maxQuestions={sessionConfig.maxQuestions}
            difficulty={currentDifficulty}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            onEndInterview={handleEndInterview}
            isAnalyzing={isAnalyzing}
            currentEvaluation={currentEvaluation}
            sessionComplete={sessionComplete}
          />
        )}

        {view === 'results' && (
          <ResultsScreen
            sessionConfig={sessionConfig}
            evaluations={evaluations}
            sessionSummary={sessionSummary}
            onPracticeWeakArea={handlePracticeWeakArea}
            onRestartInterview={handleRestart}
            onGoHome={handleGoHome}
          />
        )}
      </main>

      {/* History Drawer Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
