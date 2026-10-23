# Security hardening and rollout

This change prepares application defenses; it does not change live Cloudflare or
GitHub account settings. Merging to `main` triggers the existing automatic release
pipeline, including database migrations. Review the rollout effects first.

## Application controls

- Production auth explicitly uses HTTPS and Secure/HttpOnly/SameSite=Lax cookies.
  HTTP loopback hosts are available only in development builds. See [auth](auth.md).
- Authentication and API throttling use the validated Cloudflare ingress identity,
  not arbitrary forwarded prefixes or User-Agent values. This requires trusted
  Cloudflare ingress; a conventional server must establish its own trust boundary.
- Database-enforced per-account quotas cover imports, ordinary saves, tags and
  cached-content updates. Import throughput has a separate budget so backup
  restoration remains practical. See [quota policy](security-quotas.md).
- The Worker bounds request bodies before framework/JSON parsing: 64 KiB for API
  routes and 10 MiB for other requests, including server functions. Import batches
  have a smaller application-level bound. Oversized streams receive HTTP 413.
- Dynamic Worker responses use `private, no-store`. Hashed static assets retain
  their independent cache policy; authenticated or cookie-setting responses are
  never exempted by the Worker. Cloudflare cache rules must honor these headers.
- Worker responses deny framing and MIME sniffing, use `no-referrer`, and disable
  unneeded browser capabilities. The enforced CSP only covers framing, base URLs
  and plugins. A fuller CSP is **Report-Only**, not a completed XSS defense. It has
  no reporting endpoint; evaluate violations in browser developer tools without
  sending private document URLs to an external report collector. Add nonces/hashes
  for theme initialization and framework hydration before enforcing `script-src`.
- Sentry collection and outgoing envelopes are minimized, including bodies,
  queries, cookies, identity, private capability paths and span metadata. Full
  error messages are intentionally omitted; stack locations and stable error
  categories remain available. Third-party article requests receive no tracing
  headers. Worker invocation logs and native Cloudflare tracing are disabled in
  the prepared Wrangler config, and query redaction is enabled. Application
  console diagnostics remain enabled; Cloudflare may attach request metadata
  to them, so dashboard-side retention/access controls still matter.
- Opening `/save?url=…` requires a Save article confirmation. Authenticated direct
  extension saves remain supported. Sign-in handoffs return to confirmation.
- CLI human output removes terminal control characters; JSON preserves values
  through safe escapes. See [CLI guide](cli-guide.md).
- CI requires both validation and secret scanning before deployment. Production
  deploy jobs do not overlap, and stale commits skip migrations and upload after
  checking current `main`. See [deployment](deployment.md).

## Release checks

1. Back up D1 and verify a restore into a separate database before applying new
   production migrations. Never use real production accounts for destructive tests.
2. Review migrations `0010` (usage counters, backfill and enforcement triggers) and
   `0011` (unused provider-credential cleanup), including effects documented in
   [auth](auth.md). They are prepared here, not applied to production by this work.
3. Expect users with legacy cookie names to sign in again after release. Verify
   freshly issued production state and session cookies have Secure, HttpOnly and
   SameSite=Lax. Verify normal GitHub login/logout and extension sign-in handoffs.
4. Verify headers on pages, APIs, redirects, errors and server functions. Confirm
   private data is not cached under the actual Cloudflare cache rules.
5. Verify imports, Trash deletion, reader refresh, shares and CLI save/read flows.
   Rejected quota writes must leave existing content intact.
6. Inspect synthetic errors in the configured Sentry project to confirm the SDK
   redaction policy survives account-side processing and remains diagnosable.

## Configuration work outside this PR

- **Cloudflare minimum TLS: 1.2**, retaining TLS 1.3. Verify legacy handshakes fail.
- Retain HTTPS/canonical redirects. After cookie and HTTPS verification, stage
  HSTS with a short lifetime first. Review every subdomain before
  `includeSubDomains`; do not preload blindly. HSTS is deliberately not enabled
  by this application patch.
- Review WAF/auth edge rate limits, cache bypass rules, Worker limits, billing
  alerts, account MFA/membership, least-privilege API tokens and D1 backups.
- Require the CI `check` and `secrets` checks and reviewed changes on `main`.
  Workflow job dependencies do not configure branch protection or bypass rights.

Additional changes such as personal-token expiry/scopes, a published extension-ID
allowlist and remote-image privacy mode are separate product decisions. This
patch does not claim they are implemented or that authenticated production and
dashboard-only settings have been verified.
