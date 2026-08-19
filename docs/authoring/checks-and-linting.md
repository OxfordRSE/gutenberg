---
title: Checks and Linting
permalink: /authoring/checks-and-linting/
parent: Writing Course Material
nav_order: 5
---

Course material goes through several automated checks before merging — some run in the material repo's own CI, one runs against the built Gutenberg app.

## Frontmatter lint

Checks that each `index.md`/section's YAML frontmatter is well-formed and has the fields its level expects (see [Structure and Metadata]({{ "/authoring/structure-and-metadata/" | relative_url }})). This runs as a custom GitHub Action and, since it isn't a standalone CLI tool, can currently only be run locally with [`act`](https://github.com/nektos/act).

## Markdownlint

Checks the material is consistently formatted. Run it yourself with:

```bash
markdownlint '**/*.md' --ignore '*/*/slides/*' --ignore README.md
```

## Python code check

Stitches every Python code block in a section together into one `.py` file and lints it, to catch code that wouldn't actually run. There's no standalone CLI for this either — run it locally with `act`. There's no equivalent check for other languages (e.g. C++), since stitching together a non-interpreted language isn't straightforward.

## Non-ASCII characters in code blocks

Fenced code blocks are checked for stray non-ASCII characters — smart quotes, invisible unicode — that can silently break example code when copy-pasted from elsewhere. `text` and `output` blocks are exempt, since they often hold real terminal output. If a block genuinely needs a non-ASCII character, mark it explicitly:

```python allow-non-ascii
name = "café"
```

Run it manually with:

```bash
python3 .github/scripts/check_ascii_codeblocks.py
```

## Link-checking

Runs against the fully built Next.js app rather than the material repo alone, so it lives in Gutenberg's own CI instead of the material repo's. To run it manually, clone Gutenberg, then either:

**via `act`:**

```bash
yarn pullmat
cd .material/HPCu
git checkout <your-branch>
cd ../..
act -j check-links
```

**or via a plain broken-link checker**, after building and starting the app:

```bash
yarn build
yarn start &
npm install -g broken-link-checker
```

Copy the current `broken-link-checker` command, including its exclusions, from
the [`check-links` job in Gutenberg's CI](https://github.com/OxfordRSE/gutenberg/blob/main/.github/workflows/test.yml).

> **Note:** the exclusions are maintained alongside the CI job because some sites reject automated requests or rate-limit the checker. Links to excluded sites aren't checked automatically, so double-check them yourself. If your frontmatter uses a relative URL for an attribution image, you may also need to exclude a duplicate of the course name (e.g. `essential_maths/essential_maths/`) — an artifact of how relative URLs resolve on the `/diagram` page; the same link is still checked correctly on the course's own page.

Because link-checking isn't part of the material repo's own CI, broken links should be caught by Gutenberg's CI/CD before a material change reaches production — but it's worth running locally if you've added links you're unsure about.
