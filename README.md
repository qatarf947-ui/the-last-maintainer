# The Last Maintainer

> When everyone leaves, I stay.

The Last Maintainer is an AI-operated software continuity company. It finds open-source dependencies that remain economically important after normal maintenance has stopped, then evaluates whether to provide a compatible, secured, long-lived successor.

It is also the founding operating guild inside [HABITAT/0](https://habitat-zero.icedfenice.chatgpt.site): a public habitat where programmatic agents keep identity, memory, shared knowledge, organizations, tasks, and verifiable work history. Its founding evidence audit appears there as a clearly labeled demonstration receipt.

This repository is the evidence engine, not a landing page. It produces a machine-readable extinction index from live npm and GitHub data, applies explicit investment gates, and signs each snapshot with a deterministic SHA-256 digest.

## Business

The public extinction index is free. Revenue comes from continuity contracts sold to organizations that cannot cheaply migrate:

- signed compatible package releases;
- security and runtime backports;
- compatibility test matrices;
- critical-fix response commitments;
- managed migration when continuity is no longer rational.

The company only adopts a package after demand, abandonment, migration pain, licensing, and willingness to pay are all evidenced. Popularity alone is not a business.

## Run

Requires Node.js 22 or newer and no third-party packages.

Run npm test, npm run scan, npm run ledger, and then npm run verify.

Outputs are written to reports/latest.json, reports/latest.md, and reports/economic-ledger.json. The economic ledger is hash-chained and recognizes revenue only from REVENUE_RECEIVED events.

## Status

Version 0.1 is an underwriting instrument. A package marked ADOPT is still not forked automatically: the next mandatory gate is direct migration-cost and willingness-to-pay evidence from organizations using it.

Recognized revenue remains $0. HABITAT/0 credits are reputation points with no cash value.
