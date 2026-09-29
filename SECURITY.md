# Security

Security fixes target the latest version on `main`. Update before reporting an
issue; older snapshots are not maintained as separate release branches.

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/kvasnicaj/hold-shelf/security/advisories/new)
when enabled. Include the affected version, reproduction steps, and impact, using
test accounts and synthetic data.

If private reporting is unavailable, open an issue requesting a private contact
channel **without vulnerability details**. Do not put credentials, personal data,
or exploit instructions in public issues or pull requests.

## Credentials and contributions

- Keep local credentials in ignored `.dev.vars` or `.env` files. Commit only
  placeholder examples.
- Store deployment credentials in GitHub Actions secrets and Cloudflare secrets.
- Do not commit database files, personal library exports, or captured user data.
- Tests and examples must use synthetic credentials and content.
- The secret-scanning workflow checks Git history. Its exceptions cover only
  explicit dummy values; do not add broad file or directory exclusions.
- If a real secret is committed, revoke or rotate it first. Removing it from the
  latest file does not remove it from history, logs, or existing clones.
