# Writing a lesson

Keep each page focused on one concept or a closely related comparison. Include input assumptions, an explanation, a query, expected output or interpretation, and an edge case.

Create `_sql/<chapter>/<slug>.md` with front matter containing `title`, `description`, `chapter`, `order`, `sequence`, and `level`. Optional `references` is an array of title/url objects. The chapter index in `_data/chapters.json` multiplied by 100 plus `order` gives the sequence convention. Overviews use order 0.

Use `##` headings for the automatic outline. Link internally using Jekyll's `relative_url` filter. Use `<details markdown="1"><summary>Show the answer</summary>` for expandable answers. Mark dialect differences and reference primary documentation. Do not copy platform editorials or upload third-party question PDFs into the site.

Run `npm test` and `bundle exec jekyll build`. Add meaningful result checks in `scripts/test-sql.mjs` for tricky examples. The practice fixture is `assets/sql/sample-data.sql`.

## Templates and styles

`_layouts/base.html` owns the document shell, shared head, skip link, and search dialog. The home and handbook layouts inherit it; lesson and planned-subject layouts inherit the handbook layout in `default.html`.

Reusable markup lives in `_includes/`: brand, header, home footer, sidebar, subject switcher, and page outline. Keep the lesson's edit-page footer in its lesson layout. Subjects and chapters remain in `_data/*.json`.

Edit styles in `_sass/`. Jekyll compiles `assets/css/main.scss` into the existing `assets/css/main.css` URL. Keep the `@use` order: shared responsive rules precede home styles so their overrides retain the existing cascade.

## Formatting

Run `npm run format` to apply Prettier or `npm run format:check` to check formatting. CI runs the same check. HTML and the search-index template use the Liquid plugin; JavaScript, JSON, SCSS partials, YAML, and repository documentation use Prettier's built-in parsers.

Authored lesson and subject Markdown is excluded to preserve embedded Liquid, SQL examples, and prose. The SCSS entry point is also excluded because its Jekyll front matter is not valid SCSS; its styles live in the formatted partials.
