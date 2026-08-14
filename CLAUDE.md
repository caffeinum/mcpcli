# mcpcli

oclif CLI (`mcp`) for any MCP server. Fork of makosst/mcp, whose npm package
`@makosst/mcp` was fully unpublished — this repo is the real home.

## distribution: dist/ is committed

`dist/` is intentionally tracked (not gitignored). Consumers install with
`bun add github:caffeinum/mcpcli`, and building at install time does not work:

- bun does not run dependency lifecycle scripts by default, so `prepare` never
  fires (`bun pm untrusted` lists it). Bypassable by the consumer via
  `trustedDependencies` — so this alone is not the blocker.
- bun does not install devDeps for git deps, so `shx`/`tsc` are unreachable
  even after `bun pm trust mcp` (`shx: command not found`, exit 127). **No
  consumer-side config fixes this**, which is why `prepare` cannot work.

Verified on bun 1.3.11. Note that `git clone && bun install && bun run build`
succeeds — a clone installs devDeps, a git *dependency* does not. Don't validate
install-time behaviour from a clone.

So: **run `npm run build` and commit `dist/` with any `src/` change.**

`.github/workflows/dist-freshness.yml` enforces this — it rebuilds and fails if
committed `dist/` differs from a fresh build. `package-lock.json` pins the
compiler, so keep npm as the lockfile of record (`bun.lock` is gitignored).

## health check

`mcp --version` and `mcp --help` are answered by oclif from package.json and
exit 0 on a completely broken install. The only cheap probe that forces a
`dist/` import:

    mcp daemon --help    # 0 when good, 2 when dist/ is missing

`mcp daemon` itself is long-running (binds port 3001 by default, `GET /health`
→ 200). It is a poor probe: a timeout-based check can't tell "healthy" from
"wedged before bind".

The freshness guard proves `dist/` matches `src/` and that the binary loads. It
does **not** prove the CLI works — it runs no tests, and `daemon --help` is a
load check only.

## release/publish is broken

`onPushToMain.yml` has failed on every run in its history: `Setup git` runs
`git config --global user.email ${{ secrets.GH_EMAIL }}` with the secret unset,
so it runs with no argument and exits 1. The job dies before cutting a release,
so `onRelease.yml` (the publish trigger) has never fired.

Publishing to npm therefore needs three things, not one:

1. repo secrets `GH_EMAIL`, `GH_USERNAME`, `GH_TOKEN`, plus an npm token
2. a scope aleks controls — bare `mcp` is taken, `@makosst/mcp` is fully
   unpublished (packument, tarball, and the `makosst` user all 404)
3. a real version — `"version": "0.0.0"` is hardcoded and has never been bumped

Parked as of 2026-08-14 at aleks's request. Not urgent: the freshness guard
closed the silent-staleness risk that was the safety argument for npm.
