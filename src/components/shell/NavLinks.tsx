'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/data/types'

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? '/'
  return (
    <>
      {items.map((item, index) => {
        const external = !item.href.startsWith('/')
        const current = !external && (pathname === item.href || pathname.startsWith(`${item.href}/`))
        const number = String(index + 1).padStart(2, '0')
        if (external) {
          return (
            <a key={item.href} href={item.href} rel="noreferrer" target={item.newTab ? '_blank' : undefined}>
              <span className="n">{number}</span>
              <span>{item.label}</span>
            </a>
          )
        }
        return (
          <Link key={item.href} href={item.href} aria-current={current ? 'page' : undefined}>
            <span className="n">{number}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}
