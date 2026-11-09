import React from 'react';
import { Joyride, Step, STATUS, EventData } from 'react-joyride';

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

export default function OnboardingTour({ run, onFinish }: OnboardingTourProps) {
  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: 'Welcome to Meridian Builder ✨',
      content: 'This is where you craft your professional story. Let’s take a quick tour so you know where everything is.',
      skipBeacon: true,
    },
    {
      target: '.tour-documents-link',
      placement: 'bottom',
      title: 'Your Documents',
      content: 'All your saved resumes live here. You can manage them in the Documents section.',
      skipBeacon: true,
    },
    {
      target: '.tour-import-btn',
      placement: 'bottom',
      title: 'Import an Existing Resume',
      content: 'Already have a PDF? Upload it here and we will extract the details for you automatically.',
      skipBeacon: true,
    },
    {
      target: '.tour-left-sidebar',
      placement: 'right',
      title: 'Fill Your Details',
      content: 'The left panel is your workspace. Add, edit, and organize all your resume sections here.',
      skipBeacon: true,
    },
    {
      target: '.tour-main-canvas',
      placement: 'center',
      title: 'Live Preview',
      content: 'Your resume updates instantly in the center canvas. You can zoom in and out using Ctrl+Scroll.',
      skipBeacon: true,
    },
    {
      target: '.tour-analysis-panel',
      placement: 'left',
      title: 'AI Analysis',
      content: 'The right panel is your AI assistant. Click "Analyze" to get ATS scoring and tailoring advice.',
      skipBeacon: true,
    },
    {
      target: '.tour-export-btn',
      placement: 'bottom',
      title: 'Export & Share',
      content: 'When your resume is perfect, click Export to download a polished PDF.',
      skipBeacon: true,
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      onEvent={handleJoyrideCallback}
      options={{
        primaryColor: '#64B6AC',
        textColor: '#1C2B28',
        zIndex: 10000,
        showProgress: true,
      }}
      styles={{
        tooltip: { fontFamily: 'var(--font-sans)', borderRadius: '12px' },
        buttonPrimary: { borderRadius: '6px', backgroundColor: '#64B6AC' },
        buttonBack: { color: '#4A6260' },
      }}
    />
  );
}
