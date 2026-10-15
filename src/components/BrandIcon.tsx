import { findBrand } from '@/config/brands'

/** The official mark for a link or name, from src/config/brands.ts. Renders nothing for unknown brands. */
export function BrandIcon({ href, name, size = 16, className }: { href?: string; name?: string; size?: number; className?: string }) {
  const brand = findBrand({ href, name })
  if (!brand) return null
  const classes = ['brand-icon', brand.plate ? 'brand-plate' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <span
      className={classes}
      style={{ ['--brand-size' as string]: `${size}px`, ...(typeof brand.plate === 'string' ? { background: brand.plate, padding: 1 } : {}) }}
      data-brand={brand.id}
      aria-hidden="true"
    >
      {brand.path ? (
        <svg viewBox="0 0 24 24" fill={brand.color ?? 'currentColor'}>
          <path d={brand.path} />
        </svg>
      ) : brand.src ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny static icon, no optimisation needed
        <img src={brand.src} alt="" width={size} height={size} loading="lazy" decoding="async" />
      ) : null}
    </span>
  )
}

