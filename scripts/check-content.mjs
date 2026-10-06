import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

function parseDocument(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, 'front matter ' + file);
  return { text, data: YAML.parse(match[1]), body: match[2] };
}

const urls = new Set(['/']);
const collections = [
  { id: 'sql', dir: 'app/subjects/_sql', prefix: '/sql/' },
  { id: 'ai-engineering', dir: 'app/subjects/_ai', prefix: '/ai-engineering/' },
  { id: 'infrastructure', dir: 'app/subjects/_infra', prefix: '/infrastructure/' },
];

const chapters = JSON.parse(fs.readFileSync('app/_data/chapters.json', 'utf8'));
const subjectChapters = JSON.parse(fs.readFileSync('app/_data/subject_chapters.json', 'utf8'));
const subjects = JSON.parse(fs.readFileSync('app/_data/subjects.json', 'utf8'));

for (const subject of subjects) urls.add(subject.url);

const collectionPages = new Map();
for (const collection of collections) {
  const pages = walk(collection.dir).filter((p) => p.endsWith('.md'));
  collectionPages.set(collection.id, pages);
  const sequences = new Set();
  const validChapters =
    collection.id === 'sql'
      ? new Set(chapters.map((c) => c.id))
      : new Set(subjectChapters[collection.id].map((c) => c.id));

  for (const file of pages) {
    const relative = path
      .relative(collection.dir, file)
      .replaceAll('\\', '/')
      .replace(/\.md$/, '');
    urls.add(collection.prefix + relative + '/');

    const { text, data, body } = parseDocument(file);
    for (const key of ['title', 'description', 'chapter', 'order', 'sequence'])
      assert.notEqual(data[key], undefined, key + ' ' + file);
    assert.ok(validChapters.has(data.chapter), 'unknown chapter ' + data.chapter + ' ' + file);
    assert.ok(!sequences.has(data.sequence), 'duplicate sequence ' + collection.id + ' ' + file);
    sequences.add(data.sequence);
    assert.equal((body.match(/^\`\`\`/gm) || []).length % 2, 0, 'code fences ' + file);
    assert.ok(body.length > 150, 'empty page ' + file);
    assert.ok(!/TODO|Lorem ipsum/.test(text), 'unfinished text ' + file);
  }

  console.log(
    `Content checks passed: ${pages.length} ${collection.id} pages, unique ordering, chapters, and code fences.`,
  );
}

// Public subject and standalone pages live outside underscore-prefixed collections.
const standalonePages = walk('app/subjects').filter(
  (p) => p.endsWith('.md') && !p.replaceAll('\\', '/').includes('/_'),
);
for (const file of standalonePages) {
  const { data } = parseDocument(file);
  if (data.permalink) urls.add(data.permalink);
}

const subjectPages = subjects.map((subject) =>
  subject.id === 'sql' ? 'app/subjects/_sql/index.html' : `app/subjects/${subject.id}/index.md`,
);
for (const file of subjectPages) assert.ok(fs.existsSync(file), 'subject page ' + file);

for (const chapter of chapters) {
  const overview = fs.readFileSync('app/subjects/_sql/' + chapter.id + '/overview.md', 'utf8');
  for (const file of collectionPages.get('sql').filter(
    (p) =>
      p.replaceAll('\\', '/').startsWith('app/subjects/_sql/' + chapter.id + '/') &&
      !p.endsWith('overview.md'),
  )) {
    const slug = path.basename(file, '.md');
    assert.ok(
      overview.includes('/sql/' + chapter.id + '/' + slug + '/'),
      'lesson missing from SQL chapter ' + file,
    );
  }
}

for (const subjectId of ['ai-engineering', 'infrastructure']) {
  const dir = subjectId === 'ai-engineering' ? 'app/subjects/_ai' : 'app/subjects/_infra';
  const prefix = subjectId === 'ai-engineering' ? '/ai-engineering/' : '/infrastructure/';
  for (const chapter of subjectChapters[subjectId]) {
    const overviewPath = dir + '/' + chapter.id + '/overview.md';
    assert.ok(fs.existsSync(overviewPath), 'chapter overview ' + overviewPath);
    const overview = fs.readFileSync(overviewPath, 'utf8');
    for (const file of collectionPages.get(subjectId).filter(
      (p) =>
        p.replaceAll('\\', '/').startsWith(dir + '/' + chapter.id + '/') &&
        !p.endsWith('overview.md'),
    )) {
      const slug = path.basename(file, '.md');
      assert.ok(
        overview.includes(prefix + chapter.id + '/' + slug + '/'),
        'lesson missing from chapter overview ' + file,
      );
    }
  }
}

const problems = JSON.parse(fs.readFileSync('app/_data/practice_problems.json', 'utf8'));
const allowedHosts = new Set(['platform.stratascratch.com', 'leetcode.com', 'datalemur.com']);
for (const problem of problems) {
  assert.ok(allowedHosts.has(new URL(problem.url).hostname), 'practice URL ' + problem.title);
  assert.ok(urls.has(problem.lesson), 'practice concept link ' + problem.title);
  for (const key of ['title', 'platform', 'level', 'topic', 'focus'])
    assert.ok(problem[key], 'practice metadata ' + key);
}

// Check authored relative_url links across published content and landing pages.
const linkedFiles = [
  'app/index.html',
  ...subjectPages,
  ...standalonePages,
  ...collections.flatMap((collection) => collectionPages.get(collection.id)),
];
for (const file of new Set(linkedFiles)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const link of text.matchAll(/{{\s*'((?:\/)[^']*)'\s*\|\s*relative_url/g))
    assert.ok(urls.has(link[1]), 'missing page route ' + link[1] + ' in ' + file);
}

console.log(
  `Navigation checks passed: ${subjects.length} subjects, ${urls.size} known routes, ${problems.length} platform problems.`,
);
