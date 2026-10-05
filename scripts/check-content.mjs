import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const pages = walk('_sql').filter((p) => p.endsWith('.md'));
const urls = new Set(
  pages.map(
    (p) =>
      '/sql/' +
      p
        .replaceAll('\\', '/')
        .replace(/^_sql\//, '')
        .replace(/\.md$/, '') +
      '/',
  ),
);
urls.add('/sql/');
urls.add('/dsa/');
urls.add('/');
const sequences = new Set();
for (const file of pages) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, 'front matter ' + file);
  const data = YAML.parse(match[1]);
  for (const key of ['title', 'description', 'chapter', 'order', 'sequence'])
    assert.notEqual(data[key], undefined, key + ' ' + file);
  assert.ok(!sequences.has(data.sequence), 'duplicate sequence ' + file);
  sequences.add(data.sequence);
  assert.equal((match[2].match(/^```/gm) || []).length % 2, 0, 'code fences ' + file);
  assert.ok(match[2].length > 150, 'empty page ' + file);
  for (const link of text.matchAll(/'((?:\/sql\/)[^']*)'\s*\|\s*relative_url/g))
    assert.ok(urls.has(link[1]), 'missing internal URL ' + link[1] + ' ' + file);
  assert.ok(!/TODO|Lorem ipsum/.test(text), 'unfinished text ' + file);
}
console.log(
  `Content checks passed: ${pages.length} SQL pages, unique ordering, links, and code fences.`,
);
const chapters = JSON.parse(fs.readFileSync('_data/chapters.json', 'utf8'));
const subjects = JSON.parse(fs.readFileSync('_data/subjects.json', 'utf8'));
for (const subject of subjects) {
  urls.add(subject.url);
  assert.ok(
    fs.existsSync(subject.url.slice(1) + 'index.' + (subject.id === 'sql' ? 'html' : 'md')),
    'subject page ' + subject.id,
  );
}
for (const chapter of chapters) {
  const overview = fs.readFileSync('_sql/' + chapter.id + '/overview.md', 'utf8');
  assert.ok(overview.includes('Suggested route:'), 'chapter reading route ' + chapter.id);
  assert.ok(overview.includes('By the end:'), 'chapter outcome ' + chapter.id);
  for (const file of pages.filter(
    (p) =>
      p.replaceAll('\\', '/').startsWith('_sql/' + chapter.id + '/') && !p.endsWith('overview.md'),
  )) {
    const slug = path.basename(file, '.md');
    assert.ok(
      overview.includes('/sql/' + chapter.id + '/' + slug + '/'),
      'lesson missing from chapter ' + file,
    );
  }
}
const problems = JSON.parse(fs.readFileSync('_data/practice_problems.json', 'utf8'));
const allowedHosts = new Set(['platform.stratascratch.com', 'leetcode.com', 'datalemur.com']);
for (const problem of problems) {
  assert.ok(allowedHosts.has(new URL(problem.url).hostname), 'practice URL ' + problem.title);
  assert.ok(urls.has(problem.lesson), 'practice concept link ' + problem.title);
  for (const key of ['title', 'platform', 'level', 'topic', 'focus'])
    assert.ok(problem[key], 'practice metadata ' + key);
}
for (const file of [
  'index.html',
  'sql/index.html',
  ...subjects.filter((s) => s.id !== 'sql').map((s) => s.id + '/index.md'),
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const link of text.matchAll(/{{\s*'((?:\/)[^']*)'\s*\|\s*relative_url/g))
    assert.ok(urls.has(link[1]), 'missing page route ' + link[1]);
}
console.log(
  `Navigation checks passed: ${chapters.length} chapter indexes, ${subjects.length} subject routes, ${problems.length} platform problems.`,
);
