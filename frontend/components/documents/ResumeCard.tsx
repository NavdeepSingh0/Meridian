'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ResumeThumbnail from './ResumeThumbnail';
import { SavedResume } from '../../lib/api/resumeApi';
import { relativeTime } from '../../lib/utils/relativeTime';
import styles from './ResumeCard.module.css';

interface ResumeCardProps {
  resume: SavedResume;
  onRename: (id: number, title: string) => void;
  onDuplicate: (resume: SavedResume) => void;
  onDelete: (resume: SavedResume) => void;
}

export default function ResumeCard({ resume, onRename, onDuplicate, onDelete }: ResumeCardProps) {
  const pending = resume.id < 0; // optimistic copy that the server hasn't confirmed yet
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(resume.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const startEditing = () => {
    if (pending) return;
    setDraft(resume.title);
    setEditing(true);
    setMenuOpen(false);
  };

  const commit = () => {
    setEditing(false);
    const title = draft.trim();
    if (title && title !== resume.title) onRename(resume.id, title);
  };

  const href = `/builder?id=${resume.id}`;
  const title = resume.title || 'Untitled';

  return (
    <div ref={rootRef} className={`${styles.card} ${pending ? styles.pending : ''}`}>
      {pending ? (
        <div className={styles.thumb}><ResumeThumbnail data={resume.document_data} templateId={resume.template_id} /></div>
      ) : (
        <Link href={href} className={styles.thumb} aria-label={`Open ${title}`}>
          <ResumeThumbnail data={resume.document_data} templateId={resume.template_id} />
        </Link>
      )}

      <div className={styles.body}>
        <div className={styles.text}>
          {editing ? (
            <input
              ref={inputRef}
              className={styles.titleInput}
              value={draft}
              maxLength={100}
              aria-label="Resume title"
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
          ) : (
            <button type="button" className={styles.title} onClick={startEditing} title="Click to rename" disabled={pending}>
              {title}
            </button>
          )}
          <p className={styles.meta}>
            {pending ? 'Creating copy…' : `Edited ${relativeTime(resume.updated_at)}`}
          </p>
        </div>

        <div className={styles.menuWrap}>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Actions for ${title}`}
            onClick={() => setMenuOpen((o) => !o)}
            disabled={pending}
          >
            <span className="material-symbols-outlined" aria-hidden="true">more_horiz</span>
          </button>

          {menuOpen && (
            <div className={styles.menu} role="menu">
              <Link href={href} role="menuitem" className={styles.menuItem}>
                <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span> Open
              </Link>
              <button type="button" role="menuitem" className={styles.menuItem} onClick={startEditing}>
                <span className="material-symbols-outlined" aria-hidden="true">edit</span> Rename
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate(resume);
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">content_copy</span> Duplicate
              </button>
              <button
                type="button"
                role="menuitem"
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(resume);
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">delete</span> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
