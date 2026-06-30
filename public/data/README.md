# Data — how to update the dashboard

The dashboard reads **versioned, immutable JSON files** from this folder. There
is no database and no app server: **updating the numbers means editing/adding a
JSON file here — not changing or redeploying code** (PRD §4.2).

```
public/data/
├─ manifest.json     # which periods exist + which one is "current"
├─ 2026-Q1.json      # one immutable document per period
└─ 2026-Q2.json
```

The app fetches `manifest.json` (short cache) to learn the available periods,
then fetches the selected `<period>.json` (long cache, immutable).

---

## Updating an existing period (correction / reconciliation)

Use this when a number was wrong or a transcribed value has been verified.

1. Edit the relevant `<period>.json` (e.g. `2026-Q2.json`).
2. Set `verified: true` on each KPI once it's reconciled to source — this
   removes the "⚠ Unverified" badge.
3. **Validate** before publishing:
   ```bash
   npm run validate-data            # all periods
   npm run validate-data 2026-Q2    # just one
   ```
4. Commit and publish (upload the file to the static host / CDN). No app deploy.

## Adding a new period (the monthly / quarterly refresh)

1. Copy the most recent period file as a starting point:
   ```bash
   cp public/data/2026-Q2.json public/data/2026-Q3.json
   ```
2. Update `period`, `generatedAt`, every `value` / `target` / `vsGoalPct` /
   `status`, and the `narrative`. Roll `priorPeriodValue` and `trend` forward.
3. Register it in `manifest.json` — add to `periods` and (if it's now the
   latest) set `current`:
   ```json
   { "current": "2026-Q3", "periods": ["2026-Q1", "2026-Q2", "2026-Q3"], "schemaVersion": "1.0" }
   ```
4. `npm run validate-data` → fix any errors → commit → upload the new file
   **and** the updated `manifest.json`.

> Order matters at publish time: upload the new `<period>.json` **first**, then
> `manifest.json`. The manifest is the only file that advertises a period, so a
> client never sees a period before its data is in place.

---

## The rules the validator enforces

`npm run validate-data` is the guardrail that keeps a hand-edit from shipping a
bad number. It checks:

- **Required fields & enums** — every KPI has the contract's fields; `area`,
  `status`, `ownership`, `unit`, etc. use only allowed values.
- **RAG matches the math** — `status` must equal what `vsGoalPct` implies
  (`≥95` green, `90–95` amber, `<90` red). Status is computed once, here and in
  the pipeline — never typed independently in two places (PRD §6.2).
- **Report-once / no double-count** — a KPI `id` appearing in more than one
  section (scorecard, a team, the shared register) must have the **same**
  value/status everywhere.
- **Shared register completeness** — anything flagged `isShared` is listed in
  `sharedKPIs` with ≥2 contributors.
- **Manifest integrity** — `current` is one of `periods`.

It also **warns** (non-blocking) for any `verified: false` KPI so you can see
exactly what still needs reconciliation before a quarter is "final."

---

## Why this shape (so future maintainers keep it)

- **Immutable per-period files** = an instant audit trail and historical views;
  never overwrite a closed quarter's meaning, add a new file.
- **`manifest.json` is the only mutable pointer** — it's also the only
  short-TTL/cache-busted file, so switching the "current" period is one tiny
  edit.
- **Validate, then publish** — because anyone can edit JSON, the validator is
  what makes that safe at a regulated firm. Wire it into the monthly pipeline as
  the final gate (it exits non-zero on error) and/or a pre-commit/CI check.
- **Aggregate values only** — no participant-level / PII data ever lands in
  these files (PRD §8).
