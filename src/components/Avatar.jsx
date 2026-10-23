import React from 'react';
import { Bot, Mic, Volume2, Sparkles } from 'lucide-react';

export default function Avatar({ state = 'idle' }) {
  // state: 'idle' | 'speaking' | 'listening' | 'analyzing'
  
  const getBadgeInfo = () => {
    switch (state) {
      case 'speaking':
        return { text: 'AI Speaking', color: 'badge-cyan', icon: <Volume2 size={12} /> };
      case 'listening':
        return { text: 'Listening to You', color: 'badge-violet', icon: <Mic size={12} /> };
      case 'analyzing':
        return { text: 'Analyzing Response', color: 'badge-amber', icon: <Sparkles size={12} /> };
      case 'idle':
      default:
        return { text: 'Interviewer Ready', color: 'badge-cyan', icon: <Bot size={12} /> };
    }
  };

  const badge = getBadgeInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div className={`avatar-container avatar-state-${state}`}>
        {state === 'speaking' && (
          <Volume2 size={48} color="#00f0ff" style={{ filter: 'drop-shadow(0 0 10px #00f0ff)' }} />
        )}
        {state === 'listening' && (
          <Mic size={48} color="#c084fc" style={{ filter: 'drop-shadow(0 0 10px #a855f7)' }} />
        )}
        {state === 'analyzing' && (
          <Sparkles size={48} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }} />
        )}
        {state === 'idle' && (
          <Bot size={52} color="#00f0ff" style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))' }} />
        )}
      </div>

      <span className={`badge ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    </div>
  );
}
