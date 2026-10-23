import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  LogOut,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Keyboard,
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';
import Avatar from './Avatar.jsx';
import Waveform from './Waveform.jsx';
import VoiceMetrics from './VoiceMetrics.jsx';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

export default function InterviewScreen({
  sessionConfig,
  currentQuestion,
  questionNumber,
  maxQuestions,
  difficulty,
  onSubmitAnswer,
  onNextQuestion,
  onEndInterview,
  isAnalyzing,
  currentEvaluation,
  sessionComplete
}) {
  const [answerMode, setAnswerMode] = useState('voice'); // 'voice' | 'typed'
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswerFromVoice, setIsAnswerFromVoice] = useState(false);
  const [lastVoiceDuration, setLastVoiceDuration] = useState(0);

  const { isSpeaking, speakText, stopSpeaking, isSupported: isSynthSupported } = useSpeechSynthesis();
  const {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    recordingDuration,
    permissionError,
    isSupported: isRecSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Automatically speak the new question when it appears
  useEffect(() => {
    if (currentQuestion && !currentEvaluation) {
      speakText(currentQuestion);
    }
    // Cleanup speech on unmount
    return () => {
      stopSpeaking();
    };
  }, [currentQuestion, currentEvaluation]);

  // When speech starts, ensure recording stops; when recording starts, cancel speech!
  const handleToggleRecord = () => {
    if (isListening) {
      stopListening();
      setIsAnswerFromVoice(true);
      setLastVoiceDuration(recordingDuration);
    } else {
      stopSpeaking(); // Prompt requirement: stop speech when recording starts
      resetTranscript();
      startListening();
      setIsAnswerFromVoice(true);
    }
  };

  const handleRepeatQuestion = () => {
    if (currentQuestion) {
      if (isListening) stopListening();
      speakText(currentQuestion);
    }
  };

  const getCombinedAnswer = () => {
    if (answerMode === 'voice') {
      const full = transcript + (interimTranscript ? ` ${interimTranscript}` : '');
      return full.trim();
    }
    return typedAnswer.trim();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isListening) {
      stopListening();
    }
    stopSpeaking();

    const candidateAnswer = getCombinedAnswer();
    if (!candidateAnswer) {
      alert('Please provide an answer before submitting.');
      return;
    }

    if (answerMode === 'voice') {
      setLastVoiceDuration(recordingDuration);
      setIsAnswerFromVoice(true);
    } else {
      setIsAnswerFromVoice(false);
    }

    onSubmitAnswer(candidateAnswer);
  };

  // Determine Avatar state
  let avatarState = 'idle';
  if (isAnalyzing) {
    avatarState = 'analyzing';
  } else if (isListening) {
    avatarState = 'listening';
  } else if (isSpeaking) {
    avatarState = 'speaking';
  }

  const activeAnswerText = getCombinedAnswer();
  const progressPercent = Math.min(100, Math.round((questionNumber / maxQuestions) * 100));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Top Header: Progress & Details */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              Question {questionNumber} of {maxQuestions}
            </span>
            <span className="badge badge-cyan">{sessionConfig.role}</span>
            <span className="badge badge-violet">Level {difficulty}/10</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to end this interview session?')) {
                stopSpeaking();
                stopListening();
                onEndInterview();
              }
            }}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#f43f5e' }}
          >
            <LogOut size={14} /> End Early
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f0ff, #a855f7)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Main Avatar & Status Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <Avatar state={avatarState} />
        
        {/* Real-time Waveform */}
        <div style={{ marginTop: '12px' }}>
          <Waveform
            active={isSpeaking || isListening}
            variant={isListening ? 'violet' : 'cyan'}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--cyan-primary)', letterSpacing: '0.05em' }}>
            Interviewer Prompt
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                title="Mute AI Speech"
              >
                <VolumeX size={14} /> Stop Audio
              </button>
            ) : (
              <button
                onClick={handleRepeatQuestion}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                title="Listen to question again"
              >
                <Volume2 size={14} /> Repeat Question
              </button>
            )}
          </div>
        </div>

        <p style={{
          fontSize: '1.25rem',
          lineHeight: '1.6',
          fontWeight: 600,
          color: '#f8fafc',
          letterSpacing: '-0.01em'
        }}>
          {currentQuestion}
        </p>
      </div>

      {/* Evaluation Results Card (If evaluated) */}
      {currentEvaluation ? (
        <div className="glass-panel" style={{
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'rgba(6, 15, 25, 0.85)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} /> Evaluation & Rubric Scores
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              AI Estimate
            </span>
          </div>

          {/* Scores Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Technical Depth</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {currentEvaluation.scores?.technical} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 10</span>
              </div>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Clarity</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
                {currentEvaluation.scores?.clarity} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 10</span>
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Structure</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                {currentEvaluation.scores?.structure} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 10</span>
              </div>
            </div>
          </div>

          {/* Feedback Text */}
          <div style={{ marginBottom: '18px', padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
            <span style={{ fontWeight: 600, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>Feedback:</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              {currentEvaluation.feedback}
            </p>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Strengths */}
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <strong style={{ color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckCircle2 size={14} /> Key Strengths
              </strong>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {(currentEvaluation.strengths || []).map((s, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <strong style={{ color: '#fbbf24', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <TrendingUp size={14} /> Areas to Improve
              </strong>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {(currentEvaluation.improvements || []).map((imp, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Weak Topics */}
          {currentEvaluation.weak_topics && currentEvaluation.weak_topics.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Gaps Identified for Adaptive Follow-up:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentEvaluation.weak_topics.map((topic, i) => (
                  <span key={i} className="badge badge-violet" style={{ textTransform: 'none' }}>
                    <Tag size={10} /> {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Question / View Results Button */}
          <button
            onClick={onNextQuestion}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            {sessionComplete ? 'View Final Results & Report' : 'Proceed to Next Question'}
            <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        /* Candidate Answer Input Area */
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Answer Mode Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setAnswerMode('voice')}
                className={answerMode === 'voice' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                <Mic size={14} /> Spoken Voice
              </button>
              <button
                type="button"
                onClick={() => setAnswerMode('typed')}
                className={answerMode === 'typed' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                <Keyboard size={14} /> Typed Answer
              </button>
            </div>

            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {activeAnswerText.length} / 3000 chars
            </span>
          </div>

          {/* Microphone Permission Warning / Support Notice */}
          {permissionError && (
            <div style={{
              marginBottom: '16px',
              padding: '12px 14px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem',
              color: '#fda4af'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{permissionError}</div>
            </div>
          )}

          {/* Spoken Voice Controls & Live Editable Transcript */}
          {answerMode === 'voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  disabled={isAnalyzing}
                  style={{
                    background: isListening ? '#f43f5e' : 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 22px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.95rem',
                    boxShadow: isListening ? '0 0 20px rgba(244, 63, 94, 0.5)' : '0 4px 15px rgba(168, 85, 247, 0.35)'
                  }}
                >
                  {isListening ? (
                    <>
                      <MicOff size={18} /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic size={18} /> Start Recording
                    </>
                  )}
                </button>

                {transcript && (
                  <button
                    type="button"
                    onClick={() => {
                      resetTranscript();
                      setLastVoiceDuration(0);
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  >
                    <RotateCcw size={14} /> Clear Transcript
                  </button>
                )}

                {isListening && (
                  <span style={{ fontSize: '0.85rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c084fc', animation: 'waveform-bounce 1s infinite' }} />
                    Recording live... ({Math.floor(recordingDuration)}s)
                  </span>
                )}
              </div>

              {/* Editable Transcript Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Spoken Answer Transcript (you can edit and polish before submitting):
                </label>
                <textarea
                  rows={4}
                  value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Click 'Start Recording' and speak your answer. Your live words will appear here in real time..."
                  maxLength={3000}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.92rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Voice Metrics (duration, word count, estimated WPM; hidden if < 5s) */}
              <VoiceMetrics
                durationSeconds={isListening ? recordingDuration : lastVoiceDuration}
                transcript={transcript}
              />
            </div>
          )}

          {/* Typed Answer Mode */}
          {answerMode === 'typed' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Typed Candidate Answer:
              </label>
              <textarea
                rows={5}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your structured answer here. Be specific, articulate trade-offs, and reference real-world examples..."
                maxLength={3000}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: '#f8fafc',
                  fontSize: '0.92rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Submit Answer Button */}
          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isAnalyzing || !activeAnswerText}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {isAnalyzing ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid #060913',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin-analyze 1s linear infinite'
                  }} />
                  Analyzing Answer with AI Evaluator...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Answer for AI Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
