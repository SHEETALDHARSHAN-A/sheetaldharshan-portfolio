import { AdminTheme } from './AdminBrand'

/**
 * On the login page: applies the admin's colours and font (Admin look). Payload's own "Forgot
 * password?" link already leads to the GitHub reset (see src/proxy.ts).
 */
export function GitHubSignIn() {
  return <AdminTheme />
}
