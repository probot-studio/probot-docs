# Repository Guidelines

## Project Structure
MkDocs documentation site for the Probot robotics library. Sources live in `docs/`, theme overrides in `overrides/`, and the generated output in `site/` (never edit). Configuration is in `mkdocs.yml`.

## Build & Development
```bash
mkdocs serve -a 0.0.0.0:8000   # live preview
mkdocs build --strict           # validate (warnings = failures)
```

## Coding Style
Practical, concise Turkish. Focus on "how" with working code examples. Use Material admonitions (`!!! info`, `!!! warning`) and complete code snippets. Keep paragraphs short.

## Commit Messages
Format: `type(scope): kısa açıklama`
Examples: `docs(motor): motor kontrol sayfası güncelle`, `ci: deploy branch değiştir`
