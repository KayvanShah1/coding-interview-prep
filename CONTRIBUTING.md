# Writing a lesson

Keep each page focused on one concept or a closely related comparison. Include input assumptions, an explanation, a query, expected output or interpretation, and an edge case.

Create `_sql/<chapter>/<slug>.md` with front matter containing `title`, `description`, `chapter`, `order`, `sequence`, and `level`. Optional `references` is an array of title/url objects. The chapter index in `_data/chapters.json` multiplied by 100 plus `order` gives the sequence convention. Overviews use order 0.

Use `##` headings for the automatic outline. Link internally using Jekyll's `relative_url` filter. Use `<details markdown="1"><summary>Show the answer</summary>` for expandable answers. Mark dialect differences and reference primary documentation. Do not copy platform editorials or upload third-party question PDFs into the site.

Run `npm test` and `bundle exec jekyll build`. Add meaningful result checks in `scripts/test-sql.mjs` for tricky examples. The practice fixture is `assets/sql/sample-data.sql`.
