# probot-docs

Public documentation site for the Probot robot kit and the `probot-core` library (ESP32-S3,
Arduino / ESP-IDF). Built with MkDocs and a custom theme. The page content is Turkish; this
README and all engineering text are English.

Live site: https://docs.probotstudio.com (also served at https://probotstudio.com/docs/).

## Local preview

There is no requirements file. Install what CI installs:

```bash
python -m venv .venv && . .venv/bin/activate
pip install mkdocs mkdocs-material mkdocs-rss-plugin pymdown-extensions
mkdocs serve -a 0.0.0.0:8000     # http://localhost:8000
mkdocs build --strict            # validate; warnings fail the build
```

Use a full git clone (the RSS plugin reads git history). The shared header and footer load from
`https://probotstudio.com`, so previews need network access.

## Layout

```
docs/                 Markdown pages (Turkish), assets/, stylesheets/
theme/main.html       Page template
mkdocs.yml            Site configuration, navigation, library version (extra.core_version)
mkdocs.prod.yml       Production overlay (path build under /docs/)
.github/workflows/    Strict build on push to dev
```

Error code pages (`docs/hatalar.md`, anchors such as `#pb-e101`) are linked from the product,
serial output and telemetry. Do not rename them or their anchors.

## Branches and release

`dev` is the trunk and `stable` is the release branch. Branch from `dev`, open a PR into `dev`,
and make sure `mkdocs build --strict` passes. Promoting `dev` to `stable` needs owner approval.
The platform monorepo includes this repository as a submodule and bumps its pin separately.

## More

Read [CLAUDE.md](CLAUDE.md) before contributing: it covers public URL contracts, the version
badge, writing rules and the organization engineering standards.
