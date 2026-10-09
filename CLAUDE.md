# CLAUDE.md

Canonical guide for agents and engineers working in `probot-docs`. This file is written in
English. The documentation pages under `docs/` are end-user content and are written in Turkish
(see "Writing rules").

## Purpose and audience

`probot-docs` is the public documentation site for the Probot robot kit and the `probot-core`
library (ESP32-S3, Arduino / ESP-IDF). The audience is robotics competition teams (typically
high-school level, limited resources) and the AI assistants that help them write robot code.
Pages are practical: how to install, how to write the lifecycle hooks, how to wire sensors, how
to read an error code.

The site is built with MkDocs using a custom theme (`theme.name: null`, `custom_dir: theme`),
not Material. The repository is public: see "Public repository rule".

## Repository layout

| Path | Purpose |
|---|---|
| `docs/*.md` | Page sources (Turkish, end-user content) |
| `docs/assets/` | Images, favicons, social card, `theme.js` |
| `docs/stylesheets/` | `probot.css`, `code.css` |
| `theme/main.html` | The single page template (header, nav, version chip, pager, footer) |
| `mkdocs.yml` | Base configuration (nav, plugins, extensions, `extra`) |
| `mkdocs.prod.yml` | Production overlay: `INHERIT: mkdocs.yml`, sets `site_url` and `site_dir: site-prod` |
| `.github/workflows/docs-preview.yml` | Strict build on push to `dev` |
| `STUDIO-NOTE.md` | Hand-off notes from the platform agent (kept as history) |

Generated output (`site/`, `site-prod/`) is never edited and never committed; `site/`, `.venv/`,
`.env`, `.cache/`, `.build/`, `TODO.md` and `research/` are in `.gitignore`. Note that
`site-prod/` is not in `.gitignore` today; do not commit it.

Pages (all in `nav` order): `index` (Giris), `kurulum` (install), `baslangic` (first look),
`yazilim` (software), `notlar` (competition notes), `ornekler` (example robot), `hatalar`
(errors), `saha` (signal cleanliness), `llms` (instruction set for AI assistants). Navigation
is declared only in `mkdocs.yml`; a page missing from `nav` is a strict-build warning.

## Languages

There is currently one language: every page in `docs/` is Turkish, and file names are Turkish
slugs (`kurulum.md`, `hatalar.md`). There are no paired TR/EN pages in this repository today.
The platform's education chat server reads a `docs-en` path from its side; no such directory
exists in this tree, so do not assume one. If English pages are added, agree the layout with an
owner first and keep it recorded here.

## Public contracts: URLs and error-code anchors

Other sites, the product UI, serial output and robot telemetry link into these pages. Treat
paths and anchors as a public contract.

- Page URLs follow the file names (`/kurulum/`, `/hatalar/`, ...). Renaming or deleting a page
  needs a redirect and an owner decision.
- `docs/hatalar.md` defines the error code table (`PB-Exxx`) and one section per code, each
  preceded by an explicit anchor: `<a id="pb-e101"></a>` ... `pb-e105`, `pb-e201`, `pb-e202`,
  `pb-e301`, `pb-e302` ... `pb-e306`, `pb-e409`. A second anchor `deadline-miss` sits next to
  `pb-e301`. These anchors are fixed by hand, not derived from heading text, so that editing a
  heading never breaks a link.
- Never remove or rename an anchor. Adding a new code means adding its row, its section, and
  its `<a id="pb-eNNN"></a>` in the same change.
- Code bands: E1xx compile, E2xx linker, E3xx runtime, E4xx protocol/HTTP (E409 deliberately
  equals HTTP 409).
- The English strings quoted in the code sections (`[PB-E101] ...`) are verbatim library
  output. Copy them exactly from `probot-core`; do not translate or "fix" them.
- Internal links use relative `.md` paths with the anchor, for example `hatalar.md#pb-e301`.
  `mkdocs build --strict` catches broken page links; it does not validate anchors, so check
  them by hand.

## Version badge: single source

`extra.core_version` in `mkdocs.yml` is the only place the library version is written. It
mirrors the `VERSION` file in `probot-core`. `theme/main.html` renders the "Probot Core vX.Y.Z"
chip on every page from it. On a core release bump only that line changes. Never hard-code a
version number in page text or in the template.

## Commands

There is no requirements file. The CI workflow installs these packages, and local setup needs
the same set (the production overlay uses the same plugins):

```bash
python -m venv .venv && . .venv/bin/activate
pip install mkdocs mkdocs-material mkdocs-rss-plugin pymdown-extensions
```

```bash
mkdocs serve -a 0.0.0.0:8000              # live preview (site at http://localhost:8000)
mkdocs build --strict                     # validate; warnings fail the build (this is what CI runs)
mkdocs build -f mkdocs.prod.yml --clean   # production build into site-prod/
```

The `rss` plugin (`mkdocs-rss-plugin`) derives dates from git history, so use a full clone
(CI uses `fetch-depth: 0`). Run `mkdocs build --strict` before every push.

The theme loads the shared header and footer web components from `extra.site_root`
(`https://probotstudio.com`). Previews therefore need network access to that host. The
templates mention an optional `mkdocs.dev.yml` that points `site_root` at the dev site; it is
not committed in this repository.

## Release flow

- `dev` is the trunk. `stable` is the release branch.
- Work on a short-lived branch cut from `dev` (`docs/...`, `fix/...`, ...), open a PR into
  `dev`. Pushes to `dev` run `.github/workflows/docs-preview.yml` (workflow name "Docs Preview
  (manual)"; it also has `workflow_dispatch`). It runs `mkdocs build --strict` and uploads the
  `site` directory as an artifact. It does not deploy.
- Releasing is promoting `dev` to `stable`. That is a production-affecting action and needs
  owner approval (see "Production and ownership").
- Live addresses: `https://docs.probotstudio.com` (`site_url` in `mkdocs.yml`) and the
  production path build at `https://probotstudio.com/docs/` (`site_url` in `mkdocs.prod.yml`).
  How the production build is hosted is an ops matter and is not documented in this public
  repository.

## How the platform consumes this repository

The platform monorepo includes `probot-docs` as a git submodule. The submodule pin is a commit
SHA: a change here reaches the platform only after the platform repository bumps its pin, in
its own PR. The platform's education chat server reads this content from the submodule; it also
looks for a `docs-en` directory, which does not exist yet and is picked up without code changes
once English pages are added.
Consequences for this repository: keep pages self-contained plain Markdown with front matter
(`title`, `description`), avoid constructs that only render inside the theme, and keep
`docs/llms.md` accurate, since it is the instruction set for AI assistants.

## Writing rules

Two languages, strictly separated:

- Docs pages (`docs/*.md`) are end-user content. They stay in the product language, Turkish.
  This is the "end-user copy" exception in the organization standards.
- Everything else is English: this file, the README, comments, commit messages, PRs, branch
  names. The legacy `AGENTS.md` rule that commits are written in Turkish is superseded.

Page style (from the previous guide and the existing pages):

- Practical, concise Turkish. Focus on "how", with working, complete code examples.
- Short paragraphs. Use Material-style admonitions (`!!! info`, `!!! warning`); the
  `admonition` extension is enabled.
- Front matter on each page: `title` and `description`.
- Enabled extensions: `admonition`, `toc` (permalinks), `footnotes`, `attr_list`, `md_in_html`,
  `pymdownx.superfences`, `pymdownx.highlight`, `pymdownx.keys`, `pymdownx.tasklist`, `meta`.
- Do not use the em dash in new content. The site owner removed it from the theme and asked
  that it not appear on the site. Existing pages still contain some (for example in
  `hatalar.md` headings and lists); do not add more, and clean them in a dedicated change,
  not inside an unrelated one (the anchors above are explicit ids, so heading edits are safe).
- Facts come from `probot-core` (API, macros, error strings, behavior). Do not invent specs;
  when a page describes a core behavior, it should match the core version in
  `extra.core_version`.

## Commit messages

Conventional Commits in English: `type(scope): imperative summary`, with a body explaining
why. Examples: `docs(motor): update the motor control page`, `ci: change deploy branch`. The
`Co-Authored-By:` trailer applies to agent commits.

## Public repository rule

This repository is public. Never commit internal infrastructure details: server paths, IP
addresses, internal hostnames, internal details of private repositories, personal contact
numbers, or credentials. Public addresses of the product (`probotstudio.com` and its
subdomains already used in configuration) are fine. If you find such a detail already
committed (for example in a config comment), do not copy it into new text; raise it with an
owner.

## Gotchas

- `AGENTS.md` previously said theme overrides live in `overrides/`. They do not: the theme is
  `theme/` (custom, `name: null`). Page chrome (nav, chip, footer) is in `theme/main.html`.
- The workflow installs `mkdocs-material` but the site does not use the Material theme. Do not
  assume Material CSS or features beyond the markdown extensions listed above.
- Header and footer are shared components (`<probot-header>`, `<probot-footer>`) loaded from the
  main site, which is the single source for them. Do not re-implement a footer in
  `theme/main.html`. The site navigation (Home, Design, Software, Store, Contact) is owned by
  the platform; the docs nav is only the left sidebar from `mkdocs.yml`.
- `docs/.nojekyll` and a root `.nojekyll` exist for GitHub Pages; leave them.
- `--strict` turns warnings into failures. A page file not listed in `nav`, or a broken
  relative link, fails CI.
- Anchors are fixed ids (see "Public contracts"); changing a heading does not change them, but
  deleting the `<a id>` lines does.

## Probot Studio engineering standards

These rules are shared by every repository in the `probot-studio` GitHub organization. A
repository may add stricter rules below; it never relaxes these.

### Organization map

| Repository | What it is | Trunk | Visibility |
|---|---|---|---|
| `probot-studio` | Platform monorepo: probotstudio.com site, shop, accounts and LMS, release pipeline, ops records | `dev` (`prod` is the live pointer) | private |
| `blocks` | Block coding tool (`/blocks/`), shipped to the platform as a versioned surface artifact | `dev` | private |
| `sim` | Robot simulator (`/sim/`) and its match server, shipped as a versioned surface artifact | `dev` | private |
| `probot-core` | ESP32-S3 robot control library (Arduino / ESP-IDF) | `dev` (`stable` is the release branch) | public |
| `probot-docs` | Public documentation site (MkDocs) | `dev` (`stable` is the release branch) | public |
| `probot-egitim` | Curriculum research and lesson production workspace | `main` | private |

GitHub is the single source of truth. The self-hosted Gitea mirror is a backup only: never push
to it and never treat it as authoritative.

### Language: English, everywhere

Everything an engineer or agent authors is written in English:

- Code: identifiers, comments, docstrings, log and error messages, test names.
- Git: branch names, commit subjects and bodies, tags, release notes.
- GitHub: PR titles and descriptions, review comments, issues, discussions.
- Engineering docs: READMEs, ADRs, runbooks, plans, this file.

The only exception is copy that ships to end users in their locale: UI strings, lesson and
curriculum content, marketing pages and legal texts stay in the product language (Turkish
today). Keep that copy in data or i18n files, not hard-coded in logic.

Legacy Turkish identifiers and file names exist. Do not rename them opportunistically inside an
unrelated change. A rename is its own refactor PR that updates every reference, keeps public
contracts compatible (or versions them), and is recorded in the repository's moved-paths log.
New modules, new public APIs and new files are named in English.

### Engineering bar

Write production-grade code that a staff engineer would approve without comments:

- **Correct first.** Handle the edge cases, failure paths and concurrency you can foresee.
  Validate input at trust boundaries; trust nothing that crosses a process or network edge.
- **Tested.** Every behavior change ships with a test that fails without it. Bug fixes start
  with a reproducing test. A skipped test is not a passing test. Refactors that must not change
  behavior prove it (build-output comparison, golden files, contract tests).
- **Typed boundaries.** Public interfaces, wire formats, storage schemas and cross-repo
  contracts are explicitly typed and versioned. Breaking a contract requires a new version and a
  migration path, never a silent change.
- **Errors are handled, not swallowed.** No empty `catch`. Fail loudly at startup on bad
  configuration; degrade gracefully at runtime with an actionable log line.
- **Small and focused.** One concern per PR. Minimal diff. No speculative abstractions, no dead
  code, no commented-out code, no `TODO` without a linked issue.
- **Readable.** Code reads like the code around it. Names say what, comments say why.
- **Secure by default.** No secrets in the repository, logs or artifacts (`.env*` is ignored;
  templates are `.env.template`). Least privilege for tokens, keys and service users. Pin
  dependencies and actions; review lockfile changes.
- **Operable.** New services and jobs come with health checks, structured logs and a documented
  rollback.
- **Fast and accessible.** UI changes respect performance budgets, keyboard and screen-reader
  access, and are verified at 1440x900 and 390x844.

### Repository layout principles

- Apps never import another app's source. Shared code becomes a package with a declared
  dependency and an explicit `exports` map.
- Runtime coupling between apps happens only through written contracts: URL paths, message
  types, storage keys, HTTP endpoints. Contracts live in a documented file and are covered by a
  contract test.
- A tool that leaves the platform monorepo gets its own repository and ships to the platform as
  a pinned, checksummed release artifact (surface lock + `sha256`), never as a source copy.
- Generated files are either never committed, or committed together with the generator change
  and checked for drift in CI. Each repository says which.
- History is preserved: moves use `git mv`; retired content goes to an archive directory, not
  to the bin.

### Git and review workflow

- Work on short-lived branches cut from the trunk: `feat/<scope>-<topic>`, `fix/...`,
  `refactor/...`, `chore/...`, `docs/...`, `test/...`, `ci/...`.
- Commits follow Conventional Commits, fully in English: `type(scope): imperative summary`,
  then a body that explains why. Agent commits carry a `Co-Authored-By:` trailer.
- Every change lands through a PR into the trunk. Squash merge only; the branch is deleted
  after merge. Promoting the trunk to a release branch (`stable`, `prod`) is a fast-forward
  or a merge commit, never a squash, so both branches keep the same commits.
- **Never merge while CI is red or still running.** Wait for every required check to finish
  green, including after a rebase.
- No direct pushes, force pushes or history rewrites on shared branches (`dev`, `main`, `prod`,
  `stable`). Coordinate any history rewrite with the owners first.
- PR descriptions state what changed, why, how it was verified (commands and results) and how
  to roll it back.

### Production and ownership

- Owners: Tuna (`@tunapro1234`) and Mami (`@mr-kaynak`).
- Anything that touches production (releases, database migrations, nginx, systemd, cron, DNS,
  cloud accounts, published packages) needs explicit owner approval in the conversation first.
  Agents prepare the change and the runbook; an owner runs or approves it.
- Ask before any irreversible or outward-facing action: deleting data or branches, publishing,
  changing repository settings, creating credentials.

### Content rules

- No em dash (U+2014) in code, docs, commits or product copy. Use " - " or rewrite.
- Do not invent product specs. Kit contents, part lists and measurements come from the source
  data (BOM, catalog) or from an owner.
- Retired brand and product terms must not appear anywhere. The list is kept in the platform
  repository's `CLAUDE.md`.
