## Install from source

The CLI is currently available only to collaborators with access to the private
[Hold Shelf repository](https://github.com/kvasnicaj/hold-shelf). It is not published
to npm, so there is no public installation yet. If you do not have repository access,
you can use the [REST API](/api-docs) directly with your personal access token.

With repository access, you need Git, Node.js 22 or later, and pnpm 10.32.1:

```sh
git clone https://github.com/kvasnicaj/hold-shelf.git
cd hold-shelf
pnpm install --frozen-lockfile
pnpm --filter @hold-shelf/cli build
node packages/cli/dist/bin.js --help
```

On macOS or Linux, create an alias for the current terminal session while you are
in the repository directory:

```sh
alias hold-shelf="node '$PWD/packages/cli/dist/bin.js'"
```

The examples below use that alias. On Windows, or without the alias, replace
`hold-shelf` with `node packages/cli/dist/bin.js` and run from the repository root.
Rebuild after updating the source. No global package installation is required.

## Connect your account

1. Open [Settings](/app/settings), find **API access**, and generate a personal token.
2. Copy the token while it is shown; the server does not keep a readable copy.
3. Run the login command and paste it into the hidden prompt:

```sh
hold-shelf auth login
hold-shelf auth status
```

Login validates the token and stores it in your operating system's credential store.
The token grants access to your library; treat it like a password. Generating a
replacement token invalidates the previous one. If secure storage is unavailable,
provide `HOLD_SHELF_TOKEN` through your environment or automation's secret manager.
It takes precedence over a stored credential; do not put tokens in command arguments
or commit them to scripts.

`hold-shelf auth login --token-stdin` also accepts a token through standard input
for secure credential provisioning. `hold-shelf auth logout` removes the local
stored credential. To revoke server access, use **Revoke token** in Settings and
remove any `HOLD_SHELF_TOKEN` environment value yourself.

## Everyday commands

Replace `ARTICLE_ID` with an ID printed by a list or search command. Quoted tag names
must already exist in your library; create tags in the web app first.

```sh
hold-shelf articles list --unread
hold-shelf articles search "design systems"
hold-shelf articles add "https://example.com/article" --tag "Reading"
hold-shelf articles show ARTICLE_ID --format markdown
hold-shelf articles mark ARTICLE_ID --read
hold-shelf articles mark ARTICLE_ID --unread
hold-shelf articles favorite ARTICLE_ID
hold-shelf articles unfavorite ARTICLE_ID
hold-shelf articles favorites
hold-shelf articles tag add ARTICLE_ID "Reading"
hold-shelf articles tag remove ARTICLE_ID "Reading"
hold-shelf tags list
hold-shelf dashboard
```

Search includes saved article content when capture is available. Reading an article
with `show` does not automatically mark it read. Saving an existing URL returns the
existing article; retrying an add with tags safely resumes tag assignment.

## Filters and pagination

List, search, and favorites support `--tag`, `--read`, `--unread`, `--favorite`,
`--sort`, `--limit`, and `--page`. Use either `--read` or `--unread`.
Sort values are `newest`, `oldest`, and `title`. Pages start at 1; the default page
size is 20 and the maximum is 100.

```sh
hold-shelf articles list --tag "Reading" --sort oldest --limit 50 --page 2
hold-shelf articles search "sqlite" --favorite --unread
```

## Trash and recovery

```sh
hold-shelf articles delete ARTICLE_ID
```

This asks for confirmation, then moves the article to Trash. Restore it in the web
app's **Account → Trash** menu. Permanent deletion and Empty Trash are available
there with a separate confirmation. A deleted article's saved content and reading
progress are removed only when it is permanently deleted.

For scripts or JSON output, pass `--yes` to acknowledge the move to Trash:

```sh
hold-shelf articles delete ARTICLE_ID --yes --json
```

## Automation and connection options

```sh
hold-shelf articles list --unread --json
hold-shelf dashboard --json
hold-shelf --help
hold-shelf articles --help
```

`--json` writes structured results to standard output. Errors are written to
standard error; unsuccessful commands return a nonzero exit status. Use the
[REST API documentation](/api-docs) for response schemas and direct HTTP examples.
The default server is `https://hold-shelf.com`. Override it with `--server <url>`
or `HOLD_SHELF_URL`; the command-line option takes precedence. Credentials are
stored per server. HTTPS is required except for loopback development servers.
`--timeout <milliseconds>` controls request timeout, and `--no-color` disables color.

## Troubleshooting

- **Invalid or revoked credential:** check `auth status`, generate a new token in
  Settings if needed, then run `auth login`. Check whether an environment token is
  overriding your stored one.
- **No secure credential store:** use `HOLD_SHELF_TOKEN` from a secret manager for
  that process. The CLI does not fall back to a plaintext credential file.
- **Tag not found:** run `tags list` and use an existing name exactly. Create new
  tags in the web app.
- **Source content unavailable:** the original page may require login or browser
  rendering. Open its original URL or try Refresh saved content in the web reader.
- **Rate limited:** wait for the server's retry window before trying again.
- **Module not found:** run `pnpm install --frozen-lockfile` and rebuild the CLI from
  the repository root.
