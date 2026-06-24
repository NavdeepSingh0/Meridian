import React, { useEffect, useState } from 'react';
import PdfUploadZone from '../shared/PdfUploadZone';
import { useParsePdf } from '../../lib/hooks/useAnalysis';
import { useResumeStore } from '../../lib/store/resumeStore';

interface OnboardingModalProps {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [show, setShow] = useState(false);
  const parsePdfMutation = useParsePdf();
  const { loadResumeFromDB } = useResumeStore();

  useEffect(() => {
    // Only show if not previously onboarded
    const hasOnboarded = localStorage.getItem('meridian_onboarded');
    if (!hasOnboarded) {
      setShow(true);
    } else {
      // already onboarded, close immediately
      onClose();
    }
  }, [onClose]);

  const handleDismiss = () => {
    localStorage.setItem('meridian_onboarded', 'true');
    setShow(false);
    onClose();
  };

  const handleFileSelect = async (file: File) => {
    try {
      const data = await parsePdfMutation.mutateAsync(file);
      loadResumeFromDB(data.resume_data, null); // Load into store without DB ID
      handleDismiss();
    } catch (err) {
      console.error("Failed to parse PDF", err);
      // We don't dismiss if it failed so they can try again or start from scratch
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '16px',
        width: '100%', maxWidth: '600px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        {parsePdfMutation.isPending ? (
          <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', minHeight: '400px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-primary)', animation: 'spin 1.5s linear infinite' }}>autorenew</span>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>Analyzing your resume...</h2>
              <p style={{ color: 'var(--color-ink-muted)' }}>Our AI is extracting your details to build your new resume.</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: '40px 40px 24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '12px', fontFamily: 'var(--font-serif)' }}>Welcome to Meridian</h2>
              <p style={{ fontSize: '16px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.5 }}>
                Let&apos;s get started. You can upload an existing PDF resume to auto-fill your details, or start with a blank canvas.
              </p>
            </div>

            <div style={{ padding: '0 40px 24px' }}>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <PdfUploadZone 
                  onFileSelect={handleFileSelect} 
                  isLoading={parsePdfMutation.isPending} 
                />
              </div>
            </div>

            <div style={{ padding: '16px 40px 32px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleDismiss}
                style={{
                  background: 'none', border: 'none', 
                  color: 'var(--color-ink-muted)', fontSize: '15px', fontWeight: 500, 
                  cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px'
                }}
              >
                Start from scratch
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
