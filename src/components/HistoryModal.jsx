import React, { useState, useEffect } from 'react';
import { History, Trash2, X, Calendar, Award, AlertCircle } from 'lucide-react';
import { getInterviewHistory, clearInterviewHistory } from '../utils/storage.js';

export default function HistoryModal({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getInterviewHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your interview history?')) {
      clearInterviewHistory();
      setHistory([]);
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(3, 5, 12, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-panel glass-panel-glow" style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History color="#00f0ff" size={22} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Interview History
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {history.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 16px',
              color: 'var(--text-muted)'
            }}>
              <AlertCircle size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', color: '#94a3b8' }}>
                No past interview sessions found
              </p>
              <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>
                Complete an interview to see your scores, trends, and improvement targets saved here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#00f0ff' }}>
                      {item.role}
                    </span>
                    <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      • {item.difficulty} ({item.questionsCount} Questions)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} color="#fbbf24" />
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
                      {item.overallScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 10</span>
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  margin: '6px 0',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '8px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Technical: </span>
                    <strong style={{ color: '#38bdf8' }}>{item.technicalScore}/10</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Clarity: </span>
                    <strong style={{ color: '#c084fc' }}>{item.clarityScore}/10</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Structure: </span>
                    <strong style={{ color: '#34d399' }}>{item.structureScore}/10</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fbbf24' }}>Main Focus: </strong>
                  {item.mainImprovementArea}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <Calendar size={12} />
                  {formatDate(item.date)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button onClick={handleClear} className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Trash2 size={14} /> Clear History
            </button>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
