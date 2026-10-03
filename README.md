# Querybook · Coding interview prep

A dark Jekyll handbook for learning SQL through focused lessons, worked results, and interview problems.

**Read it:** https://kayvanshah1.github.io/coding-interview-prep/

## Included

- 65 topic pages across 14 SQL chapters, plus chapter overviews.
- Expandable navigation, page outlines, and full-text search with Ctrl/Cmd K.
- Copyable SQL, expandable answers, problem filters, and an interactive window-frame explorer.
- PostgreSQL-first examples with selected BigQuery/MySQL differences.
- DSA navigation with an empty section ready for future material.

## Run locally

Requirements: Ruby with Bundler, and Node.js 22+ for checks.

```sh
bundle install
bundle exec jekyll serve --baseurl /coding-interview-prep
```

Open http://localhost:4000/coding-interview-prep/.

```sh
npm ci
npm test
```

Selected SQL results are tested through PGlite, a PostgreSQL engine. It does not emulate concurrent database sessions.

See [CONTRIBUTING.md](CONTRIBUTING.md) to add a lesson, [CONTENT_COVERAGE.md](CONTENT_COVERAGE.md) for the content map, and [VALIDATION.md](VALIDATION.md) for check scope.

## Deployment

GitHub Actions builds pull requests and pushes to main or site/**. Only successful main-branch builds deploy. Feature builds upload a site-preview artifact for review.
