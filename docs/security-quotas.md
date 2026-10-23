# Library security quotas

Server-side quotas protect shared D1 storage and write capacity. They apply equally to website, extension, API, imports, and content-cache refreshes; client-side file limits are not security boundaries.

| Budget | Limit |
| --- | --- |
| Articles per account | 10,000, including Trash |
| Tags per account | 1,000 |
| Stored article/tag/content text per account | 250 MiB of UTF-8 bytes |
| Tags attached to one article | 100 |
| Import throughput | 10,000 submitted records per account per hour |
| Import JSON throughput | 100 MiB per account per hour |
| Import batch | 1–10 articles, at most 8 MiB of UTF-8 JSON |

A supported 10,000-record backup can be restored within one hourly allowance (subject to the byte and storage budgets). Import throughput is separate from ordinary single-save throttling, so imports do not consume the 30-saves-per-minute allowance. Duplicate/retried records still consume import throughput. The hourly window starts with the account's first import; it does not slide forward on rejected retries. Throughput budgets are atomic D1 upserts and may charge an earlier budget when a subsequent budget refuses the request. This deliberately fails closed.

Import files remain limited to 50 MiB and 10,000 articles in the UI. A stopped import can safely resume by retrying the same backup: already saved URLs are skipped. Each article, its newly created tags, associations, reading progress, Trash state, content, and quota counters commit or roll back together. A multi-record request may have already committed earlier articles before a later record fails; retry remains safe.

## Storage accounting

Migration `0010_account_quotas.sql` installs database triggers and backfills `account_usage` for every existing user. It counts actual UTF-8 bytes of article URL/title/description/hostname/favicon, tag name/color, and cached Markdown/plain text/source URL/extraction version/failure text. Fixed-size fields and SQLite/index overhead are not counted as content bytes; article/tag/association caps also bound row counts. This is a per-account content budget, not a promise about D1's physical database size or Cloudflare billing.

Counters change in the same SQLite statement/transaction as the stored data, so concurrent requests cannot race past the quota. Cache inserts, replacements, metadata/tag edits, and permanent deletes all adjust the counters. Moving articles/tags/cache ownership is deliberately prohibited at the database layer; there is no account-transfer feature. Soft deletion does not release quota. Permanently deleting articles, or deleting tags, does release quota. SQLite cascades are included in the accounting.

Existing accounts are never truncated. An account already above a limit after migration may keep reading, change non-growing data, shrink content, or permanently delete records, but cannot increase the dimension that exceeds its limit. API and extension saves return `409 QUOTA_EXCEEDED` with a safe explanation; web/import errors explain how to make room or when to retry.

## Deployment and maintenance

1. Take/verify a D1 backup or Time Travel restore point.
2. Apply the reviewed D1 migrations before deploying the new Worker. The migration backfill scans existing content once; plan a quiet period and monitor migration duration on large databases.
3. Deploy the application and verify create/import/cache-refresh/delete behavior using a disposable account.
4. Monitor shared D1 database size, read/write volume, request errors, and billing thresholds. Per-account quotas do not replace global capacity alerts or abuse controls.

Use migrations, **not `drizzle-kit push`**, to install and preserve the quota triggers. Drizzle's TypeScript schema tracks the counter table but cannot represent custom triggers; a later table rebuild must recreate any dropped triggers and reconcile counters. Keep quota constants, SQL limits, tests, and this document synchronized when changing the policy. Counter rows are internal bookkeeping and must never be exposed for client updates. Rolling back application code does not remove the database quotas.
