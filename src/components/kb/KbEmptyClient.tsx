/** Nothing to show yet, said the way a terminal would. */
export function KbEmptyClient({ command, lines }: { command: string; lines: string[] }) {
  return (
    <div className="kb-term" role="status">
      <div className="kb-term-bar" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <pre>
        <span className="kb-term-prompt">$</span> {command}
        {lines.map((l, i) => (
          <span key={i}>
            {'\n'}
            {l}
          </span>
        ))}
        <span className="kb-term-cursor" aria-hidden="true" />
      </pre>
    </div>
  )
}
