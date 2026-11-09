'use client';
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../../lib/firebase/client';
import Modal from '../shared/Modal';
import { toast } from '../shared/Toast';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Optional context shown under the title, e.g. "Sign in to export your resume as a PDF." */
  reason?: string;
}

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

function authMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  return (code && AUTH_ERRORS[code]) || 'Something went wrong signing you in. Please try again.';
}

export default function AuthModal({ isOpen, onClose, onSuccess, reason }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setPassword('');
      onSuccess();
    } catch (err) {
      console.error('Firebase auth error:', err);
      setError(authMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError('Enter your email above, then click "Forgot password?".');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError(null);
      toast.success(`Password reset email sent to ${email}`);
    } catch (err) {
      setError(authMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSignUp ? 'Create your account' : 'Welcome back'}
      description={reason ?? 'Sign in to save your resumes to the cloud, export PDFs and use AI tools.'}
    >
      {error && <div className={styles.error} role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="auth-email" className={styles.label}>Email</label>
          <input
            id="auth-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="auth-password" className={styles.label}>Password</label>
          <input
            id="auth-password"
            className={styles.input}
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
          />
        </div>

        {!isSignUp && (
          <button type="button" className={styles.linkBtn} onClick={handleReset}>
            Forgot password?
          </button>
        )}

        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className={styles.switch}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => {
            setIsSignUp((v) => !v);
            setError(null);
          }}
        >
          {isSignUp ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </Modal>
  );
}
