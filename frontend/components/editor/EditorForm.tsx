import React from 'react';
import { useResumeStore } from '../../lib/store/resumeStore';

interface EditorFormProps {
  activeSection: string;
}

export default function EditorForm({ activeSection }: EditorFormProps) {
  const { data, setBasics } = useResumeStore();

  if (activeSection === 'Basics') {
    return (
      <div style={{ padding: '0 8px', marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Basics</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Name
            <input 
              type="text" 
              value={data.basics.name} 
              onChange={(e) => setBasics({ ...data.basics, name: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-on-surface)' }}
            />
          </label>
          <label style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Email
            <input 
              type="text" 
              value={data.basics.email} 
              onChange={(e) => setBasics({ ...data.basics, email: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-on-surface)' }}
            />
          </label>
          {/* Add more fields here */}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 8px', marginTop: '24px' }}>
      <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Form for {activeSection} coming soon.</p>
    </div>
  );
}
