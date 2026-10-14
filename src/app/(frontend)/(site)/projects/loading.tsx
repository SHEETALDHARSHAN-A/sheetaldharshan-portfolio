/** Instant placeholder while the projects page streams in, so navigation never feels stuck. */
export default function Loading() {
  return (
    <section className="yk yk-loading" aria-busy="true" aria-label="Loading projects">
      <div className="yk-stage">
        <div className="stage-skeleton" />
      </div>
      <div className="yk-list">
        {[0, 1, 2].map((i) => (
          <div className="project-row skeleton-row" key={i} style={{ '--i': i } as React.CSSProperties}>
            <span className="n" />
            <span className="thumb" />
            <span className="tab">
              <span className="sk-line" />
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
