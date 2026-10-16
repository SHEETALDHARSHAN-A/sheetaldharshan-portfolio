/**
 * Sets a new password for an admin user, straight in the database. Used when the password is
 * forgotten: the site has no email service, so "Forgot password" emails never arrive.
 *
 *   pnpm admin:reset-password            (prompts for the email and the new password)
 */
import 'dotenv/config'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true })
  if (hidden) {
    // Echo nothing while the password is typed.
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput
    ;(rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => (s.includes(question) ? write.call(rl, s) : undefined)
  }
  const answer = (await rl.question(question)).trim()
  rl.close()
  if (hidden) stdout.write('\n')
  return answer
}

const email = process.env.ADMIN_EMAIL || (await ask('Admin email: '))
const password = process.env.NEW_PASSWORD || (await ask('New password (hidden): ', true))
if (password.length < 12) {
  console.error('Use at least 12 characters.')
  process.exit(1)
}

const payload = await getPayload({ config })
const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true })
const user = found.docs[0]
if (!user) {
  console.error(`No admin user with email ${email}.`)
  process.exit(1)
}
await payload.update({ collection: 'users', id: user.id, data: { password, loginAttempts: 0, lockUntil: null } as never, overrideAccess: true })
console.log(`Password updated for ${email}. Sign in at /admin.`)
process.exit(0)
