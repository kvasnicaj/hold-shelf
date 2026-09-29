# Contributing

Follow the local setup in [README.md](./README.md). Use a separate GitHub OAuth app
and the local D1 emulator; do not use production accounts or data for tests.

Before opening a pull request, run:

```sh
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

Keep routes thin, use kebab-case filenames, and follow the component and helper
structure described in [AGENTS.md](./AGENTS.md). Update the relevant `docs/` pages
when changing routes, major page components, server responsibilities, or save flow.
Write tests for behavior and regressions, rather than restating implementation.

Use synthetic test content and credentials. Include attribution and applicable
license notices for any third-party code or assets. Report security issues using
[SECURITY.md](./SECURITY.md), not in public pull requests.

If Gitleaks is installed, run the same history check used by CI:

```sh
gitleaks git . --config .gitleaks.toml --log-opts="--all --full-history" --redact
```

CI does not give deployment credentials to pull requests. Production deployment
runs only after checks pass on a push to the upstream `main` branch.
