# Repository Operating Prompt

This repository uses documentation-first maintenance for behavior changes.

## Always do this

- When adding or changing a feature, update the implementation and the relevant specs in the same task.
- Keep `specs/requirements.md` as the product-level source of truth.
- Keep `specs/api/` for API behavior details.
- Keep `specs/frontend/` for UI and interaction details.
- Update `README.md` links when doc structure changes.
- Prefer small, precise documentation edits that match the current code.

## Documentation rules

- If code behavior changes, the spec must change too.
- If an endpoint changes, update `specs/api/`.
- If a page or user flow changes, update `specs/frontend/`.
- If requirements change, update `specs/requirements.md` and traceability docs.
- If a directory is created, moved, or merged, update doc navigation in the same change.
- If a rollback changes behavior, roll back the matching tests and specs too.

## Commit rules

- Follow Conventional Commits 1.0.0.
- Use one commit for one coherent change.
- Keep code, tests, and specs aligned inside the same change set.
- After revert, rebase, or any history rewrite that changes behavior, verify tests and specs are consistent with the resulting state.

## Workflow expectation

1. Inspect the current code and docs.
2. Identify the exact scope of the change.
3. Patch code and docs together.
4. Verify the docs still match the implementation.
5. Leave the repository with no stale spec references.
