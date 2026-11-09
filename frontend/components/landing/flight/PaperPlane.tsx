import React from 'react';
import styles from './flight.module.css';

/**
 * Top-down paper plane pointing along +x. Banking is driven by the `--roll` CSS
 * variable set on the parent (-1 … 1): the wing on the inside of the turn
 * darkens and the outer one catches the light. `--shadow` sets the shadow's
 * distance (a stand-in for altitude).
 */
export default function PaperPlane() {
  return (
    <svg viewBox="0 0 64 64" className={styles.planeSvg}>
      {/* ground shadow */}
      <g className={styles.shadow}>
        <path d="M60 32 L6 9 L16 32 L6 55 Z" />
      </g>
      {/* left wing (top of screen when flying right) */}
      <path className={styles.wing} d="M60 32 L6 9 L16 32 Z" />
      <path className={`${styles.wingShade} ${styles.shadeLeft}`} d="M60 32 L6 9 L16 32 Z" />
      {/* right wing */}
      <path className={styles.wing} d="M60 32 L6 55 L16 32 Z" />
      <path className={`${styles.wingShade} ${styles.shadeRight}`} d="M60 32 L6 55 L16 32 Z" />
      {/* keel / centre fold */}
      <path className={styles.keel} d="M60 32 L16 32 L24 35.5 Z" />
      <path className={styles.fold} d="M60 32 L16 32" />
    </svg>
  );
}
