'use client';
import React, { useEffect, useRef } from 'react';
import {
  FlightTrack,
  Waypoint,
  ScrollAnchor,
  angleDelta,
  arcForScroll,
  beziersToPathD,
  catmullRomToBeziers,
  expandLoops,
  normaliseAnchors,
} from '../../../lib/flight/track';
import PaperPlane from './PaperPlane';
import styles from './flight.module.css';

/**
 * The paper plane that flies down the landing page as you scroll.
 *
 * Route: built from `[data-wp]` marker elements placed inside the page sections
 * (so it adapts to the real layout) and re-measured on resize.
 *   data-wp="<order>"     position in the route
 *   data-anchor           plane is exactly here when this marker is at the focus line
 *   data-loop="<r>"       fly a loop-the-loop of radius r here (desktop only)
 *   data-mobile="skip"    ignore on small screens
 *   data-mobile-x="keep|left|right"  horizontal position on small screens (default: right edge)
 *   data-mobile-only      only used on small screens
 * The element with id="flight-destination" gets data-landed while the plane has landed on it.
 */

const FOCUS = 0.52; // where on screen (fraction of viewport height) the plane sits at an anchor
const MOBILE_BREAKPOINT = 768;

interface Built {
  track: FlightTrack;
  d: string;
  width: number;
  anchors: ScrollAnchor[];
  size: number;
}

function readWaypoints(root: HTMLElement, mobile: boolean): Waypoint[] {
  const rootRect = root.getBoundingClientRect();
  const width = root.clientWidth;
  const markers = Array.from(root.querySelectorAll<HTMLElement>('[data-wp]'))
    .filter((el) => (mobile ? el.dataset.mobile !== 'skip' : !el.hasAttribute('data-mobile-only')))
    .sort((a, b) => Number(a.dataset.wp) - Number(b.dataset.wp));

  let side = 0;
  return markers.map((el) => {
    const r = el.getBoundingClientRect();
    let x = r.left - rootRect.left + r.width / 2;
    const y = r.top - rootRect.top + r.height / 2;
    if (mobile) {
      const mode = el.dataset.mobileX ?? 'right';
      // Hug the edge, swaying slightly in and out so it still reads as flying, not sliding.
      side += 1;
      if (mode === 'right') x = width - (side % 2 ? 16 : 26);
      else if (mode === 'left') x = side % 2 ? 16 : 26;
    }
    // Keep the plane inside the viewport even where the layout leaves no side margin.
    const edge = mobile ? 14 : 28;
    x = Math.min(Math.max(x, edge), width - edge);
    return {
      x,
      y,
      anchor: el.hasAttribute('data-anchor'),
      loop: mobile ? 0 : Number(el.dataset.loop ?? 0),
    };
  });
}

function build(root: HTMLElement): Built | null {
  const mobile = window.innerWidth < MOBILE_BREAKPOINT;
  const waypoints = readWaypoints(root, mobile);
  if (waypoints.length < 2) return null;

  const { points, indexOf } = expandLoops(waypoints);
  const beziers = catmullRomToBeziers(points);
  const track = new FlightTrack(beziers);

  const rootTop = root.getBoundingClientRect().top + window.scrollY;
  const vh = window.innerHeight;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  const raw = waypoints
    .map((wp, i) => ({ wp, arc: track.pointArc[indexOf[i]] }))
    .filter(({ wp }) => wp.anchor)
    .map(({ wp, arc }) => ({ scroll: rootTop + wp.y - vh * FOCUS, arc }));

  return { track, d: beziersToPathD(beziers), width: root.clientWidth, anchors: normaliseAnchors(raw, maxScroll, track.length), size: mobile ? 26 : 46 };
}

export default function FlightPath() {
  const layerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const root = layer?.parentElement;
    const svg = svgRef.current;
    const trail = trailRef.current;
    const mask = maskRef.current;
    const plane = planeRef.current;
    if (!layer || !root || !svg || !trail || !mask || !plane) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const destination = () => document.getElementById('flight-destination');

    let built: Built | null = null;
    // Animation state
    let s = 0;
    let target = 0;
    let heading = 0;
    let roll = 0;
    let backwards = false;
    let lastT = 0;
    let raf = 0;
    let lastDashOffset = -1;

    const setLanded = (landed: boolean) => {
      const el = destination();
      if (!el) return;
      if (landed) el.setAttribute('data-landed', '');
      else el.removeAttribute('data-landed');
    };

    const render = (dt: number) => {
      if (!built) return;
      const { track, size, width } = built;

      // Glide towards the scroll target (exponential smoothing, frame-rate independent).
      const prevS = s;
      // Never trail too far behind (e.g. after jumping via a nav link), or the plane would be off screen.
      const maxLag = window.innerHeight * 0.9;
      if (target - s > maxLag) s = target - maxLag;
      else if (s - target > maxLag) s = target + maxLag;
      s += (target - s) * (1 - Math.exp(-dt * 4.2));
      if (Math.abs(target - s) < 0.05) s = target;
      const velocity = dt > 0 ? (s - prevS) / dt : 0;

      // Fly nose-first in the direction of travel: scrolling up turns the plane around.
      if (velocity < -20) backwards = true;
      else if (velocity > 20) backwards = false;

      const sample = track.sample(s);
      // Smooth curves bulge outward on tight corners; never let that carry the plane off screen.
      sample.x = Math.min(Math.max(sample.x, size / 2 + 2), width - size / 2 - 2);
      const desiredHeading = sample.heading + (backwards ? Math.PI : 0);
      heading += angleDelta(heading, desiredHeading) * (1 - Math.exp(-dt * 10));

      // Bank into turns: the tighter the turn, the more it rolls.
      const turn = backwards ? -sample.turn : sample.turn;
      const desiredRoll = Math.max(-1, Math.min(1, turn * 1.5));
      roll += (desiredRoll - roll) * (1 - Math.exp(-dt * 6));

      // Final approach: shrink into the destination button.
      const approach = Math.min(1, Math.max(0, (s - (track.length - 160)) / 160));
      const speedBoost = Math.min(Math.abs(velocity) / 2600, 0.14);
      const scale = (1 + speedBoost) * (1 - 0.6 * approach);
      const squash = 1 - 0.5 * Math.abs(roll);

      plane.style.transform =
        `translate3d(${sample.x - size / 2}px, ${sample.y - size / 2}px, 0) ` +
        `rotate(${heading}rad) scale(${scale}, ${scale * squash})`;
      plane.style.opacity = String(1 - 0.9 * approach * approach);
      plane.style.setProperty('--roll', roll.toFixed(3));
      plane.style.setProperty('--shadow', (6 + 10 * Math.abs(roll) + 18 * speedBoost).toFixed(1) + 'px');
      setLanded(approach > 0.97);

      // Contrail: reveal the dashed route up to just behind the tail.
      const drawn = Math.max(0, s - size * 0.45);
      const offset = track.length - drawn;
      if (Math.abs(offset - lastDashOffset) > 0.5) {
        mask.style.strokeDashoffset = String(offset);
        lastDashOffset = offset;
      }
    };

    const loop = (t: number) => {
      const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 1 / 60;
      lastT = t;
      const prevHeading = heading;
      const prevRoll = roll;
      render(dt);
      const settled =
        s === target && Math.abs(angleDelta(prevHeading, heading)) < 1e-4 && Math.abs(prevRoll - roll) < 1e-4;
      raf = settled ? 0 : requestAnimationFrame(loop);
      if (!raf) lastT = 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      if (!built || reducedMotion.matches) return; // reduced motion: the plane stays parked
      target = arcForScroll(window.scrollY, built.anchors);
      kick();
    };

    const rebuild = () => {
      built = build(root);
      if (!built) {
        layer.style.display = 'none';
        return;
      }
      layer.style.display = '';
      const { track, d } = built;
      const w = root.clientWidth;
      const h = root.scrollHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      trail.setAttribute('d', d);
      mask.setAttribute('d', d);
      mask.style.strokeDasharray = `${track.length} ${track.length}`;
      lastDashOffset = -1;
      plane.style.width = plane.style.height = `${built.size}px`;

      target = arcForScroll(window.scrollY, built.anchors);
      if (reducedMotion.matches) {
        // No flight: show the whole route and park the plane at the start.
        s = 0;
        mask.style.strokeDashoffset = '0';
        lastDashOffset = 0;
        const start = track.sample(0);
        heading = start.heading;
        plane.style.transform = `translate3d(${start.x - built.size / 2}px, ${start.y - built.size / 2}px, 0) rotate(${heading}rad)`;
        return;
      }
      if (s === 0 && heading === 0) {
        // First build: start where the scroll position says, facing along the route.
        s = target;
        heading = track.sample(s).heading;
      }
      s = Math.min(s, track.length);
      render(0);
      kick();
    };

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRebuild = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 120);
    };

    rebuild();
    // Layout shifts after fonts/images load would move the markers.
    document.fonts?.ready.then(scheduleRebuild).catch(() => {});
    window.addEventListener('load', scheduleRebuild);
    const observer = new ResizeObserver(scheduleRebuild);
    observer.observe(root);
    window.addEventListener('scroll', onScroll, { passive: true });
    reducedMotion.addEventListener('change', rebuild);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('load', scheduleRebuild);
      reducedMotion.removeEventListener('change', rebuild);
      setLanded(false);
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden="true">
      <svg ref={svgRef} className={styles.svg}>
        <defs>
          <mask id="flight-trail-mask" maskUnits="userSpaceOnUse">
            <path ref={maskRef} className={styles.maskPath} />
          </mask>
        </defs>
        <path ref={trailRef} className={styles.trail} mask="url(#flight-trail-mask)" />
      </svg>
      <div ref={planeRef} className={styles.plane}>
        <PaperPlane />
      </div>
    </div>
  );
}
