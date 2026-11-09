import { describe, it, expect } from 'vitest';
import {
  expandLoops,
  catmullRomToBeziers,
  beziersToPathD,
  FlightTrack,
  normaliseAnchors,
  arcForScroll,
  angleDelta,
  Waypoint,
} from './track';

const line: Waypoint[] = [
  { x: 0, y: 0, anchor: true },
  { x: 100, y: 0, anchor: true },
  { x: 200, y: 0, anchor: true },
];

describe('catmullRomToBeziers', () => {
  it('passes through every point', () => {
    const pts = [{ x: 0, y: 0 }, { x: 50, y: 80 }, { x: 300, y: 10 }, { x: 310, y: 400 }];
    const bz = catmullRomToBeziers(pts);
    expect(bz).toHaveLength(3);
    bz.forEach((b, i) => {
      expect(b.p0).toEqual(pts[i]);
      expect(b.p1).toEqual(pts[i + 1]);
    });
  });

  it('handles duplicate points without producing NaN', () => {
    const bz = catmullRomToBeziers([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 10 }]);
    const d = beziersToPathD(bz);
    expect(d).not.toContain('NaN');
  });

  it('does not overshoot on a straight line (centripetal)', () => {
    const track = new FlightTrack(catmullRomToBeziers(line));
    for (let s = 0; s <= track.length; s += 5) {
      expect(Math.abs(track.pointAt(s).y)).toBeLessThan(1e-6);
    }
    expect(track.length).toBeCloseTo(200, 0);
  });
});

describe('expandLoops', () => {
  it('adds a ring of points at looping waypoints and tracks original indices', () => {
    const { points, indexOf } = expandLoops([
      { x: 0, y: 500, anchor: true },
      { x: 400, y: 500, anchor: true, loop: 80 },
      { x: 800, y: 500, anchor: true },
    ]);
    expect(points).toHaveLength(3 + 4);
    expect(indexOf).toEqual([0, 1, 6]);
    // the loop climbs above the waypoint by 2r
    expect(Math.min(...points.map((p) => p.y))).toBe(500 - 160);
  });

  it('the resulting track really turns ~360° through the loop', () => {
    const { points } = expandLoops([
      { x: 0, y: 500, anchor: true },
      { x: 400, y: 500, anchor: true, loop: 80 },
      { x: 800, y: 500, anchor: true },
    ]);
    const track = new FlightTrack(catmullRomToBeziers(points));
    let total = 0;
    let prev = track.headingAt(0);
    for (let s = 2; s <= track.length; s += 2) {
      const h = track.headingAt(s);
      total += angleDelta(prev, h);
      prev = h;
    }
    expect(Math.abs(total)).toBeGreaterThan(Math.PI * 1.7);
  });
});

describe('FlightTrack', () => {
  const track = new FlightTrack(catmullRomToBeziers(line));

  it('records arc length at each spline point', () => {
    expect(track.pointArc).toHaveLength(3);
    expect(track.pointArc[0]).toBe(0);
    expect(track.pointArc[1]).toBeCloseTo(100, 0);
    expect(track.pointArc[2]).toBeCloseTo(track.length, 6);
  });

  it('clamps out-of-range distances', () => {
    expect(track.pointAt(-50)).toEqual({ x: 0, y: 0 });
    expect(track.pointAt(1e9).x).toBeCloseTo(200, 3);
  });

  it('reports heading along the direction of travel', () => {
    expect(track.headingAt(100)).toBeCloseTo(0, 5);
    const down = new FlightTrack(catmullRomToBeziers([{ x: 0, y: 0 }, { x: 0, y: 100 }]));
    expect(down.headingAt(50)).toBeCloseTo(Math.PI / 2, 5);
  });

  it('reports zero turn on a straight leg', () => {
    expect(track.sample(100).turn).toBeCloseTo(0, 5);
  });
});

describe('scroll mapping', () => {
  it('normalises anchors to start at 0 and end at the track end / max scroll', () => {
    const anchors = normaliseAnchors(
      [
        { scroll: -200, arc: 0 },
        { scroll: 500, arc: 300 },
        { scroll: 400, arc: 600 }, // out of order scroll → pushed forward
        { scroll: 9000, arc: 900 }, // beyond max scroll → clamped
      ],
      2000,
      1000,
    );
    expect(anchors[0]).toEqual({ scroll: 0, arc: 0 });
    for (let i = 1; i < anchors.length; i++) {
      expect(anchors[i].scroll).toBeGreaterThan(anchors[i - 1].scroll);
      expect(anchors[i].arc).toBeGreaterThan(anchors[i - 1].arc);
    }
    expect(anchors[anchors.length - 1].arc).toBe(1000);
    expect(anchors[anchors.length - 1].scroll).toBeGreaterThanOrEqual(2000);
  });

  it('hits anchors exactly and is monotonic in between', () => {
    const anchors = [
      { scroll: 0, arc: 0 },
      { scroll: 1000, arc: 400 },
      { scroll: 2000, arc: 1200 },
    ];
    expect(arcForScroll(1000, anchors)).toBe(400);
    expect(arcForScroll(2000, anchors)).toBe(1200);
    expect(arcForScroll(-10, anchors)).toBe(0);
    expect(arcForScroll(5000, anchors)).toBe(1200);
    let prev = -1;
    for (let s = 0; s <= 2000; s += 25) {
      const a = arcForScroll(s, anchors);
      expect(a).toBeGreaterThanOrEqual(prev);
      prev = a;
    }
  });
});
