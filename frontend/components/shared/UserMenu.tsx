'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../../lib/store/userStore';
import { useResumeStore } from '../../lib/store/resumeStore';
import { toast } from './Toast';
import AuthModal from '../auth/AuthModal';
import styles from './UserMenu.module.css';

/**
 * Avatar + dropdown for the signed-in user (email, credits, shortcuts, sign out),
 * or a "Sign in" button (with the auth modal) when signed out.
 * Shared by the builder top nav and the app header.
 */
export default function UserMenu({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const firebaseUser = useUserStore((s) => s.firebaseUser);
  const profile = useUserStore((s) => s.profile);
  const signOut = useUserStore((s) => s.signOut);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    // Don't leave the previous user's data around: drop cached resumes and any open cloud document.
    queryClient.clear();
    useResumeStore.getState().loadLocalDraft();
    toast.success('Signed out');
  };

  if (!firebaseUser) {
    return (
      <>
        <button type="button" className="btn-secondary-nav" style={{ padding: '6px 14px' }} onClick={() => setShowAuth(true)}>
          Sign in
        </button>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      </>
    );
  }

  const initial = firebaseUser.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.avatar} ${size === 'sm' ? styles.sm : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${firebaseUser.email ?? 'your account'}`}
      >
        {initial}
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.identity}>
            <span className={styles.email}>{firebaseUser.email}</span>
            {profile && (
              <span className={styles.credits}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>bolt</span>
                {profile.is_premium || profile.is_admin ? 'Unlimited AI credits' : `${profile.ai_credits} AI credits left`}
              </span>
            )}
          </div>
          <Link href="/documents" role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
            <span className="material-symbols-outlined" aria-hidden="true">folder_open</span> My resumes
          </Link>
          <Link href="/checker" role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
            <span className="material-symbols-outlined" aria-hidden="true">troubleshoot</span> ATS checker
          </Link>
          <div className={styles.divider} />
          <button type="button" role="menuitem" className={`${styles.item} ${styles.danger}`} onClick={handleSignOut}>
            <span className="material-symbols-outlined" aria-hidden="true">logout</span> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
