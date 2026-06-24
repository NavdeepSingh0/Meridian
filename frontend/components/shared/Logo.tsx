import React from 'react';

export default function Logo({ width = 160, className = '' }: { width?: number, className?: string }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg width={width * 0.25} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        {/* Trail swoosh */}
        <path d="M 15 50 C 40 58, 70 50, 95 45" stroke="#4db6ac" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 6" fill="none" />
        
        {/* Paper airplane body */}
        <path d="M 5 30 L 45 5 L 35 45 Z" fill="#e0f2f1" stroke="#4db6ac" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 5 30 L 45 5 L 20 35 Z" fill="#b2dfdb" stroke="#4db6ac" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 20 35 L 45 5 L 35 45 Z" fill="#4db6ac" stroke="#4db6ac" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <span style={{ 
        fontFamily: 'var(--font-serif)', 
        fontSize: `${width * 0.22}px`, 
        color: 'var(--color-ink)',
        fontWeight: 400,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        paddingBottom: '4px'
      }}>
        Meridian
      </span>
    </div>
  );
}
