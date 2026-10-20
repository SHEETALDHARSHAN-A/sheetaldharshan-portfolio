import type { Metadata } from 'next'
import Link from 'next/link'
import { PageFrame } from '@/components/shell/PageFrame'
import { getSite } from '@/data/content'

export const metadata: Metadata = { title: 'Privacy', description: 'What this site collects, why, who processes it, and how to see or delete your data.', alternates: { canonical: '/privacy' } }
export const revalidate = 3600

/** The privacy notice: plain words about every piece of personal data the site handles. */
export default async function PrivacyPage() {
  const site = await getSite()
  const email = site.email
  return (
    <PageFrame>
      <div className="page page-narrow privacy">
        <header className="page-head">
          <h1 className="h1-accent">Privacy</h1>
          <p>What this site collects, why, who handles it for me, and how you can see or delete it. Last updated 20 October 2026.</p>
        </header>
        <div className="prose">
          <h2>The short version</h2>
          <ul>
            <li>You can read everything here without an account, and nothing tracks you: there are no analytics, ads or tracking cookies.</li>
            <li>I only keep what you choose to send: a message on the Contact page, or a comment, rating or feedback in Field Notes.</li>
            <li>Your email address is never shown publicly or shared, and is never used for newsletters or marketing.</li>
            <li>Signed-in readers can download or delete their data any time from <Link href="/notes/me">their page</Link>.</li>
          </ul>

          <h2>What is collected, and why</h2>
          <h3>Contact page</h3>
          <p>
            The name, email, optional phone number, topic and message you send. They are stored so I can read and answer your message, and emailed to me as an alert. I keep them only as long as I need them to reply.
          </p>
          <h3>Field Notes accounts</h3>
          <p>
            If you sign in with <strong>GitHub</strong>, I receive your GitHub name, username, profile picture and the email GitHub shares. If you sign in with an <strong>email link</strong>, I keep your email address and the name you choose. Your name and picture are shown next to what you write; GitHub
            accounts show a verified tick and link to your GitHub profile. Your email is never shown.
          </p>
          <h3>Comments, ratings, likes, stars, reports and feedback</h3>
          <p>
            What you write and do in Field Notes is stored with the post it belongs to and shown as described on the page. Anonymous comments carry no name. Feedback on selected text and reports are private: only I see them.
          </p>
          <h3>Abuse prevention</h3>
          <p>
            To stop spam, the site counts how often an address sends things. For people who are not signed in it stores a <strong>one-way keyed hash</strong> of the IP address, never the address itself. Text is checked automatically for abuse before it appears; anything doubtful waits
            for me to approve it.
          </p>

          <h2>Cookies and local storage</h2>
          <ul>
            <li>
              <code>reader_session</code>: keeps you signed in to Field Notes for up to 30 days. Set only when you sign in; secure and not readable by scripts.
            </li>
            <li>Admin cookies: only for me, in the admin.</li>
            <li>Your browser&apos;s local storage remembers small display choices on this device (light or dark theme, panel widths, chat or form). They never leave your browser.</li>
          </ul>

          <h2>Who handles it for me</h2>
          <ul>
            <li>
              <strong>Vercel</strong> hosts the site.
            </li>
            <li>
              <strong>Supabase</strong> stores the database and uploaded files, and runs GitHub sign-in (it keeps a record of the GitHub sign-in).
            </li>
            <li>
              <strong>Resend</strong> sends the emails: alerts to me, and sign-in links to you.
            </li>
            <li>
              <strong>GitHub</strong> serves profile pictures of GitHub readers, and handles GitHub sign-in.
            </li>
            <li>
              Embedded videos and audio (<strong>YouTube</strong> in its privacy-enhanced mode, <strong>Vimeo</strong>, <strong>Spotify</strong>, <strong>SoundCloud</strong>) load from those services only on posts that include them; their own policies apply.
            </li>
          </ul>
          <p>I do not sell or share your data with anyone else.</p>

          <h2>Security</h2>
          <p>
            Everything travels over HTTPS. Sign-in uses GitHub or one-time email links (no passwords to leak); links work once, for 15 minutes, and only a hash of each is stored. Sessions are signed and can be ended on all devices from your account menu. The database is not reachable from the
            internet without the site&apos;s server keys.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>
              <strong>See or download your data:</strong> <Link href="/notes/me">your page</Link> → Download my data.
            </li>
            <li>
              <strong>Edit or delete a comment:</strong> the Edit and Delete buttons under it (signed-in comments).
            </li>
            <li>
              <strong>Delete your account:</strong> <Link href="/notes/me">your page</Link> → Delete my account. You choose whether your comments are deleted or kept as Anonymous.
            </li>
            <li>
              <strong>Anything else</strong>, including removing an anonymous comment or a contact message{email ? (
                <>
                  : email <a href={`mailto:${email}`}>{email}</a>
                </>
              ) : (
                <>
                  : use the <Link href="/contact">Contact page</Link>
                </>
              )}
              .
            </li>
          </ul>
        </div>
      </div>
    </PageFrame>
  )
}
