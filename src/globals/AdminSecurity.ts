import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

/** Admin sign-in options. Read by src/proxy.ts, so the on/off value is public (nothing else is stored here). */
export const AdminSecurity: GlobalConfig = {
  slug: 'admin-security',
  label: 'Sign-in & security',
  admin: {
    group: 'Admin panel',
    description: 'How you sign in to this admin. Changes apply within about a minute.',
  },
  access: { read: () => true, update: authenticated },
  fields: [
    {
      name: 'githubStep',
      type: 'checkbox',
      label: 'GitHub two-step sign-in',
      defaultValue: true,
      admin: {
        description:
          'On: after your password, confirm with the GitHub account in src/config/admin.ts (GitHub must be enabled in Supabase). Off: the password alone signs you in. Forgotten passwords are reset through GitHub either way; pnpm admin:reset-password always works.',
      },
    },
  ],
}
