@AGENTS.md

# Claude Code notes

- Read AGENTS.md first: commands, the code map, recipes and the traps already hit.
- Before claiming a change works, run `pnpm typecheck`, `pnpm lint` and `pnpm test:e2e -- tests/e2e/public.e2e.spec.ts`. For UI, also take a Playwright screenshot (`channel: 'chrome'`) and look at it.
- `.env` usually points at the live Supabase database: confirm before running anything that writes (`pnpm seed`, `content:import` without `--dry-run`, migrations), and clean up any test data you create.
- You can't sign in to the admin (password plus GitHub), so test admin logic through the Local API in a throwaway `tsx` script (`NODE_OPTIONS="--import=tsx/esm" npx tsx scripts/.tmp.ts`, then delete it), and say plainly what you couldn't check on screen.
- Commit messages carry no AI attribution (no `Co-Authored-By` or "Generated with" lines). Push only after the checks pass.
