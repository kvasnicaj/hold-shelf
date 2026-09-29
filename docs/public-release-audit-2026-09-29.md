# Public repository readiness audit — 2026-09-29

## Verdict

No real credentials or private user records were found in the material inspected.
The publication cleanup is implemented locally and passes validation. Before
changing visibility, commit and merge the reviewed changes and resolve the old
GitHub pull-request references that still retain personal author email addresses.

The initial audit did not change repository visibility or rewrite Git history.
The subsequent owner-authorized email rewrite is recorded below. The repository
remains private and no npm package has been published.

## Scope and evidence

- Inspected the working tree, including uncommitted changes and non-ignored new
  files. The final code/docs scan covered 428 files before adding this report.
- Cloned the remote separately: both published branches, all 19 pull-request head
  refs, and their reachable history. Gitleaks scanned 63 remote commits.
- Also scanned local history, including local branches, stash and local tool refs.
  Compared the four configured local credential/config values against 783 remote
  blobs and 905 local blobs, current files, retained Actions logs and discussions.
  No exact-value matches occurred. Values were never included in the report.
- Scanned the checked-in extension archive and its historical blob, with archive
  inspection enabled. No secret was detected. The archive contained unnecessary
  macOS metadata and is removed from the current tree.
- Inspected all 47 Actions run records. Downloaded and scanned all 21 available
  log archives. The other 26 logs (runs from April 5 through June 18) were no
  longer available from GitHub and could not be audited.
- Scanned 19 issue/PR records, one issue comment, and the available review/commit
  comment collections. The repository has no releases, retained Actions artifacts,
  or enabled wiki at the time of review.
- Reviewed dependency license metadata for 582 package entries, source notices,
  generated UI components, bookmark artwork, fonts, examples, and test fixtures.
  The owner confirmed no additional material was copied from other projects.
- Used Gitleaks 8.30.1, downloaded from its official release and checked against its
  published SHA-256 checksum. Reports were redacted and kept outside the repository.

## Findings and changes

### Credentials — no genuine exposure found

The default scanner reported four current-file findings and 14 remote-history
findings. These were deliberate token-display test fixtures and the literal
`hs_your_token` placeholder in old API documentation. No real token was identified.

`.gitleaks.toml` now records rule-specific exceptions for those exact values and
paths. It does not exempt whole test files. Control scans verified that both a
synthetic GitHub token and a different generic API key in the same fixture path
still trigger detection. The final current-files and remote-history scans have
zero unresolved findings.

Ignored local environment files were not tracked. `.gitignore` now also protects
other environment variants, local D1/SQLite files and sidecars, and generated
extension ZIPs. Placeholder example files remain eligible for version control.

The checked-in Cloudflare database ID, domain names and OAuth configuration names
are resource identifiers, not credentials. There was no reason to rotate a secret
based on this audit's findings.

### Third-party attribution — fixed

The generated shadcn/ui components, TanStack starter material, and Lucide-derived
bookmark artwork needed retained license notices. Added `THIRD_PARTY_NOTICES.md`
and `extension/icons/LICENSE` with the upstream MIT/ISC texts. Lora and Manrope
are loaded from Google Fonts and their upstream SIL Open Font Licenses are linked;
font binaries are not committed.

Removed the old prebuilt extension ZIP from the working tree. A fresh packaging
procedure uses an explicit source-file list, includes the icon license, and leaves
ZIP output in ignored `dist/`. The old archive still exists in Git history; this
audit did not rewrite that history.

No unexpected copied article corpus or third-party asset collection was found.
This is a source/provenance review, not proof of ownership for every authored line.

### Project license — MIT selected

The owner selected MIT for Hold Shelf's original code. Added the top-level
`LICENSE`, set the root and both workspace package manifests to `MIT`, and linked
the license from the README. Extension packaging includes this license alongside
the separate icon notices.

The third-party notices continue to apply independently of the MIT license for
original code.
See [GitHub's licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

Most dependencies have permissive licenses. Notable non-permissive/data licenses
are MPL-2.0 (Lightning CSS), LGPL-3.0-or-later (libvips, used by Sharp/Miniflare), and
CC-BY-4.0 (caniuse-lite data). They are build/development tooling or data, not copied
application source. No app-license conflict was identified for publishing this
source tree. Future binary/npm distributions must retain the notices and satisfy
the licenses of whatever dependencies they actually redistribute.

### Dependency vulnerability — fixed

The registry audit identified one moderate development dependency vulnerability:
Miniflare pinned Undici 7.29.0, affected by
[GHSA-3wwx-pv8p-q78v](https://github.com/nodejs/undici/security/advisories/GHSA-3wwx-pv8p-q78v).
A targeted override upgrades that dependency to the patched 7.29.1. The repeated
workspace audit reports zero known vulnerabilities. This result is time-dependent;
it is not a claim that dependencies cannot have undisclosed defects.

### Public contribution and deployment safeguards — improved

- CI now explicitly requests read-only repository permissions, disables persisted
  checkout credentials, and pins external actions to verified commit SHAs.
- Production deployment additionally checks the upstream repository name, so a
  fork's push to `main` does not attempt the upstream deployment automatically.
- A new secret-scan workflow verifies its Gitleaks download checksum, scans Git
  history, and scans current files/archives. Exceptions are narrowly scoped.
- Added `SECURITY.md` and `CONTRIBUTING.md`, documented local OAuth setup and
  self-hosting, and explained how to configure an independent deployment.

GitHub reports read-only default workflow permissions and no permission for
Actions to approve PRs. Actions currently allow all actions; checked-in workflows
now pin the ones they use. There are no configured deployment environments.

Before accepting outside contributions after publication, configure branch rules
requiring the `check` and `secrets` jobs, enable private vulnerability reporting
and applicable secret scanning/push protection, and require approval for outside
contributors' workflow runs. The current private repository's plan/API restrictions
prevented verifying/configuring the public branch-rule and fork-approval settings.
These are follow-up repository settings, not protections activated by this audit.

### Public personal information — branches rewritten; GitHub cleanup pending

At the owner's request, both personal email addresses were replaced with
`10117117+kvasnicaj@users.noreply.github.com` in author and committer metadata.
All 66 commits in the combined local/remote preparation copy were verified to
retain identical trees, messages, names, dates, and parent relationships.

Both published branches were updated with an atomic push and exact
force-with-lease checks. A fresh remote clone verifies that the 37 commits
reachable through the published branches contain neither original address.
Local branches and stash were rewritten too. Working files, index state, and
uncommitted changes were preserved. This checkout now uses the no-reply address
for future commits; other clones and GitHub's web email-privacy setting must also
be kept from reintroducing the old addresses.

**Publication blocker:** all 19 GitHub-owned historical pull-request refs still
retain original commits with the personal addresses. A normal push cannot rewrite
these read-only references. A private support-request draft has been prepared
outside the repository but has not been submitted. GitHub determines whether this
qualifies for removal; support cleanup is not guaranteed. Alternatively, publish
the cleaned branches in a fresh repository and retain this repository privately.
Do not make this repository public until that remaining exposure is resolved.

Private recovery bundles and old local reflog objects may retain the original
metadata. They are not pushed and must not be published or merged back into the
clean history. Existing clones should be freshly cloned or carefully migrated.
See [GitHub's history-cleanup guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

### Code cleanliness and validation

The existing architecture separates routes, components, server domains, and shared
API contracts. No additional publication-blocking code defect was identified in
the targeted review of authentication, token handling, ownership checks, external
URL fetching, sanitization, and deployment boundaries. This was not a penetration
test or an exhaustive proof that the entire application is bug-free.

Validation completed successfully:

- Biome: 334 files checked, no errors.
- TypeScript: web app, shared API contracts, and CLI.
- Tests: 256 passing across 80 test files.
- Production web build and CLI build/help smoke check.
- Dependency audit: zero known vulnerabilities after the patch.
- Gitleaks: current files, remote and local history, available logs/discussions,
  and historical archive inspection; only documented synthetic fixtures matched.
- Actionlint 1.7.12: both GitHub workflow files pass.
- Git diff whitespace checks and environment-file ignore checks pass.

## Remaining publication steps

1. Resolve GitHub's retained PR history through support, or choose a fresh public
   repository containing only the cleaned branches.
2. Commit and merge the reviewed local fixes, including the MIT license; this audit
   does not cover future changes unless the scans and checks are rerun.
3. Change visibility only after the above decisions. Remember that retained
   Actions logs and repository discussions become public alongside source:
   [GitHub visibility documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility).
4. Configure the public repository protections described above, then update the
   CLI guide and Settings copy to remove the private-access limitation.
