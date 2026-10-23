import React, { useState } from 'react';
import {
  Award,
  RotateCcw,
  Home,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Tag,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

export default function ResultsScreen({
  sessionConfig,
  evaluations = [],
  sessionSummary = {},
  onPracticeWeakArea,
  onRestartInterview,
  onGoHome
}) {
  const [selectedTiedTopic, setSelectedTiedTopic] = useState('');
  const [showTiePicker, setShowTiePicker] = useState(false);

  // Calculate scores strictly in code
  const totalQuestions = evaluations.length || 1;
  const sumTech = evaluations.reduce((acc, e) => acc + (e.scores?.technical || 0), 0);
  const sumClarity = evaluations.reduce((acc, e) => acc + (e.scores?.clarity || 0), 0);
  const sumStruct = evaluations.reduce((acc, e) => acc + (e.scores?.structure || 0), 0);

  const avgTechnical = Number((sumTech / totalQuestions).toFixed(1));
  const avgClarity = Number((sumClarity / totalQuestions).toFixed(1));
  const avgStructure = Number((sumStruct / totalQuestions).toFixed(1));

  // Overall score out of 10 = average of per-question technical, clarity, and structure scores
  const overallScore = Number(((avgTechnical + avgClarity + avgStructure) / 3).toFixed(1));

  // Radar chart data
  const chartData = [
    { subject: 'Technical Depth', score: avgTechnical, fullMark: 10 },
    { subject: 'Clarity', score: avgClarity, fullMark: 10 },
    { subject: 'Structure', score: avgStructure, fullMark: 10 }
  ];

  // Aggregate strengths, improvements, and weak topics across questions
  const allStrengths = Array.from(new Set(evaluations.flatMap(e => e.strengths || [])));
  const allImprovements = Array.from(new Set(evaluations.flatMap(e => e.improvements || [])));
  const allWeakTopics = evaluations.flatMap(e => e.weak_topics || []);

  // Calculate frequency of weak topics
  const frequencyMap = {};
  allWeakTopics.forEach(t => {
    if (t) frequencyMap[t] = (frequencyMap[t] || 0) + 1;
  });

  const sortedWeakTopics = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedWeakTopics.length > 0 ? sortedWeakTopics[0][1] : 0;
  const topTiedTopics = sortedWeakTopics.filter(([_, count]) => count === maxCount).map(([topic]) => topic);

  const handlePracticeClick = () => {
    if (topTiedTopics.length === 0) {
      onPracticeWeakArea('System Optimization & Foundations');
      return;
    }

    if (topTiedTopics.length === 1) {
      onPracticeWeakArea(topTiedTopics[0]);
    } else {
      // Tie detected: prompt user to pick
      setSelectedTiedTopic(topTiedTopics[0]);
      setShowTiePicker(true);
    }
  };

  const handleConfirmTiedPractice = () => {
    setShowTiePicker(false);
    onPracticeWeakArea(selectedTiedTopic || topTiedTopics[0]);
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '32px 16px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '28px', marginBottom: '28px', textAlign: 'center' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
          Interview Complete
        </span>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          background: 'linear-gradient(to right, #ffffff, #00f0ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          Performance Analysis & Report
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {sessionConfig.role} • {sessionConfig.difficulty} Difficulty • {evaluations.length} Questions Completed
        </p>
      </div>

      {/* Main Score & Radar Chart Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* Overall Score Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Overall Score
            </span>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              AI Estimate
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '4rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
              {overallScore}
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              / 10
            </span>
          </div>

          {/* Metric Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ color: '#38bdf8' }}>Technical Correctness</span>
                <strong>{avgTechnical}/10</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(avgTechnical / 10) * 100}%`, height: '100%', background: '#38bdf8' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ color: '#c084fc' }}>Clarity of Explanation</span>
                <strong>{avgClarity}/10</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(avgClarity / 10) * 100}%`, height: '100%', background: '#c084fc' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ color: '#34d399' }}>Answer Structure</span>
                <strong>{avgStructure}/10</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(avgStructure / 10) * 100}%`, height: '100%', background: '#34d399' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Radar Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Competency Radar
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="rgba(255,255,255,0.15)" tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="Candidate Score" dataKey="score" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations & Action Plan */}
      {sessionSummary?.recommendations && sessionSummary.recommendations.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Lightbulb size={20} /> AI Recommendations & Practice Blueprint
          </h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.92rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessionSummary.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths & Improvements Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* Demonstrated Strengths */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <CheckCircle2 size={16} /> Key Strengths Shown
          </h4>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {allStrengths.length > 0 ? (
              allStrengths.map((str, i) => <li key={i}>{str}</li>)
            ) : (
              <li>Completed the interview questions.</li>
            )}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <TrendingUp size={16} /> Key Areas for Improvement
          </h4>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {allImprovements.length > 0 ? (
              allImprovements.map((imp, i) => <li key={i}>{imp}</li>)
            ) : (
              <li>Practice articulating architecture trade-offs.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Weak Topics */}
      {sortedWeakTopics.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Tag size={16} /> Specific Weak Topics Identified
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sortedWeakTopics.map(([topic, count], i) => (
              <span key={i} className="badge badge-violet" style={{ textTransform: 'none', padding: '6px 12px', fontSize: '0.85rem' }}>
                {topic} {count > 1 ? `(${count}x)` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Practice Weak Area Modal (If Tied) */}
      {showTiePicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(3, 5, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel glass-panel-glow" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              Choose Weak Topic to Practice
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Multiple weak areas appeared equally during your interview. Which one would you like to drill?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {topTiedTopics.map((topic) => (
                <label
                  key={topic}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: selectedTiedTopic === topic ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedTiedTopic === topic ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="tiedTopic"
                    checked={selectedTiedTopic === topic}
                    onChange={() => setSelectedTiedTopic(topic)}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{topic}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowTiePicker(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmTiedPractice} className="btn-primary">
                Start 3-Question Practice Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={handlePracticeClick}
          className="btn-primary"
          style={{ padding: '14px 28px', fontSize: '1rem', background: 'linear-gradient(135deg, #a855f7 0%, #00f0ff 100%)' }}
        >
          <Sparkles size={18} />
          Practice Weak Area ({sortedWeakTopics.length > 0 ? sortedWeakTopics[0][0] : 'Targeted Drill'})
        </button>

        <button
          onClick={onRestartInterview}
          className="btn-secondary"
          style={{ padding: '14px 24px', fontSize: '0.95rem' }}
        >
          <RotateCcw size={16} /> Restart Session
        </button>

        <button
          onClick={onGoHome}
          className="btn-secondary"
          style={{ padding: '14px 24px', fontSize: '0.95rem' }}
        >
          <Home size={16} /> Home Setup
        </button>
      </div>
    </div>
  );
}
