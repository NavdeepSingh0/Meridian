/**
 * Flight-path math for the landing page paper plane. Pure functions, no DOM.
 *
 * Pipeline:
 *   waypoints ──expandLoops──▶ points ──centripetal Catmull-Rom──▶ cubic Béziers
 *            ──sample──▶ arc-length table (FlightTrack) ──▶ position / heading / turn at any distance
 *
 * Scroll is mapped to distance along the track through "anchor" waypoints: when an
 * anchor's element sits at the viewport's focus line, the plane is exactly at that anchor.
 * That keeps the plane on screen however curvy the route between anchors is.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Waypoint extends Point {
  /** Plane must be here when this point is at the viewport focus line. */
  anchor: boolean;
  /** Radius of a loop-the-loop flown at this waypoint (0 / undefined = none). */
  loop?: number;
}

export interface Bezier {
  p0: Point;
  c1: Point;
  c2: Point;
  p1: Point;
}

// ── Loops ────────────────────────────────────────────────────────────────────

/**
 * Replace each looping waypoint with a ring of points so the spline flies a
 * loop there. The loop climbs (towards the top of the page) and turns in the
 * direction of travel, then exits a little further along. Returns the expanded
 * points plus, for each input waypoint, the index of its point in the output.
 */
export function expandLoops(waypoints: Waypoint[]): { points: Point[]; indexOf: number[] } {
  const points: Point[] = [];
  const indexOf: number[] = [];

  waypoints.forEach((wp, i) => {
    indexOf.push(points.length);
    points.push({ x: wp.x, y: wp.y });
    const r = wp.loop ?? 0;
    if (r <= 0) return;

    const prev = waypoints[i - 1] ?? wp;
    const next = waypoints[i + 1] ?? wp;
    const dir = Math.sign(next.x - prev.x) || 1; // fly the loop in the direction of travel
    points.push(
      { x: wp.x + dir * r, y: wp.y - r },
      { x: wp.x, y: wp.y - 2 * r },
      { x: wp.x - dir * r, y: wp.y - r },
      { x: wp.x + dir * r * 0.4, y: wp.y + r * 0.08 },
    );
  });

  return { points, indexOf };
}

// ── Centripetal Catmull-Rom → cubic Bézier ──────────────────────────────────

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Convert a centripetal Catmull-Rom spline (alpha = 0.5) through `points` to cubic
 * Béziers. Centripetal parameterisation never overshoots or forms cusps when the
 * points are unevenly spaced — essential when tight loops sit next to long legs.
 */
export function catmullRomToBeziers(points: Point[], alpha = 0.5): Bezier[] {
  const out: Bezier[] = [];
  if (points.length < 2) return out;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const d1 = Math.pow(dist(p0, p1), alpha);
    const d2 = Math.pow(dist(p1, p2), alpha);
    const d3 = Math.pow(dist(p2, p3), alpha);

    let c1: Point;
    if (d1 < 1e-6) {
      c1 = { x: p1.x + (p2.x - p1.x) / 3, y: p1.y + (p2.y - p1.y) / 3 };
    } else {
      const a = d1 * d1;
      const b = d2 * d2;
      const n = 2 * a + 3 * d1 * d2 + b;
      const m = 3 * d1 * (d1 + d2);
      c1 = { x: (a * p2.x - b * p0.x + n * p1.x) / m, y: (a * p2.y - b * p0.y + n * p1.y) / m };
    }

    let c2: Point;
    if (d3 < 1e-6) {
      c2 = { x: p2.x - (p2.x - p1.x) / 3, y: p2.y - (p2.y - p1.y) / 3 };
    } else {
      const a = d3 * d3;
      const b = d2 * d2;
      const n = 2 * a + 3 * d3 * d2 + b;
      const m = 3 * d3 * (d3 + d2);
      c2 = { x: (a * p1.x - b * p3.x + n * p2.x) / m, y: (a * p1.y - b * p3.y + n * p2.y) / m };
    }

    out.push({ p0: p1, c1, c2, p1: p2 });
  }
  return out;
}

export function beziersToPathD(beziers: Bezier[]): string {
  if (beziers.length === 0) return '';
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(beziers[0].p0.x)} ${f(beziers[0].p0.y)}`;
  for (const b of beziers) {
    d += ` C ${f(b.c1.x)} ${f(b.c1.y)} ${f(b.c2.x)} ${f(b.c2.y)} ${f(b.p1.x)} ${f(b.p1.y)}`;
  }
  return d;
}

function bezierAt(b: Bezier, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const c = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * b.p0.x + c * b.c1.x + d * b.c2.x + e * b.p1.x,
    y: a * b.p0.y + c * b.c1.y + d * b.c2.y + e * b.p1.y,
  };
}

// ── Arc-length track ────────────────────────────────────────────────────────

export interface TrackSample extends Point {
  /** Heading in radians (0 = +x, clockwise positive since SVG y points down). */
  heading: number;
  /** Signed heading change over a short window around this point (radians); drives banking. */
  turn: number;
}

const normAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export class FlightTrack {
  readonly xs: Float64Array;
  readonly ys: Float64Array;
  readonly arc: Float64Array;
  readonly length: number;
  /** Arc length at the start of each Bézier segment (= at each spline point). */
  readonly pointArc: number[];

  constructor(beziers: Bezier[], samplesPerSegment = 48) {
    // Sample 0 is the very first point; each segment then adds `samplesPerSegment` samples,
    // so segment `si` starts at sample index si * samplesPerSegment.
    const n = beziers.length * samplesPerSegment + 1;
    this.xs = new Float64Array(n);
    this.ys = new Float64Array(n);
    this.arc = new Float64Array(n);

    let k = 0;
    let total = 0;
    let prev: Point | null = null;
    beziers.forEach((b, si) => {
      for (let j = si === 0 ? 0 : 1; j <= samplesPerSegment; j++) {
        const p = bezierAt(b, j / samplesPerSegment);
        if (prev) total += dist(prev, p);
        this.xs[k] = p.x;
        this.ys[k] = p.y;
        this.arc[k] = total;
        prev = p;
        k++;
      }
    });

    this.pointArc = [...beziers.map((_, si) => this.arc[si * samplesPerSegment]), total];
    this.length = total;
  }

  /** Index of the last sample with arc <= s (binary search). */
  private indexAt(s: number): number {
    let lo = 0;
    let hi = this.arc.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.arc[mid] <= s) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  pointAt(s: number): Point {
    const c = Math.min(Math.max(s, 0), this.length);
    const i = this.indexAt(c);
    const j = Math.min(i + 1, this.arc.length - 1);
    const span = this.arc[j] - this.arc[i];
    const t = span > 0 ? (c - this.arc[i]) / span : 0;
    return { x: this.xs[i] + (this.xs[j] - this.xs[i]) * t, y: this.ys[i] + (this.ys[j] - this.ys[i]) * t };
  }

  headingAt(s: number, window = 6): number {
    const a = this.pointAt(s - window);
    const b = this.pointAt(s + window);
    if (a.x === b.x && a.y === b.y) return 0;
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  sample(s: number, turnWindow = 40): TrackSample {
    const p = this.pointAt(s);
    const heading = this.headingAt(s);
    const turn = normAngle(this.headingAt(s + turnWindow) - this.headingAt(s - turnWindow));
    return { ...p, heading, turn };
  }
}

// ── Scroll → distance along the track ───────────────────────────────────────

export interface ScrollAnchor {
  /** window.scrollY at which the plane should be at `arc`. */
  scroll: number;
  arc: number;
}

/**
 * Make anchors usable for interpolation: sorted, strictly increasing in both
 * scroll and arc, starting at scroll 0 / arc 0 and ending at maxScroll / track end.
 */
export function normaliseAnchors(raw: ScrollAnchor[], maxScroll: number, trackLength: number): ScrollAnchor[] {
  const out: ScrollAnchor[] = [{ scroll: 0, arc: 0 }];
  for (const a of raw) {
    const last = out[out.length - 1];
    if (a.arc <= last.arc) continue;
    const scroll = Math.min(Math.max(a.scroll, last.scroll + 1), maxScroll);
    if (scroll <= last.scroll) continue;
    out.push({ scroll, arc: a.arc });
  }
  const last = out[out.length - 1];
  if (last.arc < trackLength) {
    out.push({ scroll: Math.max(maxScroll, last.scroll + 1), arc: trackLength });
  }
  return out;
}

/**
 * Distance along the track for a scroll position. Within each leg the motion is
 * eased (partly smoothstepped) so the plane lingers near a section while you read
 * it and picks up speed between sections.
 */
export function arcForScroll(scroll: number, anchors: ScrollAnchor[], linger = 0.45): number {
  if (anchors.length === 0) return 0;
  if (scroll <= anchors[0].scroll) return anchors[0].arc;
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    if (scroll <= b.scroll) {
      const t = (scroll - a.scroll) / (b.scroll - a.scroll);
      const smooth = t * t * (3 - 2 * t);
      const eased = (1 - linger) * t + linger * smooth;
      return a.arc + (b.arc - a.arc) * eased;
    }
  }
  return anchors[anchors.length - 1].arc;
}

/** Shortest signed difference between two angles (radians). */
export function angleDelta(from: number, to: number): number {
  return normAngle(to - from);
}
