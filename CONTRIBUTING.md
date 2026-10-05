# Writing a lesson

Keep each page focused on one concept or a closely related comparison. Include input assumptions, an explanation, a query, expected output or interpretation, and an edge case.

Create `app/subjects/_sql/<chapter>/<slug>.md` with front matter containing `title`, `description`, `chapter`, `order`, `sequence`, and `level`. Optional `references` is an array of title/url objects. The chapter index in `app/_data/chapters.json` multiplied by 100 plus `order` gives the sequence convention. Overviews use order 0.

Use `##` headings for the automatic outline. Link internally using Jekyll's `relative_url` filter. Use `<details markdown="1"><summary>Show the answer</summary>` for expandable answers. Mark dialect differences and reference primary documentation. Do not copy platform editorials or upload third-party question PDFs into the site.

Run `npm test` and `bundle exec jekyll build`. Add meaningful result checks in `scripts/test-sql.mjs` for tricky examples. The practice fixture is `app/assets/sql/sample-data.sql`.

The SQL landing page is `app/subjects/_sql/index.html`; its explicit permalink keeps it at `/sql/`. Only documents with a `sequence` participate in lesson pagination. Planned subjects live in `app/subjects/<subject>/index.md` with explicit public permalinks.

## Templates and styles

`app/templates/layouts/base.html` owns the document shell, shared head, skip link, and search dialog. The home and handbook layouts inherit it; lesson and planned-subject layouts inherit the handbook layout in `default.html`.

Reusable markup lives in `app/templates/includes/`: brand, header, home footer, sidebar, subject switcher, and page outline. Keep the lesson's edit-page footer in its lesson layout. Subjects and chapters remain in `app/_data/*.json`. The root `_config.yml` sets `source: app` and points Jekyll to the template folders; run build and serve commands from the repository root.

Edit styles in `app/_sass/`. Jekyll compiles `app/assets/css/main.scss` into the existing `/assets/css/main.css` URL. Keep the `@use` order: shared responsive rules precede home styles so their overrides retain the existing cascade.

Use the color variables in `app/_sass/_theme.scss` for both light and dark themes. Theme selection runs before styles load in `app/assets/js/theme.js`; search ranking and matching excerpts live in `app/assets/js/search.js`, with regression checks in `tests/search.test.mjs`.

## Formatting

Run `npm run format` to apply Prettier or `npm run format:check` to check formatting. CI runs the same check. HTML and the search-index template use the Liquid plugin; JavaScript, JSON, SCSS partials, YAML, and repository documentation use Prettier's built-in parsers.

Authored lesson and subject Markdown is excluded to preserve embedded Liquid, SQL examples, and prose. The SCSS entry point is also excluded because its Jekyll front matter is not valid SCSS; its styles live in the formatted partials.
