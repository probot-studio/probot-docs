# Repository Guidelines

## Project Structure & Module Organization
MkDocs sources live in `docs/`, grouped by team domains such as `docs/yazilim/`, `docs/mekanik/`, and `docs/elektronik/`. Keep internal policies in `docs/_internal/`, shared imagery and diagrams in `docs/assets/`, and automation helpers under `scripts/`. Theme overrides reside in `overrides/`, while `site/` is generated output—inspect it, never edit it. Use `review/` for ongoing audits and update `mkdocs.yml` when navigation changes.

## Build, Test, and Development Commands
Run `mkdocs serve -a 0.0.0.0:8000` for a live preview with autoreload. Validate every series of edits with `mkdocs build --strict`; treat warnings as failures. After adjusting any `<div class="progress">…</div>` block, refresh metrics via `python scripts/update_progress.py` and confirm the rendered bar in the preview. Rebuild after touching `overrides/` to ensure theme tweaks compile cleanly.

## Coding Style & Naming Conventions
Adopt the warm, field-ready tone defined in `docs/_internal/yazim-stili-prompt.md` and mirrored in `docs/yazilim/motor-kontrolu.md`. Explain the “why” before the “how”, prefer short paragraphs, and keep the Init → Start → autonomous → teleop → Stop sequence literal. Wrap file names and commands in backticks, use complete code snippets, and rely on Material admonitions (`!!! info`, `!!! warning`). Python utilities follow PEP 8 spacing, descriptive verb-based names (ör. `recolor_logo`), and Python 3 syntax.

## Testing Guidelines
Use `mkdocs build --strict` as the regression gate whenever navigation, links, or includes change. Firmware or interactive sketches must also be validated on hardware; document the verification step inside the updated page. After running `scripts/update_progress.py`, spot-check the progress widget in the live preview or exported `site/` bundle to ensure percentages, colors, and labels align.

## Commit & Pull Request Guidelines
Commit messages follow `type(scope): kısa açıklama`, matching history such as `docs(ornekler): joystick durumlarını güncelle`. Bundle related documentation edits into a single commit and note which pages moved, grew, or gained assets. Pull requests should outline the learner problem solved, list touched paths, link related issues, and include screenshots or GIFs when UI or progress visuals change.

## Agent & Maintainer Notes
Before drafting, reread the style prompt, sync to the latest `main`, and avoid referencing unreleased features. Close each walkthrough with the shared `<div class="progress">…</div>` component so the tracker stays consistent. When unsure about tone or structure, mirror recent updates in `docs/yazilim/` for a quick alignment check.
