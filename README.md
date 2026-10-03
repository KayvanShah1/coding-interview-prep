# CoreTrail

A dark Jekyll site for technical interview revision across data, AI, machine learning, software engineering, and related systems.

**Read it:** https://kayvanshah1.github.io/coding-interview-prep/

## Structure

- The root landing page routes into subject-specific trails.
- SQL currently has 65 topic pages across 14 chapters, plus chapter overviews.
- Data Modeling, Data Engineering, Machine Learning, AI Engineering, System Design, and DSA have overview routes ready for future material.
- Expandable navigation, page outlines, and full-text search with Ctrl/Cmd K.
- Copyable SQL, expandable answers, problem filters, and an interactive window-frame explorer.
- PostgreSQL-first SQL examples with selected BigQuery/MySQL differences.

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
