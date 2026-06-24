'use client';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Shield, FileText, Zap, UploadCloud, FolderOpen } from 'lucide-react';

interface PdfUploadZoneProps {
  onFileSelect: (file: File) => void;
  onSelectFromCloud?: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function PdfUploadZone({ onFileSelect, onSelectFromCloud, isLoading = false, className = '' }: PdfUploadZoneProps) {
  const [isHovering, setIsHovering] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isLoading,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div 
      {...getRootProps()} 
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '380px',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        border: isDragActive ? '2px dashed var(--color-primary)' : '2px dashed var(--color-border)',
        borderRadius: '32px',
        backgroundColor: isDragActive ? 'rgba(100, 182, 172, 0.05)' : '#ffffff',
        transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
        cursor: 'pointer',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        opacity: isLoading ? 0.8 : 1,
        pointerEvents: isLoading ? 'none' : 'auto',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <input {...getInputProps()} />
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--color-border)', opacity: 0.4 }}></div>
              <div className="animate-[spin_1.5s_linear_infinite]" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--color-primary)' }}></div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <span className="material-symbols-outlined text-2xl animate-pulse">document_scanner</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Analyzing PDF Document</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', margin: 0 }}>Extracting your career history using AI...</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s ease', transform: isDragActive ? 'translateY(-8px)' : 'none' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              backgroundColor: isDragActive ? 'var(--color-primary)' : isHovering ? 'rgba(100, 182, 172, 0.1)' : 'var(--color-surface)',
              color: isDragActive ? '#fff' : 'var(--color-primary)',
              transform: isHovering || isDragActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease',
              boxShadow: isDragActive ? '0 12px 24px rgba(100, 182, 172, 0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <UploadCloud size={40} strokeWidth={1.5} style={{ transform: isHovering && !isDragActive ? 'translateY(-4px)' : 'none', transition: 'transform 0.3s ease' }} />
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '12px', marginTop: 0 }}>
              {isDragActive ? 'Drop to analyze' : 'Upload your existing resume'}
            </h2>
            
            <p style={{ fontSize: '16px', color: 'var(--color-ink-muted)', marginBottom: '32px', maxWidth: '420px', lineHeight: 1.5 }}>
              {isDragReject ? (
                <span style={{ color: '#ef4444', fontWeight: 500 }}>Please upload a valid PDF file under 5MB.</span>
              ) : (
                "Drag & drop your PDF here, and our AI will automatically extract and map your experience to our ATS-friendly format."
              )}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  open();
                }}
                style={{
                padding: '12px 32px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: isDragActive ? '1px solid transparent' : '1px solid var(--color-border)',
                backgroundColor: isDragActive ? 'var(--color-primary)' : '#fff',
                color: isDragActive ? '#fff' : 'var(--color-ink)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isDragActive ? '0 4px 12px rgba(100, 182, 172, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <FolderOpen size={18} strokeWidth={2} />
                Browse Files
              </button>

              {onSelectFromCloud && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFromCloud();
                  }}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: '1px solid transparent',
                    backgroundColor: 'rgba(100, 182, 172, 0.1)',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <UploadCloud size={18} strokeWidth={2} />
                  Select from Meridian
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '48px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <Shield size={16} color="var(--color-primary)" strokeWidth={2} /> Secure
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <FileText size={16} color="var(--color-primary)" strokeWidth={2} /> PDF only
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <Zap size={16} color="var(--color-primary)" strokeWidth={2} /> Fast Analysis
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

