# Documentation Index

This project's docs are the shared knowledge base for every working session,
human or AI. Keep them current: they are the source of truth, not chat
history.

## Structure

| File | Holds | Read it when | Update rule |
|---|---|---|---|
| [`../reference-doc.md`](../reference-doc.md) | Client proposal: scope, pages, dashboard, phases, plan | Deciding *what* to build | When a client decision lands |
| [`project/site-guide.md`](project/site-guide.md) | How the concept site is built: files, tokens, sections, interactions, accessibility | Changing *how* the site works or looks | In the same commit as the change |
| [`progress/PROGRESS.md`](progress/PROGRESS.md) | Status table and dated session log | Starting or ending a session | End of every working session |
| [`progress/CHALLENGES.md`](progress/CHALLENGES.md) | Problems hit, with root cause and fix | Something behaves strangely | Whenever something bites |

## Precedence

- **What to build:** `reference-doc.md` wins over the concept site and over
  this folder.
- **How the site is built:** `project/site-guide.md` describes the code. If
  the two disagree, the code is current and the guide must be fixed.

## Conventions

- ISO dates (`2026-10-12`), never relative ones.
- Code references in backticks, with file and section (`styles.css` §19).
- Mark sample or assumed data as such. The page uses `*` for this.
