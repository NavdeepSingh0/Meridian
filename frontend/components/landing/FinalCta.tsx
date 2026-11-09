import React from 'react';
import Link from 'next/link';
import Wp from './Wp';
import styles from './landing.module.css';

/** The boarding pass. The paper plane's flight ends by landing on the button. */
export default function FinalCta() {
  return (
    <section className={styles.final}>
      <div className={styles.container}>
        <div className={`${styles.pass} ${styles.reveal}`}>
          <div className={styles.passMain}>
            <p className={styles.passKicker}>Boarding pass</p>
            <h2 className={styles.passTitle}>
              Ready when <em>you are.</em>
            </h2>
            <dl className={styles.passFields}>
              <div><dt>Passenger</dt><dd>You</dd></div>
              <div><dt>Flight</dt><dd>MER 001</dd></div>
              <div><dt>From</dt><dd>A blank page</dd></div>
              <div><dt>To</dt><dd>Your next role</dd></div>
            </dl>
          </div>
          <div className={styles.passStub}>
            <p className={styles.passStubLabel}>Gate</p>
            <p className={styles.passStubValue}>Builder</p>
            <Link href="/builder" id="flight-destination" className={styles.passBtn}>
              Start building
              {/* phones: come in level from the right-hand edge rather than across the pass */}
              <Wp n={12.5} left="100%" top="-10%" mobile="right" mobileOnly />
              <Wp n={13} anchor left="50%" top="50%" mobile="keep" />
            </Link>
            <p className={styles.passFine}>Free to start · no card needed</p>
          </div>
          <Wp n={12} left="112%" top="50%" mobile="skip" />
        </div>
      </div>
    </section>
  );
}
