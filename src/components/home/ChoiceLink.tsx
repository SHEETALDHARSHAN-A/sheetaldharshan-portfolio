import Link from 'next/link'
import { Fragment } from 'react'
import type { Choice } from '@/data/types'

function ChoiceAnchor({ choice }: { choice: Choice }) {
  if (choice.href.startsWith('/'))
    return (
      <Link href={choice.href} transitionTypes={['nav-forward']}>
        {choice.label}
      </Link>
    )
  return (
    <a href={choice.href} rel="noreferrer" target={choice.newTab ? '_blank' : undefined}>
      {choice.label}
    </a>
  )
}

/** Navigation choices rendered as inline links in one bubble, like "X, Bluesky and GitHub". */
export function ChoiceInline({ choices }: { choices: Choice[] }) {
  return (
    <>
      {choices.map((choice, index) => (
        <Fragment key={`${choice.href}-${index}`}>
          {index > 0 && (index === choices.length - 1 ? ' and ' : ', ')}
          <ChoiceAnchor choice={choice} />
        </Fragment>
      ))}
    </>
  )
}
