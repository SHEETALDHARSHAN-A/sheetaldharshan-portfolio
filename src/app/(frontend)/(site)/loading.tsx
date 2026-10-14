/** Instant placeholder for inner pages while they stream in. */
export default function Loading() {
  return (
    <div className="page" aria-busy="true">
      <div className="sk-block" style={{ width: 120, height: 12, marginBottom: 14 }} />
      <div className="sk-block" style={{ width: '46%', height: 44, marginBottom: 18 }} />
      <div className="sk-block" style={{ width: '60%', height: 14, marginBottom: 10 }} />
      <div className="sk-block" style={{ width: '52%', height: 14 }} />
    </div>
  )
}
