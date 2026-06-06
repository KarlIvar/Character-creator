# Character Creator — Daggerheart

A character generator for the Daggerheart TTRPG (Darrington Press).

> **Status:** early scaffolding. The rules data lives under `src/data/`; the
> character model, random generator, and guided creation UI land in later
> Threads.

## Run it locally

Requires Node 22+ and npm 10+.

```sh
npm install
npm run dev      # start the Vite dev server
npm run test     # run the Vitest suite once
npm run build    # type-check and produce a production bundle in dist/
```

Other handy scripts:

| Command                 | What it does                                         |
| ----------------------- | ---------------------------------------------------- |
| `npm run typecheck`     | `tsc -b --noEmit` across the project references.     |
| `npm run lint`          | ESLint over the TypeScript/TSX sources.              |
| `npm run format`        | Prettier check (use `format:write` to apply).        |
| `npm run validate:data` | Validate `src/data/*.json` against the JSON Schemas. |

CI (GitHub Actions, `.github/workflows/ci.yml`) runs the same checks —
`validate:data`, `lint`, `format`, `typecheck`, `test`, `build` — on every
push and pull request.

## Content licensing

The game content under `src/data/` is derived from the Daggerheart System
Reference Document published by Darrington Press LLC under the Darrington
Press Community Gaming License. See
[`ATTRIBUTION.md`](./ATTRIBUTION.md) for the required notice.
