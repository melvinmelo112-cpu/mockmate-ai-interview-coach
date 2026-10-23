import React from 'react';

export default function Waveform({ active = false, variant = 'cyan' }) {
  // variant: 'cyan' (speaking/ai) or 'violet' (listening/candidate)
  return (
    <div className={`waveform-container ${active ? (variant === 'violet' ? 'waveform-active waveform-listening' : 'waveform-active') : ''}`}>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
    </div>
  );
}
