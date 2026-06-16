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
      // Find the CTA button position
      const btn = document.getElementById('cta-build-btn');
      let endX = w * 0.5;
      let endY = h * 0.92;

      if (btn) {
        const r = btn.getBoundingClientRect();
        const mainEl = btn.closest('main');
        if (mainEl) {
          const parentRect = mainEl.getBoundingClientRect();
          endX = r.left - parentRect.left + r.width / 2;
          endY = r.top - parentRect.top + r.height / 2;
        }
      }

      // Winding S-curve path across the page
      return [
        // Start: top-right area of hero
        `M ${w * 0.75},${h * 0.02}`,
        // Curve down to center for Features section
        `C ${w * 0.75},${h * 0.12} ${w * 0.2},${h * 0.15} ${w * 0.2},${h * 0.22}`,
        // Curve right for Feature 1 (Canvas)
        `S ${w * 0.85},${h * 0.30} ${w * 0.85},${h * 0.38}`,
        // Curve left for Feature 2 (Co-Pilot)
        `S ${w * 0.15},${h * 0.46} ${w * 0.15},${h * 0.54}`,
        // Curve right for Feature 3 (Navigator)
        `S ${w * 0.85},${h * 0.62} ${w * 0.5},${h * 0.68}`,
        // Steep descent through How It Works
        `S ${w * 0.2},${h * 0.76} ${w * 0.5},${h * 0.82}`,
        // Final approach to CTA
        `S ${w * 0.5},${endY * 0.95} ${endX},${endY}`,
      ].join(' ');
    };

    // Lookup table for arc-to-Y mapping
    let cachedMainTop = 0;
    let lookupTable: Array<{ arcLen: number; y: number }> = [];

    const setup = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const parent = svg.parentElement;
      if (!parent) return;

      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;

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

      const mainEl = svg.closest('main');
      if (mainEl) {
        cachedMainTop = mainEl.getBoundingClientRect().top + window.scrollY;
      }

      // Build lookup table
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

    let lastScrollY = -1;
    let targetLength = 0;

    const setButtonInverted = (on: boolean) => {
      if (on === btnActiveRef.current) return;
      btnActiveRef.current = on;
      const btn = document.getElementById('cta-build-btn');
      if (!btn) return;
      if (on) {
        btn.style.transition = 'all 0.3s ease';
        btn.style.background = 'var(--color-accent)';
        btn.style.color = '#FFFFFF';
        btn.style.transform = 'scale(1.05)';
        btn.style.boxShadow = '0 8px 24px rgba(74, 143, 255, 0.4)';
      } else {
        btn.style.background = '';
        btn.style.color = '';
        btn.style.transform = '';
        btn.style.boxShadow = '';
      }
    };

    const animate = () => {
      const len = pathLenRef.current;
      const hidden = hiddenRef.current;
      const plane = planeRef.current;

      if (len > 0 && hidden && plane && lookupTable.length > 0) {
        const currentScrollY = window.scrollY;

        if (currentScrollY !== lastScrollY) {
          lastScrollY = currentScrollY;

          const targetY = (currentScrollY + window.innerHeight * 0.5) - cachedMainTop;

          targetLength = len;
          for (let i = 0; i < lookupTable.length; i++) {
            if (lookupTable[i].y >= targetY) {
              targetLength = lookupTable[i].arcLen;
              break;
            }
          }
        }

        const diff = targetLength - drawnRef.current;

        if (Math.abs(diff) > 0.1) {
          drawnRef.current += diff * 0.15;
          const drawn = drawnRef.current;

          maskRef.current?.setAttribute('stroke-dashoffset', String(len - drawn));

          const pt = hidden.getPointAtLength(drawn);
          const lookAhead = Math.min(drawn + 5, len);
          const ptA = hidden.getPointAtLength(lookAhead);
          const angle = Math.atan2(ptA.y - pt.y, ptA.x - pt.x) * (180 / Math.PI);

          // Dissolution near end
          const distFromEnd = len - drawn;
          let opacity = 1;
          if (distFromEnd < 120) {
            opacity = Math.max(0, distFromEnd / 120);
          }

          plane.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${angle + 45})`);
          plane.setAttribute('opacity', String(opacity));
          trailRef.current?.setAttribute('opacity', String(Math.min(1, opacity * 0.85)));

          setButtonInverted(distFromEnd < 60);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // Init
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
        btn.style.background = '';
        btn.style.color = '';
        btn.style.transform = '';
        btn.style.boxShadow = '';
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

        {/* Dashed trail */}
        <path
          ref={trailRef}
          d=""
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8 12"
          opacity="0.4"
          mask="url(#winding-scroll-mask)"
        />

        {/* Paper plane icon */}
        <g ref={planeRef} opacity="0" style={{ willChange: 'transform' }}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="white"
            style={{ transform: 'translate(-14px, -14px)' }}
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </g>
      </svg>
    </div>
  );
}
