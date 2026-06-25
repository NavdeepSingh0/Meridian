'use client';
import { useState, useEffect } from 'react';

export default function MobileWarningPopup() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Only check after component is mounted to avoid hydration mismatch
    const checkMobile = () => {
      // Check if screen width is less than md breakpoint (768px in Tailwind)
      if (window.innerWidth < 768) {
        // Also check if they haven't dismissed it this session
        const dismissed = sessionStorage.getItem('mobileWarningDismissed');
        if (!dismissed) {
          setIsOpen(true);
        }
      } else {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('mobileWarningDismissed', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
          <span className="material-symbols-outlined text-3xl text-emerald-600">devices</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">View on Desktop</h3>
        <p className="text-gray-500 mb-6 text-sm">
          Meridian is currently optimized for desktop screens. The mobile experience is still lacking, so for the best experience, please use a desktop browser.
        </p>
        <button
          onClick={handleDismiss}
          className="w-full inline-flex justify-center rounded-xl border border-transparent bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-colors"
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
}
