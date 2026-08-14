# mcpcli

oclif CLI (`mcp`) for any MCP server. Fork of makosst/mcp, whose npm package
`@makosst/mcp` was fully unpublished — this repo is the real home.

## distribution: dist/ is committed

`dist/` is intentionally tracked (not gitignored). Consumers install with
`bun add github:caffeinum/mcpcli`, and building at install time does not work:

- bun blocks untrusted `prepare` scripts by default (`bun pm untrusted`)
- bun does not install devDeps for git deps, so `shx`/`tsc` are unreachable
  even after `bun pm trust mcp`

So: **run `npm run build` and commit `dist/` with any `src/` change.**

## health check

`mcp --version` and `mcp --help` are answered by oclif from package.json and
exit 0 on a completely broken install. The only cheap probe that forces a
`dist/` import:

    mcp daemon --help    # 0 when good, 2 when dist/ is missing

`mcp daemon` itself is long-running (binds a port, `GET /health` → 200).
