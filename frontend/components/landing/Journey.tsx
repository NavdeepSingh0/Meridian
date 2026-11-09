import React from 'react';
import Image from 'next/image';
import Wp from './Wp';
import styles from './landing.module.css';

interface LegProps {
  code: string;
  index: string;
  title: React.ReactNode;
  lead: string;
  points: string[];
  visual: React.ReactNode;
  reverse?: boolean;
  id?: string;
  children?: React.ReactNode; // waypoint markers
}

function Leg({ code, index, title, lead, points, visual, reverse, id, children }: LegProps) {
  return (
    <section id={id} className={styles.leg}>
      <div className={`${styles.container} ${styles.legGrid} ${reverse ? styles.legReverse : ''}`}>
        <div className={`${styles.legCopy} ${styles.reveal}`}>
          <p className={styles.legTag}>
            <span className={styles.legCode}>{code}</span> Leg {index}
          </p>
          <h2 className={styles.legTitle}>{title}</h2>
          <p className={styles.legLead}>{lead}</p>
          <ul className={styles.legPoints}>
            {points.map((p) => (
              <li key={p}>
                <span className="material-symbols-outlined" aria-hidden="true">check</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className={`${styles.legVisual} ${styles.reveal}`}>{visual}</div>
        {children}
      </div>
    </section>
  );
}

// ── Visuals (illustrative UI, built in HTML so they stay crisp and match the app) ──

function TemplatesVisual() {
  return (
    <div className={styles.fan}>
      {[
        { src: '/template-classic-v2.png', name: 'Classic' },
        { src: '/template-minimal-v2.png', name: 'Minimal' },
        { src: '/template-modern-v2.png', name: 'Modern' },
      ].map((t) => (
        <figure key={t.name} className={styles.fanCard}>
          <Image src={t.src} alt={`${t.name} template`} width={1191} height={1684} sizes="220px" />
          <figcaption>{t.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function AtsVisual() {
  return (
    <div className={styles.mockCard}>
      <p className={styles.mockLabel}>Example result</p>
      <div className={styles.scoreRow}>
        <div className={styles.ring} style={{ '--p': 0.78 } as React.CSSProperties}>
          <span>78</span>
        </div>
        <div>
          <p className={styles.mockTitle}>ATS match</p>
          <p className={styles.mockText}>Readable structure. A few terms from the job post are missing.</p>
        </div>
      </div>
      <p className={styles.mockSub}>In the job post and on your resume</p>
      <div className={styles.chips}>
        {['React', 'TypeScript', 'REST APIs', 'Testing'].map((k) => (
          <span key={k} className={styles.kwHit}>
            <span className="material-symbols-outlined" aria-hidden="true">check</span>
            {k}
          </span>
        ))}
      </div>
      <p className={styles.mockSub}>Missing from your resume</p>
      <div className={styles.chips}>
        {['GraphQL', 'CI/CD'].map((k) => (
          <span key={k} className={styles.kwMiss}>{k}</span>
        ))}
      </div>
    </div>
  );
}

function RefineVisual() {
  return (
    <div className={styles.mockCard}>
      <div className={styles.critiqueHead}>
        <span className={styles.critiqueNum}>1</span>
        <div>
          <p className={styles.mockTitle}>Experience</p>
          <p className={styles.mockText}>Section score 64 / 100</p>
        </div>
      </div>
      <p className={styles.suggestion}>Lead with the outcome and quantify it where you can.</p>
      <div className={styles.beforeAfter}>
        <p className={styles.before}>Responsible for the checkout page.</p>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_downward</span>
        <p className={styles.after}>Rebuilt the checkout flow, cutting drop-off by 18% in one quarter.</p>
      </div>
      <div className={styles.mockActions}>
        <span className={styles.mockBtn}>
          <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span> Apply suggestion
        </span>
        <span className={styles.mockGhost}>
          <span className="material-symbols-outlined" aria-hidden="true">undo</span> Undo
        </span>
      </div>
    </div>
  );
}

function SendVisual() {
  return (
    <div className={styles.docStack}>
      {[
        { t: 'Frontend Engineer — fintech', e: 'Edited 2 hours ago' },
        { t: 'Product Engineer', e: 'Edited yesterday' },
        { t: 'General', e: 'Edited last week' },
      ].map((d, i) => (
        <div key={d.t} className={styles.docRow} style={{ '--i': i } as React.CSSProperties}>
          <span className="material-symbols-outlined" aria-hidden="true">description</span>
          <div>
            <p className={styles.mockTitle}>{d.t}</p>
            <p className={styles.mockText}>{d.e}</p>
          </div>
          {i === 0 && (
            <span className={styles.pdfPill}>
              <span className="material-symbols-outlined" aria-hidden="true">download</span> PDF
            </span>
          )}
        </div>
      ))}
      <p className={styles.savedPill}>
        <span className="material-symbols-outlined" aria-hidden="true">cloud_done</span> Saved to cloud
      </p>
    </div>
  );
}

// ── The journey ──────────────────────────────────────────────────────────────

export default function Journey() {
  return (
    <div id="journey">
      <Leg
        id="templates"
        code="WRT"
        index="01"
        title={<>Write with the page <em>right in front of you.</em></>}
        lead="Every change shows up on the page as you type, so you're never guessing what the recruiter will see."
        points={[
          'Live preview in three templates — Classic, Modern and Minimal',
          'Adjust font size and margins until it fits on the page',
          'Already have a resume? Import the PDF and pick up from there',
        ]}
        visual={<TemplatesVisual />}
      >
        <Wp n={3} anchor left="102%" top="22%" />
        <Wp n={4} left="62%" top="112%" mobile="skip" />
      </Leg>

      <Leg
        reverse
        code="CHK"
        index="02"
        title={<>See your resume <em>the way an ATS does.</em></>}
        lead="Applicant tracking systems filter resumes before a person does. Find out how yours reads — and what it's missing for this job."
        points={[
          'An overall ATS score with a plain-English summary',
          'Paste a job description to see matched and missing keywords',
          'Works on a resume you upload, too — no rebuilding required',
        ]}
        visual={<AtsVisual />}
      >
        <Wp n={5} anchor left="-3%" top="30%" />
        <Wp n={6} left="22%" top="114%" mobile="skip" />
      </Leg>

      <section className={styles.interlude}>
        <div className={`${styles.container} ${styles.interludeInner}`}>
          <p className={`${styles.interludeText} ${styles.reveal}`}>
            Recruiters skim. <em>Make the first few seconds count.</em>
          </p>
          <Wp n={7} anchor loop={88} left="80%" top="72%" />
        </div>
      </section>

      <Leg
        code="RFN"
        index="03"
        title={<>Feedback you can act on — <em>in one click.</em></>}
        lead="A section-by-section critique tells you what's working and what isn't. Then it helps you fix it."
        points={[
          'Specific suggestions for each section, not generic tips',
          'Apply a suggestion and the section is rewritten for you — undo if you prefer yours',
          'Draft a summary or sharpen a bullet point with AI writing help',
        ]}
        visual={<RefineVisual />}
      >
        <Wp n={8} anchor left="102%" top="30%" />
        <Wp n={9} left="84%" top="116%" mobile="skip" />
      </Leg>

      <Leg
        reverse
        code="SND"
        index="04"
        title={<>Send it off <em>looking its best.</em></>}
        lead="Export a clean, print-ready PDF in the template you chose, and keep a tailored version for every role you apply to."
        points={[
          'One-click PDF export with ATS-safe formatting',
          'Your resumes are saved to your account and autosave as you edit',
          'Duplicate a resume to tailor it for a new application',
        ]}
        visual={<SendVisual />}
      >
        <Wp n={9.5} left="-3%" top="-22%" mobile="skip" />
        <Wp n={10} anchor left="-3%" top="36%" />
        <Wp n={11} left="-3%" top="112%" mobile="skip" />
        <Wp n={11.5} left="56%" top="138%" mobile="skip" />
      </Leg>
    </div>
  );
}
