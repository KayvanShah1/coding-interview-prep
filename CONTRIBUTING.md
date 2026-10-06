# Writing a lesson

Keep each page focused on one concept or a closely related comparison. Include input assumptions, an explanation, a query, expected output or interpretation, and an edge case.

Create `app/subjects/_sql/<chapter>/<slug>.md` with front matter containing `title`, `description`, `chapter`, `order`, `sequence`, and `level`. Optional `references` is an array of title/url objects. The chapter index in `app/_data/chapters.json` multiplied by 100 plus `order` gives the sequence convention. Overviews use order 0.

Use `##` headings for the automatic outline. Link internally using Jekyll's `relative_url` filter. Use `<details markdown="1"><summary>Show the answer</summary>` for expandable answers. Mark dialect differences and reference primary documentation. Do not copy platform editorials or upload third-party question PDFs into the site.

## Writing style

Write for revision, not for course completion. Keep the technical terms people will search for, but make the surrounding prose sound like notes from someone who has had to choose, debug, or explain the concept.

Do not force every overview into the same sequence. Reuse tables and navigation patterns where consistency helps, but avoid repeated filler such as identical `Suggested route`, `By the end`, or `How to study` paragraphs. Let the topic determine the structure.

Prefer concrete questions and consequences: `What exactly are you counting?`, `What happens to the grain after this join?`, `Would this still work with a tie?`, `What evidence would justify an index?` Keep counterexamples that expose wrong-but-plausible answers.

For problem-solving pages, make the reasoning visible: **population → grain → operation → edge case → alternative**. Do not name the pattern before the learner has a chance to identify it. For performance pages, use **symptom → evidence → hypothesis → verification**.

Avoid motivational filler, generic learning-objective language, fake first-person stories, and unnecessarily short sentence fragments. Do not simplify away searchable syntax such as `PRECEDING`, `FOLLOWING`, `ROWS`, `RANGE`, or `WITHIN GROUP`.

Run `npm test` and `bundle exec jekyll build`. Add meaningful result checks in `scripts/test-sql.mjs` for tricky examples. The practice fixture is `app/assets/sql/sample-data.sql`.

The SQL landing page is `app/subjects/_sql/index.html`; its explicit permalink keeps it at `/sql/`. Only documents with a `sequence` participate in lesson pagination. Planned subjects live in `app/subjects/<subject>/index.md` with explicit public permalinks.

## Templates and styles

`app/templates/layouts/base.html` owns the document shell, shared head, skip link, and search dialog. The home and handbook layouts inherit it; lesson and planned-subject layouts inherit the handbook layout in `default.html`.

Reusable markup lives in `app/templates/includes/`: brand, header, home footer, sidebar, subject switcher, and page outline. Keep the lesson's edit-page footer in its lesson layout. Subjects and chapters remain in `app/_data/*.json`. The root `_config.yml` sets `source: app` and points Jekyll to the template folders; run build and serve commands from the repository root.

Edit styles in `app/_sass/`. Jekyll compiles `app/assets/css/main.scss` into the existing `/assets/css/main.css` URL. Keep the `@use` order: shared responsive rules precede home styles so their overrides retain the existing cascade.

Use the color variables in `app/_sass/_theme.scss` for both light and dark themes. Theme selection runs before styles load in `app/assets/js/theme.js`; search ranking and matching excerpts live in `app/assets/js/search.js`, with regression checks in `tests/search.test.mjs`.

## Diagrams and icons

Use Mermaid for ordered processes and relationships that benefit from a diagram. Set `mermaid: true` in the page's front matter, capture the Mermaid source and a Markdown text version, and pass both to `diagram.html` with `title`, `code`, and `fallback`. Add `caption=true` when the diagram needs a visible title. Existing examples are in `app/subjects/_sql/index.html` and the patterns overview.

Use `flowchart LR` for flows; the renderer switches to a vertical layout when space is limited and redraws when the theme changes. Preserve links in both the source (`click A href "{{ '/sql/...' | relative_url }}" "Open lesson" _self`) and the text version. Only repository-authored diagrams are supported; use ordinary links, not JavaScript callbacks. Mermaid 11.12.0 loads from jsDelivr only on diagram pages, and the text version remains available if JavaScript or the CDN is unavailable. Diagram source is excluded from search; its text version is indexed.

Shared SVG icons live in `app/templates/includes/icons/`. Use the existing Primer Octicons includes and retain their license. Navigation links keep their text labels; arrow icons are decorative.

## Formatting

Run `npm run format` to apply Prettier or `npm run format:check` to check formatting. CI runs the same check. HTML and the search-index template use the Liquid plugin; JavaScript, JSON, SCSS partials, YAML, and repository documentation use Prettier's built-in parsers.

Authored lesson and subject Markdown is excluded to preserve embedded Liquid, SQL examples, and prose. The SCSS entry point is also excluded because its Jekyll front matter is not valid SCSS; its styles live in the formatted partials.
