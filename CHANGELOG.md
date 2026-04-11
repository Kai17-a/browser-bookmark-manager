## [unreleased]

### 🚀 Features

- *(frontend)* Refine layouts and local setup
- *(frontend)* Complete dashboard screen
- *(chrome-extension)* Add autofill
- *(api)* Add health check
- *(frontend)* Add cancel button
- *(frontend)* Update bookmark UI
- *(frontend)* Temporary change
- *(frontend)* Run e2e with test ports

### 🐛 Bug Fixes

- *(chrome-extension)* Fix storage access
- *(chrome-extension)* Adjust popup size
- *(frontend)* Fix save button control
- *(api)* Add bookmark and tag conflict responses
- *(frontend)* Adjust registration message
- *(api)* Fix pyright issues
- *(api)* Use environment for API base URL
- *(api)* Make docker build use virtualenv
- *(api)* Enforce unique folder and tag names
- *(api)* Split local and docker startup commands
- *(frontend)* Remove navbar connection badges
- *(frontend)* Refine bookmark and edit modal layouts
- *(frontend)* Stabilize vitest test command
- *(frontend)* Disable module preload polyfill warning
- *(frontend)* Disable tailwind sourcemap warning
- *(frontend)* Disable tailwind sourcemap warnings
- *(frontend)* Pin bun to build-compatible version
- *(frontend)* Silence tailwind build warning
- *(frontend)* Remove invalid nuxt css source map config
- *(frontend)* Resolve zed diagnostics
- *(frontend)* Simplify connection status handling
- *(docker)* Install bash for bun build scripts
- *(docker)* Avoid copying host node_modules into builds
- *(docker)* Publish image to ghcr
- *(frontend)* Simplify build script

### 🚜 Refactor

- *(frontend)* Finalize app restructure
- *(api)* Refine bookmark behavior
- *(chrome-extension)* Rework popup
- *(frontend)* Remove redundant API mirror
- *(chrome-extension)* Update popup save flow
- *(api)* Clean up main module formatting
- *(frontend)* Remove mutable api settings UI
- *(frontend)* Extract bookmark list helpers
- *(frontend)* Move e2e tests to root tests
- *(api)* Extract shared service dependencies
- *(api)* Centralize config and bookmark helpers

### 📚 Documentation

- Add docker usage to README
- Sync requirements with pyproject
- Clarify docker runtime layout
- Reorganize project documentation
- Define feature-sized commits
- *(specs)* Add LLM reading guide and agent instructions
- Add test runner skill and workspace-local hooks
- Split and refresh repository readmes
- Require commits after code changes
- *(development)* Pin bun build runtime

### 🧪 Testing

- *(frontend)* Add Vitest logic tests
- Add test docs and playwright e2e

### ⚙️ Miscellaneous Tasks

- Initialize monorepo
- Commit non-extension changes
- Initial commit
- *(chrome-extension)* Initial commit
- Refactor api and frontend build setup
- *(api)* Sync api dependencies
- Add data directory to gitignore
- Update skill packaging
- Expand gitignore for local caches
- Refine gitignore entries
