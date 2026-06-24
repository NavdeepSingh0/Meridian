'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import builderStyles from '../builder/builder.module.css';
import analysisStyles from '../builder/AnalysisPanel.module.css';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useUserStore } from '../../lib/store/userStore';
import { useAtsScore, useCritique, useParsePdf } from '../../lib/hooks/useAnalysis';
import { ResumeData } from '../../lib/types/resume';
import { auth } from '../../lib/firebase/client';
import { signOut } from 'firebase/auth';
import ClassicTemplate from '../../components/templates/ClassicTemplate';
import ModernTemplate from '../../components/templates/ModernTemplate';
import MinimalTemplate from '../../components/templates/MinimalTemplate';
import AtsScoreView from '../../components/ai/AtsScoreView';
import CritiqueFeedbackView from '../../components/ai/CritiqueFeedbackView';
import PdfUploadZone from '../../components/shared/PdfUploadZone';
import { FileSearch } from 'lucide-react';

export default function CheckerPage() {
  const router = useRouter();
  const { resumeData, selectedTemplateId, fontSize, documentMargin, injectImprovement, setResumeData } = useResumeStore();
  const { firebaseUser, profile } = useUserStore();
  
  const [jd, setJd] = useState('');
  const [flowState, setFlowState] = useState<'idle' | 'loading' | 'scored' | 'feedback'>('idle');
  const [uploadMode, setUploadMode] = useState<'meridian' | 'upload'>('upload');
  const [uploadedResumeData, setUploadedResumeData] = useState<ResumeData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const atsMutation = useAtsScore();
  const critiqueMutation = useCritique();
  const parsePdfMutation = useParsePdf();

  const activeResumeData = uploadMode === 'upload' && uploadedResumeData ? uploadedResumeData : resumeData;

  const handleAnalyze = () => {
    setFlowState('loading');
    atsMutation.mutate({ resumeData: activeResumeData, jobDescription: jd }, {
      onSuccess: () => {
        setFlowState('scored');
      },
      onError: () => {
        setFlowState('idle');
      }
    });
  };

  const handleGetFeedback = () => {
    setFlowState('loading');
    critiqueMutation.mutate(activeResumeData, {
      onSuccess: () => {
        setFlowState('feedback');
      },
      onError: () => {
        setFlowState('scored');
      }
    });
  };

  const handlePdfUpload = (file: File) => {
    setFlowState('loading');
    parsePdfMutation.mutate(file, {
      onSuccess: (data) => {
        setUploadedResumeData(data.resume_data);
        setUploadMode('upload');
        setFlowState('idle');
      },
      onError: (err) => {
        console.error("PDF parse failed", err);
        setFlowState('idle');
      }
    });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setShowUserMenu(false);
  };

  const handleOpenInBuilder = () => {
    if (uploadedResumeData) {
      setResumeData(uploadedResumeData);
      router.push('/builder');
    }
  };

  const atsResult = atsMutation.data;
  const critiqueResult = critiqueMutation.data;

  let highlightedSections: { section: string; marker: number }[] = [];
  if (flowState === 'scored' && atsResult?.missing_keywords) {
    highlightedSections = [
      { section: 'Skills', marker: 1 },
      { section: 'Experience', marker: 2 }
    ];
  } else if (flowState === 'feedback' && critiqueResult) {
    highlightedSections = critiqueResult.sections.map((s, index) => {
      let mappedSection = s.section.charAt(0).toUpperCase() + s.section.slice(1);
      if (s.section === 'work') mappedSection = 'Experience';
      if (s.section === 'education') mappedSection = 'Education';
      if (s.section === 'basics') mappedSection = 'Summary';
      return { section: mappedSection, marker: index + 1 };
    });
  }

  return (
    <div className={builderStyles.builderTheme}>
      <header className={builderStyles.saasTopNav} style={{ position: 'relative' }}>
        <div className={builderStyles.builderTopNav}>
          <div className={builderStyles.builderBrand}>
            <span className={builderStyles.brandWordmark}>Meridian</span>
            <span className={builderStyles.brandCV}>Checker</span>
          </div>
        </div>
        
        {/* Step Indicator */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 106, 98, 0.1)', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-primary)' }}>Resume Ready</span>
          </div>
          <div style={{ width: '32px', height: '1px', backgroundColor: 'var(--color-ink)', opacity: 0.3 }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: flowState === 'idle' ? 0.5 : 1, filter: flowState === 'idle' ? 'grayscale(100%)' : 'none', transition: 'all 0.3s ease' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', fontSize: '12px', fontWeight: 600, backgroundColor: flowState === 'idle' ? 'var(--color-border)' : 'var(--color-primary)', color: flowState === 'idle' ? 'var(--color-ink-muted)' : '#fff' }}>
              2
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: flowState === 'idle' ? 'var(--color-ink-muted)' : 'var(--color-primary)' }}>
              Analysis Results
            </span>
          </div>
        </div>

        <div className={builderStyles.builderActions} style={{ position: 'relative' }}>
          {firebaseUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(0, 106, 98, 0.05)', border: '1px solid rgba(0, 106, 98, 0.2)', borderRadius: '20px', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', marginRight: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>
              {profile?.ai_credits ?? 0} Credits
            </div>
          )}
          
          <div style={{ position: 'relative', marginRight: '16px', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ 
                width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer'
              }}
            >
              {firebaseUser?.email?.charAt(0).toUpperCase() || 'U'}
            </button>
            
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                background: 'var(--color-base)', border: '1px solid var(--color-border)', 
                borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 100,
                width: '180px'
              }}>
                <div style={{ padding: '8px', fontSize: '13px', color: 'var(--color-ink-muted)', wordBreak: 'break-all' }}>
                  {firebaseUser?.email}
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }}></div>
                <button 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: '#EA4335' }}
                  onClick={handleSignOut}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {
              if (uploadMode === 'upload' && uploadedResumeData) {
                handleOpenInBuilder();
              } else {
                router.push('/builder');
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 600,
              backgroundColor: 'var(--color-primary)', color: '#fff',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(100, 182, 172, 0.2)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_document</span>
            {uploadMode === 'upload' && uploadedResumeData ? 'Open in Editor' : 'Return to Editor'}
          </button>
        </div>
      </header>

      <div className={builderStyles.saasLayoutWrapper}>
        <main className={builderStyles.saasMainCanvas} style={{ marginLeft: 0, marginRight: '360px', padding: '48px 32px' }}>
          <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
            {uploadMode === 'upload' && !uploadedResumeData ? (
              <div style={{ width: '100%', marginTop: '48px' }}>
                <PdfUploadZone 
                  onFileSelect={handlePdfUpload} 
                  onSelectFromCloud={() => setUploadMode('meridian')}
                  isLoading={parsePdfMutation.isPending}
                />
                {parsePdfMutation.isError && (
                  <div className="p-4 mt-6 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 shadow-sm flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {parsePdfMutation.error instanceof Error ? parsePdfMutation.error.message : 'Failed to parse PDF'}
                  </div>
                )}
              </div>
            ) : (
              <div 
                className={builderStyles.paperCard} 
                style={{ 
                  transform: 'scale(0.85)', 
                  transformOrigin: 'top center',
                  marginBottom: '-15%',
                  '--doc-font-size': `${fontSize}pt`,
                  '--doc-margin': `${documentMargin * 48}px`
                } as React.CSSProperties}
              >
                <div style={{ pointerEvents: 'none' }}>
                  {/* Always render the current active document using the current template settings */}
                  {selectedTemplateId === 'classic' && <ClassicTemplate highlightedSections={highlightedSections} data={activeResumeData} />}
                  {selectedTemplateId === 'modern' && <ModernTemplate highlightedSections={highlightedSections} data={activeResumeData} />}
                  {selectedTemplateId === 'minimal' && <MinimalTemplate highlightedSections={highlightedSections} data={activeResumeData} />}
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className={builderStyles.saasRightSidebar}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            
            {flowState === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', backgroundColor: 'rgba(0, 106, 98, 0.08)', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>scanner</span>
                    ATS Scanner
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px', lineHeight: 1.2 }}>Match your resume</h2>
                  <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>See how your resume scores against any job description.</p>
                </div>

                {uploadMode === 'upload' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!uploadedResumeData && !parsePdfMutation.isPending && (
                       <div style={{ padding: '32px 24px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                         <FileSearch style={{ width: '32px', height: '32px', color: 'var(--color-ink-muted)', opacity: 0.8, margin: '0 auto 12px' }} strokeWidth={1.5} />
                         <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-ink-muted)', margin: 0 }}>Upload your resume to begin analysis</p>
                       </div>
                    )}
                    {uploadedResumeData && !parsePdfMutation.isPending && (
                      <div style={{
                        padding: '16px',
                        backgroundColor: 'rgba(100, 182, 172, 0.08)',
                        border: '1px solid rgba(100, 182, 172, 0.2)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          backgroundColor: 'rgba(100, 182, 172, 0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, color: 'var(--color-primary)'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>description</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>Resume Parsed</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {uploadedResumeData.basics?.name || 'Resume'}
                          </p>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--color-primary)', flexShrink: 0
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>score</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Overall ATS Score</p>
                        <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.4 }}>Get a rating out of 100 based on standard parsing rules.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>manage_search</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Keyword Gaps</p>
                        <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.4 }}>See exactly which skills the ATS is looking for.</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => { setUploadMode('upload'); setUploadedResumeData(null); }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontWeight: 500, alignSelf: 'flex-start', marginTop: '4px', textDecoration: 'underline' }}
                    >
                      Want to upload a different PDF instead?
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '180px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', backgroundColor: 'rgba(0, 106, 98, 0.08)', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', alignSelf: 'flex-start' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>work</span>
                    Job Description
                  </div>
                  <textarea 
                    className={analysisStyles.jdTextarea}
                    style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '14px', resize: 'none', transition: 'border-color 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', width: '100%' }}
                    placeholder="Paste the full job description here..."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '8px' }}>
                    {jd.length} characters
                  </div>
                </div>

                <div style={{ marginTop: 'auto', width: '100%' }}>
                  <button 
                    onClick={handleAnalyze}
                    className={analysisStyles.actionBtnPrimary}
                    disabled={uploadMode === 'upload' && !uploadedResumeData}
                    style={{ 
                      opacity: (uploadMode === 'meridian' || uploadedResumeData) ? 1 : 0.5, 
                      padding: '14px', 
                      fontSize: '15px', 
                      width: '100%',
                      boxShadow: (uploadMode === 'meridian' || uploadedResumeData) ? '0 0 0 2px rgba(0, 106, 98, 0.2), 0 4px 16px rgba(0, 106, 98, 0.3)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>troubleshoot</span> 
                    Analyze Match
                  </button>
                  {atsMutation.isError && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span className="material-symbols-outlined" style={{ color: '#b91c1c', fontSize: '18px', marginTop: '2px' }}>error</span>
                      <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c', lineHeight: 1.4 }}>
                        {atsMutation.error instanceof Error ? ((atsMutation.error as any).response?.data?.error || (atsMutation.error as any).response?.data?.detail || atsMutation.error.message) : 'Analysis failed. Please try again.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {flowState === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%', paddingTop: '32px', paddingLeft: '8px', paddingRight: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ height: '24px', width: '33%', backgroundColor: '#D4E8E4', borderRadius: '4px', animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                   <div style={{ height: '10px', width: '66%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.6, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '100ms' }} />
                   <div style={{ height: '10px', width: '50%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.6, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '200ms' }} />
                </div>
                {[0, 1].map(i => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ height: '16px', width: '25%', backgroundColor: 'var(--color-primary)', borderRadius: '4px', opacity: 0.3, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 200}ms` }} />
                      <div style={{ height: '12px', width: '16%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.8, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '12px', borderLeft: '2px solid rgba(212, 232, 228, 0.5)' }}>
                       <div style={{ height: '10px', width: '92%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.7, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 200 + 100}ms` }} />
                       <div style={{ height: '10px', width: '85%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.7, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 200 + 200}ms` }} />
                       <div style={{ height: '10px', width: '88%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.7, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 200 + 300}ms` }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#D4E8E4', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: 'var(--color-primary)', width: '50%', animation: 'progress 1.5s ease-in-out infinite alternate' }} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.02em', animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                    {parsePdfMutation.isPending ? 'Extracting PDF Data...' : 'Checking ATS Compatibility...'}
                  </p>
                </div>
              </div>
            )}

            {(flowState === 'scored' || flowState === 'feedback') && atsResult && (
              <div className="flex flex-col gap-4">
                {flowState === 'scored' && (
                  <AtsScoreView 
                    atsResult={atsResult} 
                    onGetFeedback={handleGetFeedback} 
                    onReset={() => setFlowState('idle')} 
                    isCheckerPage={true} 
                  />
                )}
                {flowState === 'feedback' && critiqueResult && (
                  <CritiqueFeedbackView 
                    critiqueResult={critiqueResult} 
                    onBack={() => setFlowState('scored')} 
                    onApplyImprovement={injectImprovement} 
                  />
                )}
              </div>
            )}

          </div>
        </aside>
      </div>
    </div>
  );
}

