import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, BookOpen, ShieldAlert, FileText, Play, History, CheckCircle, Info } from 'lucide-react';

const PRESET_ROLES = [
  'Frontend Developer',
  'ECE Engineer',
  'Data Analyst'
];

export default function SetupScreen({
  onStartInterview,
  isLoading,
  initialPracticeTopic = '',
  initialRole = 'Frontend Developer',
  isPracticeWeakArea = false,
  onOpenHistory
}) {
  const [role, setRole] = useState(initialRole);
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');
  const [persona, setPersona] = useState('FRIENDLY');
  const [resumeText, setResumeText] = useState('');
  const [practiceTopic, setPracticeTopic] = useState(initialPracticeTopic);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(err => {
        console.warn('Health check error:', err);
        setHealthStatus({ status: 'offline', geminiConfigured: false });
      });
  }, []);

  useEffect(() => {
    if (initialPracticeTopic) {
      setPracticeTopic(initialPracticeTopic);
    }
  }, [initialPracticeTopic]);

  const handleStart = (e) => {
    e.preventDefault();
    const selectedRole = isCustomRole ? (customRole.trim() || 'Software Engineer') : role;
    const maxQuestions = isPracticeWeakArea ? 3 : 5;

    onStartInterview({
      role: selectedRole,
      difficulty,
      interviewerPersona: persona,
      resumeText,
      maxQuestions,
      practiceTopic: practiceTopic.trim() || undefined
    });
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #7928ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
          }}>
            <Terminal size={24} color="#060913" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #00f0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              MOCKMATE
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Adaptive AI Technical Interview Coach with Spoken Voice
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <History size={16} /> Past Sessions
        </button>
      </div>

      {/* API Key Notice Banner if not configured */}
      {healthStatus && !healthStatus.geminiConfigured && (
        <div style={{
          marginBottom: '24px',
          padding: '14px 18px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          fontSize: '0.875rem',
          color: '#fef3c7'
        }}>
          <ShieldAlert size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Gemini API Key Required:</strong> To conduct live adaptive AI interviews, ensure you set{' '}
            <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#00f0ff' }}>
              GEMINI_API_KEY
            </code>{' '}
            in <code style={{ color: '#00f0ff' }}>server/.env</code> locally or in your Vercel Project Environment Variables.
          </div>
        </div>
      )}

      {/* Practice Weak Area Alert Banner */}
      {isPracticeWeakArea && (
        <div style={{
          marginBottom: '24px',
          padding: '14px 18px',
          background: 'rgba(168, 85, 247, 0.12)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.9rem',
          color: '#e9d5ff'
        }}>
          <Sparkles size={20} color="#c084fc" />
          <div>
            <strong>Targeted Weak Area Drill:</strong> Conducting a focused 3-question adaptive session targeting{' '}
            <span style={{ color: '#00f0ff', fontWeight: 700 }}>"{practiceTopic}"</span>.
          </div>
        </div>
      )}

      <form onSubmit={handleStart} className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Target Role */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '10px', color: '#f8fafc' }}>
              Target Job Role
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              {PRESET_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setIsCustomRole(false); }}
                  className={!isCustomRole && role === r ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: '1 1 auto', minWidth: '160px' }}
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomRole(true)}
                className={isCustomRole ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: '1 1 auto', minWidth: '140px' }}
              >
                Other / Custom
              </button>
            </div>

            {isCustomRole && (
              <input
                type="text"
                placeholder="Enter custom role (e.g. Backend Go Engineer, DevOps Specialist)..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            )}
          </div>

          {/* Difficulty & Persona */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Difficulty */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '10px', color: '#f8fafc' }}>
                Difficulty Baseline
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={difficulty === d ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1 }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Adaptive: difficulty will dynamically scale based on your answers.
              </p>
            </div>

            {/* Persona */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '10px', color: '#f8fafc' }}>
                Interviewer Persona
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPersona('FRIENDLY')}
                  className={persona === 'FRIENDLY' ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1 }}
                >
                  Friendly
                </button>
                <button
                  type="button"
                  onClick={() => setPersona('STRICT')}
                  className={persona === 'STRICT' ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1 }}
                >
                  Strict
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {persona === 'FRIENDLY' ? 'Supportive, constructive, encouraging.' : 'Direct, challenging, concise, rigorous.'}
              </p>
            </div>
          </div>

          {/* Optional Practice Topic */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px', color: '#f8fafc' }}>
              <span>Optional Practice Topic</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Focus technical area</span>
            </label>
            <input
              type="text"
              placeholder="e.g. React Render Cycle, SQL CTEs, Embedded C Interrupts, State Management..."
              value={practiceTopic}
              onChange={(e) => setPracticeTopic(e.target.value)}
              maxLength={150}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Resume Paste Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="#00f0ff" /> Paste Resume or Project Summary (Optional)
              </label>
              <span style={{ fontSize: '0.78rem', color: resumeText.length > 5500 ? '#f43f5e' : 'var(--text-muted)' }}>
                {resumeText.length} / 6000 chars
              </span>
            </div>
            <textarea
              rows={5}
              placeholder="Paste your resume, project descriptions, or key accomplishments here. The AI will personalize questions based on projects you have built..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              maxLength={6000}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: '#f8fafc',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Start Button */}
          <div style={{ marginTop: '8px' }}>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px' }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid #060913',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin-analyze 1s linear infinite'
                  }} />
                  Initializing Adaptive Interview...
                </>
              ) : (
                <>
                  <Play size={18} fill="#060913" />
                  Start {isPracticeWeakArea ? 'Weak Area Practice (3 Questions)' : 'Interview (5 Questions)'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* How it works card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#00f0ff' }}>
          <BookOpen size={18} /> How MOCKMATE Works
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '4px' }}>1. Realistic Spoken Questions</strong>
            Questions are spoken via text-to-speech, contextualized to your role and resume projects.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '4px' }}>2. Voice or Typed Answers</strong>
            Answer via continuous microphone voice recognition (with live editable transcript) or typed fallback.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '4px' }}>3. Instant Rubric Feedback</strong>
            Each answer receives strict scoring on Technical depth, Clarity, and Structure with identified weak topics.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '4px' }}>4. Real-time Adaptation</strong>
            The AI raises difficulty when you excel or asks diagnostic follow-ups if you show technical gaps.
          </div>
        </div>
      </div>
    </div>
  );
}
