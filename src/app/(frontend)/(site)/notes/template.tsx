/**
 * Re-created on every move inside ./stdout (unlike the layout), so the page part plays its entrance
 * each time you switch channels, open a post or search, while the side column stays still.
 */
export default function StdoutTemplate({ children }: { children: React.ReactNode }) {
  return <div className="kb-enter">{children}</div>
}
