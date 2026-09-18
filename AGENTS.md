# SMPP Portal Codex instructions

## Source of truth

Before proposing or making a change, inspect the relevant code and re-check the repository state. Prefer evidence in this order:

1. Existing code and adjacent implementations
2. Project documentation
3. Tests
4. Configuration and package scripts

Follow established repository patterns unless the task explicitly requires changing them. Do not invent a convention or replace the current architecture with a generic best practice. Record unrelated architecture concerns as notes; do not refactor them.

## Current project context

Treat these as observed context, not permanent assumptions; verify them when relevant:

- This is currently a JavaScript/JSX React application built with Vite. Do not introduce TypeScript solely for consistency with external preferences.
- `package-lock.json` and `package.json` identify npm as the current package manager.
- Routes live in `src/router/router.jsx`; authentication is provided by `src/context/AuthContext.jsx` and guarded by `src/router/RequireAuth.jsx`.
- Page-level UI lives mainly in `src/pages`, shared UI in `src/components`, API modules in `src/utils`, constants in `src/constants`, and global styling in `src/App.css` and `src/index.css`.
- Reuse the existing Axios client, `authHeader`, and `safeRequest` flow in `src/utils/httpClient.js` when an adjacent API implementation does so.
- Reuse the existing PrimeReact, React Toastify, icon, loading/error/empty-state, and CSS conventions visible near the feature. Do not redesign the UI or introduce a new state, form, data-fetching, styling, or test library without a task-specific need.
- The current package scripts expose `npm run lint` and `npm run build`; no test or typecheck script is currently declared. Re-inspect scripts and tooling rather than assuming this remains true.

## Required feature workflow

For feature or behavioral change requests, execute the complete `$feature-workflow`: requirement analysis, codebase exploration, implementation plan, implementation, independent review, valid-finding fixes, and appropriate automated verification. Continue between stages without asking for confirmation unless a genuine blocker exists.

A genuine blocker is limited to a material ambiguity that changes the implementation, missing required access/dependency, or verification that cannot be completed. State non-blocking assumptions and continue.

When manual QA or an automated check exposes a bug, use `$diagnose-bug`: reproduce and establish evidence before editing, apply the smallest root-cause fix, review the relevant diff, and verify again.

Use an isolated reviewer context or subagent for the independent review when the current Codex surface supports it. The reviewer must inspect the requirement and complete diff without relying on the builder's conclusions. Do not hard-code a model choice.

## Change safety

- Keep changes within task scope and preserve behavior outside it.
- Do not perform unrelated refactors, public-interface renames, dependency updates, or configuration changes.
- Do not delete code merely because it appears unused; verify reachability and task relevance first.
- Preserve accessibility and existing responsive behavior.
- Never expose secrets, credentials, tokens, or sensitive user data.
- Preserve pre-existing working-tree changes. Do not modify or revert them unless the user explicitly puts them in scope.
- Fix only failures introduced by the current change. Report pre-existing or environment failures separately.

### Preserve existing product features (mandatory)

Do **not** remove, hide, or leave unwired any existing user-facing capability unless the user explicitly asks to remove it.

This includes, without limitation:

- Header/toolbar actions (export, upload/import, download template, bulk actions)
- Filter controls, table columns, detail dialogs, pagination, empty/loading/error states
- API helpers in `src/utils` that the page previously called
- Buttons that still exist as product UI even if the backend handler is incomplete

When rewriting a page for a new API, layout polish, or bug fix:

1. Inventory existing actions and flows on the page (and in recent git history / adjacent API modules) before editing.
2. Carry every in-scope action forward into the new implementation.
3. If an old API path conflicts with a new one, keep both until the user confirms the old one should be retired.
4. If an action previously had UI only (no API yet), still keep the UI and note the missing API — do not delete the button.
5. If you are unsure whether a control is obsolete, ask once or keep it and call it out in the handoff; never silently drop it.

Concrete regression example to avoid: the đối soát screen lost **Export báo cáo** and **Upload file** during an API/UI rewrite. Those must remain available (export is wired to `POST /reconciliationManagement/export`; upload UI must stay even when the upload API is not yet configured).

Do not commit, push, force-push, create a pull/merge request, merge, deploy, or change remote infrastructure unless the user explicitly requests that exact action. A statement that manual QA passed is not by itself authorization for any of these actions.

## Completion contract

Do not stop after implementation. Before handing off, report the feature summary, changed files, important decisions and assumptions, checks run and their outcomes, pre-existing issues, remaining risks or limitations, and a concrete manual QA checklist.

End feature work with exactly one status line:

`READY FOR MANUAL QA`

or, only when a genuine blocker remains:

`NOT READY FOR MANUAL QA`
