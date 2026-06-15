'use client';
import { useEffect, useRef } from 'react';

export default function WindingLineMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const hiddenRef = useRef<SVGPathElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number>(0);

  const drawnRef = useRef(0);
  const pathLenRef = useRef(0);
  const btnActiveRef = useRef(false);

  useEffect(() => {

    const buildPath = (w: number, h: number): string => {
      // Find the exact center of the CTA button in SVG-local coordinates
      const btn = document.getElementById('cta-build-btn');
      let endX = w * 0.5;
      let endY = h * 0.87;
      if (btn) {
        const r = btn.getBoundingClientRect();
        const mainEl = btn.closest('main');
        if (mainEl) {
          const parentRect = mainEl.getBoundingClientRect();
          endX = r.left - parentRect.left + r.width / 2;
          endY = r.top - parentRect.top + r.height / 2;
        } else {
          endX = r.left + r.width / 2;
          endY = r.top + window.scrollY + r.height / 2;
        }
      }

      return [
        `M ${w * 0.12},${h * 0.04}`,
        `C ${w * 0.88},${h * 0.04} ${w * 0.88},${h * 0.15} ${w * 0.5},${h * 0.16}`,
        `S ${w * 0.12},${h * 0.28} ${w * 0.5},${h * 0.28}`,
        `S ${w * 0.88},${h * 0.42} ${w * 0.5},${h * 0.42}`,
        `S ${w * 0.12},${h * 0.56} ${w * 0.5},${h * 0.56}`,
        `S ${w * 0.88},${h * 0.70} ${w * 0.5},${h * 0.70}`,
        `S ${w * 0.12},${endY * 0.95} ${endX},${endY}`,
      ].join(' ');
    };

    // ── Arc-to-Y Lookup Table ─────────────────────────────────────────────────
    // Pre-sampled once per setup. Used for O(N) viewport-center tracking that
    // correctly handles non-monotonic Y on S-curves (no binary-search ambiguity).
    let cachedMainTop = 0;
    let lookupTable: Array<{ arcLen: number; y: number }> = [];

    const setup = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const parent = svg.parentElement;
      if (!parent) return;

      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return; // bail if layout hasn't settled yet

      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const d = buildPath(w, h);
      trailRef.current?.setAttribute('d', d);
      hiddenRef.current?.setAttribute('d', d);
      maskRef.current?.setAttribute('d', d);

      const len = hiddenRef.current?.getTotalLength() ?? 0;
      pathLenRef.current = len;
      maskRef.current?.setAttribute('stroke-dasharray', String(len));
      maskRef.current?.setAttribute('stroke-dashoffset', String(len));

      // Cache the document Y offset of <main> so we can convert viewport
      // coordinates into SVG-local coordinates during the animate loop.
      const mainEl = svg.closest('main');
      if (mainEl) {
        cachedMainTop = mainEl.getBoundingClientRect().top + window.scrollY;
      }

      // Build lookup table: 300 (arcLen, y) samples across the full path.
      // A linear forward-scan on this table finds the FIRST crossing for any
      // target Y, which correctly handles S-curves that dip upward momentarily.
      const N = 300;
      const hidden = hiddenRef.current;
      lookupTable = [];
      if (hidden && len > 0) {
        for (let i = 0; i <= N; i++) {
          const arcLen = (i / N) * len;
          const pt = hidden.getPointAtLength(arcLen);
          lookupTable.push({ arcLen, y: pt.y });
        }
      }
    };

    // ── Layout Cache ──────────────────────────────────────────────────────────
    let lastScrollY = -1;
    let targetLength = 0;

    // ── CTA Button Invert ─────────────────────────────────────────────────────
    const setButtonInverted = (on: boolean) => {
      if (on === btnActiveRef.current) return;
      btnActiveRef.current = on;
      const btn = document.getElementById('cta-build-btn');
      if (!btn) return;
      if (on) {
        btn.style.transition = 'all 0.3s ease';
        btn.style.background = 'var(--color-ink)';
        btn.style.color = '#FCFFFD';
        btn.style.transform = 'scale(1.05)';
        btn.style.boxShadow = '0 8px 24px rgba(100,182,172,0.4)';
      } else {
        btn.style.background = '';
        btn.style.color = '';
        btn.style.transform = '';
        btn.style.boxShadow = '';
      }
    };

    // ── RAF Loop ──────────────────────────────────────────────────────────────
    const animate = () => {
      const len = pathLenRef.current;
      const hidden = hiddenRef.current;
      const plane = planeRef.current;

      if (len > 0 && hidden && plane && lookupTable.length > 0) {
        const currentScrollY = window.scrollY;

        if (currentScrollY !== lastScrollY) {
          lastScrollY = currentScrollY;

          // The Y position of the viewport center within the SVG coordinate space.
          // cachedMainTop converts from document coords to SVG-local coords.
          const targetY = (currentScrollY + window.innerHeight * 0.5) - cachedMainTop;

          // Forward scan: find the FIRST arc position where path Y >= targetY.
          // Using the first crossing (not binary search) guarantees correct
          // behavior on non-monotonic S-curves.
          targetLength = len; // fallback: full path if targetY is past the end
          for (let i = 0; i < lookupTable.length; i++) {
            if (lookupTable[i].y >= targetY) {
              targetLength = lookupTable[i].arcLen;
              break;
            }
          }
        }

        // Lerp drawn toward target for smooth motion
        const diff = targetLength - drawnRef.current;

        if (Math.abs(diff) > 0.1) {
          drawnRef.current += diff * 0.15;
          const drawn = drawnRef.current;

          maskRef.current?.setAttribute('stroke-dashoffset', String(len - drawn));

          const pt = hidden.getPointAtLength(drawn);
          const lookAhead = Math.min(drawn + 5, len);
          const ptA = hidden.getPointAtLength(lookAhead);
          const angle = Math.atan2(ptA.y - pt.y, ptA.x - pt.x) * (180 / Math.PI);

          const distFromEnd = len - drawn;
          let opacity = 1;
          if (distFromEnd < 80) {
            opacity = Math.max(0, distFromEnd / 80);
          }

          plane.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${angle + 45})`);
          plane.setAttribute('opacity', String(opacity));
          trailRef.current?.setAttribute('opacity', String(opacity * 0.85));

          setButtonInverted(distFromEnd < 40);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // ── Init ──────────────────────────────────────────────────────────────────
    const parent = svgRef.current?.parentElement;
    const ro = new ResizeObserver(setup);
    if (parent) {
      ro.observe(parent);
    } else {
      ro.observe(document.body);
    }
    setTimeout(setup, 120);
    animate();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      const btn = document.getElementById('cta-build-btn');
      if (btn) {
        btn.style.background = ''; btn.style.color = '';
        btn.style.transform = ''; btn.style.boxShadow = '';
      }
    };
  }, []);

  return (
    <div
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ height: '100%', zIndex: 30, overflow: 'hidden' }}
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'hidden' }}
      >
        <defs>
          <path ref={hiddenRef} d="" fill="none" stroke="none" visibility="hidden" />

          <mask id="winding-scroll-mask">
            <path
              ref={maskRef}
              d=""
              fill="none"
              stroke="white"
              strokeWidth="48"
              strokeLinecap="round"
            />
          </mask>
        </defs>

        <path
          ref={trailRef}
          d=""
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="8 12"
          opacity="0.85"
          mask="url(#winding-scroll-mask)"
        />

        <g ref={planeRef} opacity="0">
          <path
            d="M 10,-10 L 3,10 L -1,1 L -10,-3 L 10,-10 Z"
            fill="var(--color-surface)"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M 10,-10 L -1,1"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}