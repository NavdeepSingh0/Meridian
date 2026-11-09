'use client';
import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import styles from './PdfUploadZone.module.css';

export const MAX_PDF_BYTES = 5 * 1024 * 1024;

interface PdfUploadZoneProps {
  onFileSelect: (file: File) => void;
  onReject?: (message: string) => void;
  isLoading?: boolean;
  /** Name of an already-uploaded file, shown instead of the prompt. */
  fileName?: string | null;
}

function rejectionMessage(rejections: FileRejection[]): string {
  const code = rejections[0]?.errors[0]?.code;
  if (code === 'file-too-large') return 'That PDF is larger than 5 MB.';
  if (code === 'file-invalid-type') return 'Please upload a PDF file.';
  if (code === 'too-many-files') return 'Please upload one file at a time.';
  return "That file couldn't be used. Please upload a PDF under 5 MB.";
}

export default function PdfUploadZone({ onFileSelect, onReject, isLoading = false, fileName }: PdfUploadZoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) onReject?.(rejectionMessage(rejected));
      else if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect, onReject],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: MAX_PDF_BYTES,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps({
        className: `${styles.zone} ${isDragActive ? styles.active : ''} ${isLoading ? styles.loading : ''}`,
        'aria-label': 'Upload a PDF resume',
      })}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <>
          <span className={`material-symbols-outlined ${styles.icon} ${styles.spin}`} aria-hidden="true">progress_activity</span>
          <p className={styles.title}>Reading your resume…</p>
          <p className={styles.hint}>Extracting your experience. This takes a few seconds.</p>
        </>
      ) : fileName ? (
        <>
          <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">task</span>
          <p className={styles.title}>{fileName}</p>
          <p className={styles.hint}>Drop or click to replace</p>
        </>
      ) : (
        <>
          <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">upload_file</span>
          <p className={styles.title}>{isDragActive ? 'Drop to upload' : 'Drop your PDF resume here'}</p>
          <p className={styles.hint}>or click to browse · text-based PDF, up to 5 MB</p>
        </>
      )}
    </div>
  );
}
