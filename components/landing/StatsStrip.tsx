export default function StatsStrip() {
  return (
    <section aria-label="Product statistics" className="stats-section overflow-hidden">
      <div className="container relative">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          <div className="stat-item relative z-10 flex flex-col md:flex-row items-center py-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8rem] md:text-[12rem] font-serif leading-none select-none" style={{ color: 'var(--color-primary)', opacity: 0.06, zIndex: -1 }}>
              98
            </div>
            <p className="type-stat" style={{ color: 'var(--color-primary)' }}>98%</p>
            <p className="type-body stat-label relative mt-2 md:mt-4 bg-surface/50 px-2">ATS parse rate across all templates</p>
          </div>

          <div className="stat-item relative z-10 flex flex-col md:flex-row items-center py-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8rem] md:text-[12rem] font-serif leading-none select-none tracking-tighter" style={{ color: 'var(--color-primary)', opacity: 0.06, zIndex: -1 }}>
              &lt;5
            </div>
            <p className="type-stat" style={{ color: 'var(--color-primary)' }}>&lt; 5 min</p>
            <p className="type-body stat-label relative mt-2 md:mt-4 bg-surface/50 px-2">Average time to a complete resume</p>
          </div>

          <div className="stat-item relative z-10 flex flex-col md:flex-row items-center py-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8rem] md:text-[12rem] font-serif leading-none select-none" style={{ color: 'var(--color-primary)', opacity: 0.06, zIndex: -1 }}>
              3
            </div>
            <p className="type-stat" style={{ color: 'var(--color-primary)' }}>3</p>
            <p className="type-body stat-label relative mt-2 md:mt-4 bg-surface/50 px-2">Professional templates, export-ready</p>
          </div>

        </div>
      </div>
    </section>
  );
}