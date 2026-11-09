import React from 'react';
import styles from './landing.module.css';

interface WpProps {
  /** Order of this point along the flight route. */
  n: number;
  /** Plane is exactly here when this point reaches the focus line of the viewport. */
  anchor?: boolean;
  /** Radius of a loop-the-loop flown at this point (desktop only). */
  loop?: number;
  /** Position relative to the nearest positioned ancestor. */
  left: string;
  top: string;
  mobile?: 'skip' | 'keep' | 'left' | 'right';
  /** Only use this point on small screens. */
  mobileOnly?: boolean;
}

/** An invisible waypoint marker for the paper plane's flight path (read by FlightPath). */
export default function Wp({ n, anchor, loop, left, top, mobile, mobileOnly }: WpProps) {
  return (
    <span
      className={styles.wp}
      style={{ left, top }}
      data-wp={n}
      data-anchor={anchor ? '' : undefined}
      data-loop={loop || undefined}
      data-mobile={mobile === 'skip' ? 'skip' : undefined}
      data-mobile-x={mobile && mobile !== 'skip' ? mobile : undefined}
      data-mobile-only={mobileOnly ? '' : undefined}
      aria-hidden="true"
    />
  );
}
