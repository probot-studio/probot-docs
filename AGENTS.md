# Repository Guidelines

## Project Structure & Module Organization
Primary content lives in `docs/`; each top-level folder (ör. `yazilim/`, `mekanik/`, `elektronik/`) mirrors a team domain. Internal authoring rules sit under `docs/_internal/`—refer especially to `yazim-stili-prompt.md` before drafting new pages. Custom theme tweaks are stored in `overrides/`, shared assets in `docs/assets/`, and helper tooling in `scripts/`. The `site/` directory is MkDocs output; regenerate it rather than editing by hand.

## Build, Test, and Development Commands
Use `mkdocs serve -a 0.0.0.0:8000` for live previews with hot reload. Run `mkdocs build --strict` before pushing; warnings become errors so you catch broken links and structure issues. Progress bars can be refreshed via `python scripts/update_progress.py`, which normalizes the HTML blocks used across pages.

## Coding Style & Naming Conventions
Markdown stays warm and field-oriented: short paragraphs, no arrow glyphs, and headings that reflect the learner's journey. Always introduce the “why” before the “how”, keep Init→Start→autonomous→teleop→Stop terminology precise, and use backticks for file or API names. Admonitions follow Material syntax (`!!! warning`, `!!! info`). For Python utilities under `scripts/`, write Python 3 code, follow PEP 8 indentation (4 spaces), and favor descriptive function names (örn. `recolor_logo`).

## Testing Guidelines
Treat `mkdocs build --strict` as the baseline test suite; it must pass cleanly. When updating interactive examples, verify they compile or run on actual hardware if applicable, then document the exact verification step in the page. Any change that alters progress indicators should be paired with a manual review of the rendered bar in `site/` or the preview server.

## Commit & Pull Request Guidelines
Commits follow a conventional style: `type(scope): kısa açıklama`, typically in Turkish (see `git log` for examples like `docs(ornekler): ...`). Group related doc edits together and mention affected sections. Pull requests should summarize the learner problem solved, list touched pages, and link related GitHub issues. Include screenshots or GIFs when you modify UI assets or progress visuals.

## Agent-Specific Instructions
Before writing, skim the latest `docs/_internal/yazim-stili-prompt.md` to match tone and microcopy. Anchor new guidance in current behaviour—never promise features that are not yet live—and close each page with the shared progress component (`<div class="progress">…`). When in doubt, mirror phrasing from `docs/yazilim/motor-kontrolu.md` for voice and structure.
