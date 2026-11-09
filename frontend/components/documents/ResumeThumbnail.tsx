'use client';
import React, { memo, useEffect, useRef, useState } from 'react';
import ClassicTemplate from '../templates/ClassicTemplate';
import ModernTemplate from '../templates/ModernTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';
import { ResumeData } from '../../lib/types/resume';
import styles from './ResumeThumbnail.module.css';

const PAGE_WIDTH = 794; // A4 at 96dpi — the width the templates are laid out for

/**
 * A read-only, scaled-down render of a resume using the real template.
 * The template is laid out at full A4 width and shrunk with CSS transform to
 * fit whatever width the card gives it.
 */
function ResumeThumbnailBase({ data, templateId }: { data: ResumeData; templateId: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / PAGE_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={styles.frame} aria-hidden="true">
      <div
        className={styles.page}
        style={{ transform: `scale(${scale})`, '--doc-font-size': '10pt', '--doc-margin': '48px' } as React.CSSProperties}
        // Non-interactive preview: keep it out of tab order and away from pointer events.
        inert
      >
        {templateId === 'classic' && <ClassicTemplate data={data} />}
        {templateId === 'minimal' && <MinimalTemplate data={data} />}
        {templateId !== 'classic' && templateId !== 'minimal' && <ModernTemplate data={data} />}
      </div>
    </div>
  );
}

export default memo(ResumeThumbnailBase);
