/** A reader's picture (GitHub avatar) or their initials on a colour picked from their name. */
export function Avatar({ name, src, size = 26 }: { name: string; src?: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="kb-avatar" src={src} alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" style={{ width: size, height: size }} />
  return (
    <span className="kb-avatar" style={{ background: `hsl(${hue} 55% 42%)`, width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">
      {initials}
    </span>
  )
}
