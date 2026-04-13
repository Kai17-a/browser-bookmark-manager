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

If you change code, tests, or repository behavior, finish the task by creating the corresponding commit unless the user explicitly says not to.
