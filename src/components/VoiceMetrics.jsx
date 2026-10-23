import React from 'react';
import { Clock, MessageSquare, Gauge } from 'lucide-react';

export default function VoiceMetrics({ durationSeconds = 0, transcript = '' }) {
  if (durationSeconds < 5) {
    return null; // Prompt requirement: hide metrics if recording was under 5 seconds
  }

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;
  const minutes = durationSeconds / 60;
  const estimatedWpm = minutes > 0 && wordCount > 0 ? Math.round(wordCount / minutes) : 0;

  return (
    <div style={{
      marginTop: '12px',
      padding: '12px 16px',
      background: 'rgba(168, 85, 247, 0.08)',
      border: '1px solid rgba(168, 85, 247, 0.25)',
      borderRadius: '12px',
      fontSize: '0.85rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <span style={{ fontWeight: 600, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gauge size={14} /> Voice Delivery (Estimates)
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Real measurements only</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        textAlign: 'center'
      }}>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Clock size={11} /> Duration
          </div>
          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem', marginTop: '2px' }}>
            {Math.floor(durationSeconds)}s
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <MessageSquare size={11} /> Words
          </div>
          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem', marginTop: '2px' }}>
            ~{wordCount}
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Gauge size={11} /> Pace
          </div>
          <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '1rem', marginTop: '2px' }}>
            ~{estimatedWpm} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>WPM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
