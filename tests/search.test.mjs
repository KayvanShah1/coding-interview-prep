import assert from 'node:assert/strict';
import test from 'node:test';
import { searchLessons, searchSnippet, searchTerms } from '../assets/js/search.js';

const pages = [
  {
    title: 'Dates, intervals & timezones',
    description: 'Define calendar periods correctly.',
    content: 'Check the preceding calendar day before comparing dates.',
    url: '/sql/dates/',
  },
  {
    title: 'LATERAL and per-row subqueries',
    description: 'Evaluate a subquery for each preceding FROM row.',
    content: 'Use a lateral join to find the latest orders for each customer.',
    url: '/sql/lateral/',
  },
  {
    title: 'Window frames',
    description: 'Choose which rows participate in a calculation.',
    content:
      'ROWS BETWEEN 2 PRECEDING AND CURRENT ROW. ' +
      'UNBOUNDED PRECEDING includes every earlier row. ' +
      'Use 3 PRECEDING AND 1 PRECEDING to exclude the current row.',
    url: '/sql/frames/',
  },
];

test('focused content outranks incidental content and description mentions', () => {
  assert.equal(searchLessons(pages, 'preceding')[0].title, 'Window frames');
});

test('exact titles outrank repeated body matches', () => {
  const result = searchLessons(
    [
      { title: 'Overview', content: 'LAG '.repeat(50), url: '/overview/' },
      { title: 'LAG', content: 'Compare a row with its predecessor.', url: '/lag/' },
    ],
    'LAG',
  );
  assert.equal(result[0].url, '/lag/');
});

test('all query terms must match, including terms split across title and body', () => {
  assert.deepEqual(
    searchLessons(pages, 'window preceding').map((p) => p.url),
    ['/sql/frames/'],
  );
  assert.deepEqual(searchLessons(pages, 'window nonexistent'), []);
});

test('prefixes work while typing, but arbitrary substrings do not match', () => {
  assert.equal(searchLessons(pages, 'preced')[0].url, '/sql/frames/');
  assert.deepEqual(
    searchLessons([{ title: 'Flags', content: 'A flag column.', url: '/flags/' }], 'lag'),
    [],
  );
});

test('SQL punctuation, case, and repeated query terms are normalized', () => {
  assert.deepEqual(searchTerms('COUNT(*) count PRECEDING'), ['count', 'preceding']);
  assert.deepEqual(searchLessons(pages, '  '), []);
  assert.deepEqual(searchLessons(pages, '() *'), []);
});

test('ties are stable regardless of source reading order', () => {
  const tied = [
    { title: 'Beta', content: 'preceding row', url: '/beta/' },
    { title: 'Alpha', content: 'preceding row', url: '/alpha/' },
  ];
  assert.deepEqual(
    searchLessons(tied, 'preceding'),
    searchLessons([...tied].reverse(), 'preceding'),
  );
});

test('content matches display the matching passage instead of an unrelated description', () => {
  const snippet = searchSnippet(pages[2], ['preceding']);
  assert.match(snippet, /PRECEDING/);
  assert.notEqual(snippet, pages[2].description);
});

test('snippets favor a passage covering multiple terms and preserve literal code', () => {
  const content =
    'An earlier row. ' +
    'Context. '.repeat(35) +
    'ROWS BETWEEN 2 PRECEDING AND CURRENT ROW; value < 10.';
  const snippet = searchSnippet({ content }, ['rows', 'preceding']);
  assert.match(snippet, /ROWS BETWEEN 2 PRECEDING/);
  assert.match(snippet, /value < 10/);
  assert.ok(snippet.startsWith('…'));
  assert.equal(
    searchSnippet({ description: 'A title-only match.' }, ['lag']),
    'A title-only match.',
  );
});
