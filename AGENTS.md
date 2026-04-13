# Repository Instructions

This repository uses the following reading order for agentic work:

1. `README.md`
1. `specs/llm-reading-guide.md`
1. Official LLM reference sources for Nuxt, Nuxt UI, and Vue:
   - https://nuxt.com/modules/llms
   - https://nuxt.com/llms-full.txt
   - https://ui.nuxt.com/llms.txt
   - https://ui.nuxt.com/llms-full.txt
   - https://vuejs.org/llms-full.txt

Follow those sources before making changes to Nuxt, Python, Nuxt UI, or TypeScript code in this repository.

If you change Python code, run `ruff` and `pyright` for the affected package or project before finishing.

If you add shared frontend API plumbing such as a common fetcher or request base layer, add the corresponding unit test or e2e test in the same change set.

When adding or changing DB columns, follow this process:
1. Create a SQL migration file in `db/migrations` named `{yyyymmddhhMMdd}.sql` for the DB operation.
2. Write the SQL into the created file.
3. From the repository root, run `mise x -- dbmate -u "sqlite:data/bookmarks.db" up` to apply the DB migrations.
4. If the DB needs to be rolled back, run `mise x -- dbmate -u "sqlite:data/bookmarks.db" down`.

If you change code, tests, or repository behavior, finish the task by creating the corresponding commit unless the user explicitly says not to.
