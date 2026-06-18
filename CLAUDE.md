# cold brew

Personal long-form essay blog (coldbrew.live) built with Astro. Full product spec: `PRD.md`. Original brief: `coldbrew-blog-build-prompt.md`.

## Agent skills

### Issue tracker

Issues and PRDs live in this repo's GitHub Issues (`ssword/cold-brew-astro`), managed via the `gh` CLI. External pull requests are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling` when terms or decisions are actually resolved). See `docs/agents/domain.md`.
