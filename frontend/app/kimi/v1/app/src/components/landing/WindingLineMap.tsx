'use client';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export default function WindingLineMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const hiddenRef = useRef<SVGPathElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const particleGroupRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number>(0);

  const drawnRef = useRef(0);
  const pathLenRef = useRef(0);
  const btnActiveRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const entranceAnimRef = useRef({ active: true, startTime: 0, duration: 1200 });
  const idleBobRef = useRef(0);

  useEffect(() => {
    const buildPath = (w: number, h: number): string => {
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

      // Set entrance animation start time
      entranceAnimRef.current.startTime = performance.now();
    };

    let lastScrollY = -1;
    let targetLength = 0;

    const spawnDissolveParticles = (px: number, py: number, intensity: number) => {
      const count = Math.floor(2 + intensity * 3);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.5;
        particlesRef.current.push({
          x: px + (Math.random() - 0.5) * 20,
          y: py + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 30 + Math.random() * 20,
          maxLife: 30 + Math.random() * 20,
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

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

    const updateParticles = () => {
      const group = particleGroupRef.current;
      if (!group) return;

      // Remove dead particles
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      // Update existing particles
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life--;
      }

      // Render particles as SVG circles
      while (group.firstChild) {
        group.removeChild(group.firstChild);
      }

      for (const p of particlesRef.current) {
        const opacity = (p.life / p.maxLife) * 0.4;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(p.x));
        circle.setAttribute('cy', String(p.y));
        circle.setAttribute('r', String(p.size * (p.life / p.maxLife)));
        circle.setAttribute('fill', 'var(--color-primary)');
        circle.setAttribute('opacity', String(opacity));
        group.appendChild(circle);
      }
    };

    const animate = () => {
      const len = pathLenRef.current;
      const hidden = hiddenRef.current;
      const plane = planeRef.current;

      if (len > 0 && hidden && plane && lookupTable.length > 0) {
        const currentScrollY = window.scrollY;

        // Calculate target length from scroll position
        if (currentScrollY !== lastScrollY || entranceAnimRef.current.active) {
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

        // Handle entrance animation
        let effectiveTarget = targetLength;
        if (entranceAnimRef.current.active) {
          const elapsed = performance.now() - entranceAnimRef.current.startTime;
          const progress = Math.min(elapsed / entranceAnimRef.current.duration, 1);
          // ease-out-expo
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          effectiveTarget = targetLength * eased;
          if (progress >= 1) {
            entranceAnimRef.current.active = false;
          }
        }

        // Lerp drawn toward target
        const diff = effectiveTarget - drawnRef.current;

        if (Math.abs(diff) > 0.1) {
          drawnRef.current += diff * 0.15;
          const drawn = drawnRef.current;

          // Idle bob (gentle vertical sine wave)
          const now = performance.now();
          idleBobRef.current = Math.sin(now / 1500) * 2;

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

          // Apply position with idle bob
          const bobY = idleBobRef.current;
          plane.setAttribute('transform', `translate(${pt.x},${pt.y + bobY}) rotate(${angle + 45})`);
          plane.setAttribute('opacity', String(opacity));
          trailRef.current?.setAttribute('opacity', String(opacity * 0.85));

          // Update particle trail dots behind the plane
          updateParticleTrail(hidden, drawn, len, opacity);

          // Dissolve particles near the end
          if (distFromEnd < 120) {
            const intensity = 1 - distFromEnd / 120;
            spawnDissolveParticles(pt.x, pt.y + bobY, intensity);
          }

          updateParticles();
          setButtonInverted(distFromEnd < 40);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const updateParticleTrail = (hidden: SVGPathElement, drawn: number, _len: number, mainOpacity: number) => {
      // We render 6 small dots trailing behind the plane
      const trailDots = [];
      for (let i = 1; i <= 6; i++) {
        const trailPos = Math.max(0, drawn - i * 8);
        if (trailPos > 0) {
          const tpt = hidden.getPointAtLength(trailPos);
          const dotOpacity = [0.30, 0.20, 0.12, 0.06, 0.03, 0.01][i - 1] * mainOpacity;
          trailDots.push({ cx: tpt.x, cy: tpt.y, r: 1.5 + (6 - i) * 0.3, opacity: dotOpacity });
        }
      }

      // Store trail dots to render — we'll use a separate group
      const trailGroup = document.getElementById('trail-dots-group');
      if (trailGroup) {
        while (trailGroup.firstChild) {
          trailGroup.removeChild(trailGroup.firstChild);
        }
        for (const dot of trailDots) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', String(dot.cx));
          circle.setAttribute('cy', String(dot.cy));
          circle.setAttribute('r', String(dot.r));
          circle.setAttribute('fill', 'var(--color-primary)');
          circle.setAttribute('opacity', String(dot.opacity));
          trailGroup.appendChild(circle);
        }
      }
    };

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
      aria-hidden="true"
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

        {/* Trail dots behind the plane */}
        <g id="trail-dots-group" />

        {/* Dissolve particles */}
        <g ref={particleGroupRef} />

        {/* Main trail */}
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

        {/* Paper plane */}
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
