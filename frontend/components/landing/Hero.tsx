import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Wp from './Wp';
import styles from './landing.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <svg className={styles.meridians} viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
        {/* faint lines of longitude — the "meridians" */}
        <path d="M150 0 C 60 250, 60 450, 150 700" />
        <path d="M420 0 C 360 250, 360 450, 420 700" />
        <path d="M780 0 C 840 250, 840 450, 780 700" />
        <path d="M1050 0 C 1140 250, 1140 450, 1050 700" />
      </svg>

      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Resume builder · ATS checker · AI feedback</p>
          <h1 className={styles.heroTitle}>
            Your resume, <em>cleared for takeoff.</em>
          </h1>
          <p className={styles.heroLead}>
            Write it with the page in front of you, check it against the job you actually want, and fix what&apos;s
            holding it back — before a recruiter ever reads it.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/builder" className="btn-primary-hero">Start building — it&apos;s free</Link>
            <Link href="/checker" className="btn-ghost-hero">Check a resume I already have</Link>
          </div>
          <p className={styles.heroNote}>No sign-up to start writing. Create an account to save, export and use AI.</p>

          <div className={styles.runway}>
            <span className={styles.runwayLine} />
            <span className={styles.runwayLabel}>Scroll to take off</span>
            <Wp n={0} anchor left="18px" top="50%" mobile="keep" />
            {/* phones: taxi along the runway before turning down the page */}
            <Wp n={0.5} left="190px" top="50%" mobile="keep" mobileOnly />
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroPage}>
            <Image
              src="/template-modern-v2.png"
              alt="A resume built with Meridian's Modern template"
              width={1191}
              height={1684}
              priority
              sizes="(min-width: 900px) 380px, 80vw"
            />
          </div>
          <div className={`${styles.chip} ${styles.chipScore}`}>
            <span className={styles.chipDot} /> ATS score <strong>86</strong>
          </div>
          <div className={`${styles.chip} ${styles.chipKeywords}`}>
            <span className="material-symbols-outlined" aria-hidden="true">key</span> 2 keywords to add
          </div>
          <Wp n={1} left="18%" top="112%" mobile="skip" />
          <Wp n={2} left="108%" top="34%" mobile="skip" />
        </div>
      </div>
    </section>
  );
}
