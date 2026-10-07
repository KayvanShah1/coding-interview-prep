# Writing a lesson

Keep each page focused on one concept or a closely related comparison. Include input assumptions, an explanation, a query or system flow where it helps, expected behavior, and an edge case or trade-off.

SQL lessons live in `app/subjects/_sql/<chapter>/<slug>.md`. Other published subjects use the same collection pattern, for example `app/subjects/_ai/` and `app/subjects/_infra/`. Front matter for ordered lessons contains `title`, `description`, `chapter`, `order`, `sequence`, and `level`. Optional `references` is an array of title/url objects. SQL keeps its existing chapter-index × 100 sequence convention; each other subject owns a separate sequence range inside its collection.

Use `##` headings for the automatic outline. Link internally using Jekyll's `relative_url` filter. Use `<details markdown="1"><summary>Show the answer</summary>` for expandable answers. Mark implementation differences and reference primary documentation. Do not copy platform editorials or upload third-party question PDFs into the site.

## Writing style

The full writing and content philosophy lives in [`docs/WRITING_STYLE.md`](docs/WRITING_STYLE.md). Use it when deciding what belongs on a page, how deep to go, and how to phrase explanations.

Write for revision, not for course completion. Keep the technical terms people will search for, but make the surrounding prose sound like notes from someone who has had to choose, debug, or explain the concept.

Do not force every overview into the same sequence. Reuse tables and navigation patterns where consistency helps, but avoid repeated filler such as identical `Suggested route`, `By the end`, or `How to study` paragraphs. Let the topic determine the structure.

Prefer concrete questions and consequences: `What exactly are you counting?`, `What happens to the grain after this join?`, `Would this still work with a tie?`, `What evidence would justify an index?` Keep counterexamples that expose wrong-but-plausible answers.

For problem-solving pages, make the reasoning visible: **population → grain → operation → edge case → alternative**. For performance pages, use **symptom → evidence → hypothesis → verification**. For infrastructure pages, follow the request, process, or failure far enough that the next component becomes necessary instead of listing tools without a reason.

Avoid motivational filler, generic learning-objective language, fake first-person stories, stacked one-line fragments, and unnecessarily short sentence sequences. Do not simplify away searchable syntax or established terms.

## Search metadata

Search metadata exists for retrieval, not decoration. Add it when there are realistic alternate ways someone would look for a page:

- `keywords`: established related terms that are not guaranteed to appear in the title.
- `aliases`: alternate names or acronyms for the concept.
- `tools`: products or runtimes strongly associated with the page.
- `interview_queries`: a small number of natural question phrasings that should retrieve the page.

Do not use these fields as broad tags. A page about LLM autoscaling should include `HPA`, `KEDA`, `Karpenter`, `queue depth`, and `TTFT` when they are relevant; it should not add generic tags such as `AI`, `cloud`, or `production` merely to appear in more results.

The local search index consumes these fields without rendering them. The shared head also emits DocSearch-compatible `docsearch:*` metadata for subject, chapter, level, aliases, keywords, and tools. Keep heading hierarchy semantic because a future Algolia DocSearch crawler can create section-level records from the page's `h1`/`h2`/`h3` structure. `app/sitemap.xml` exposes published routes for crawlers.

Run `npm test` and `bundle exec jekyll build`. Add meaningful result checks in `scripts/test-sql.mjs` for tricky SQL examples. The practice fixture is `app/assets/sql/sample-data.sql`.

The SQL landing page is `app/subjects/_sql/index.html`; its explicit permalink keeps it at `/sql/`. Published non-SQL subjects keep their landing page in `app/subjects/<subject>/index.md` and lessons in the configured Jekyll collection. Only documents with a `sequence` participate in lesson pagination.

## Templates and styles

`app/templates/layouts/base.html` owns the document shell, shared head, skip link, and search dialog. The home and handbook layouts inherit it; lesson and subject layouts inherit the handbook layout in `default.html`.

Reusable markup lives in `app/templates/includes/`: brand, header, home footer, sidebar, subject switcher, and page outline. Keep the lesson's edit-page footer in its lesson layout. Subjects live in `app/_data/subjects.json`; SQL chapters remain in `chapters.json`, while published non-SQL chapter maps live in `subject_chapters.json`. The root `_config.yml` sets `source: app` and points Jekyll to the template folders; run build and serve commands from the repository root.

Edit styles in `app/_sass/`. Jekyll compiles `app/assets/css/main.scss` into the existing `/assets/css/main.css` URL. Keep the `@use` order: shared responsive rules precede home styles so their overrides retain the existing cascade.

Use the color variables in `app/_sass/_theme.scss` for both light and dark themes. Theme selection runs before styles load in `app/assets/js/theme.js`; search ranking and matching excerpts live in `app/assets/js/search.js`, with regression checks in `tests/search.test.mjs`.

## Diagrams and icons

Use Mermaid for ordered processes and relationships that benefit from a diagram. Set `mermaid: true` in the page's front matter, capture the Mermaid source and a Markdown text version, and pass both to `diagram.html` with `title`, `code`, and `fallback`. Add `caption=true` when the diagram needs a visible title.

Prefer repository-authored diagrams when the goal is to explain a mental model. If an external architecture figure is genuinely more useful, use an official source, add a visible source credit beside the figure, and include the source in `references`. Do not copy decorative vendor images merely to fill space.

Use `flowchart LR` for flows; the renderer switches to a vertical layout when space is limited and redraws when the theme changes. Preserve links in both the source and the text version. Only repository-authored Mermaid diagrams are supported; use ordinary links, not JavaScript callbacks. Mermaid 11.12.0 loads from jsDelivr only on diagram pages, and the text version remains available if JavaScript or the CDN is unavailable. Diagram source is excluded from search; its text version is indexed.

Shared SVG icons live in `app/templates/includes/icons/`. Use the existing Primer Octicons includes and retain their license. Navigation links keep their text labels; arrow icons are decorative.

## Formatting

Run `npm run format` to apply Prettier or `npm run format:check` to check formatting. CI runs the same check. HTML and the search-index template use the Liquid plugin; JavaScript, JSON, SCSS partials, YAML, and repository documentation use Prettier's built-in parsers.

Authored lesson and subject Markdown is excluded to preserve embedded Liquid, SQL examples, and prose. The SCSS entry point is also excluded because its Jekyll front matter is not valid SCSS; its styles live in the formatted partials.
