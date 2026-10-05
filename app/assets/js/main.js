import { searchLessons, searchSnippet, searchTerms } from './search.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
// Build the page outline from actual headings, never from a separately maintained list.
const headings = $$('.prose h2');
const used = new Set();
headings.forEach((h, i) => {
  if (!h.id)
    h.id = h.textContent
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  if (used.has(h.id)) h.id += '-' + i;
  used.add(h.id);
  for (const nav of [$('#toc'), $('#mobile-toc')]) {
    if (!nav) continue;
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    nav.append(a);
  }
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        $$('#toc a').forEach((a) => a.classList.toggle('active', a.hash === '#' + e.target.id));
      }
    },
    { rootMargin: '-5% 0px -70% 0px' },
  );
  headings.forEach((h) => observer.observe(h));
}
$$('.prose table').forEach((t) => {
  const w = document.createElement('div');
  w.className = 'table-scroll';
  w.tabIndex = 0;
  w.setAttribute('role', 'region');
  w.setAttribute('aria-label', 'Scrollable example table');
  t.before(w);
  w.append(t);
});
$$('.highlighter-rouge').forEach((block) => {
  const code = $('pre code', block);
  if (!code) return;
  const bar = document.createElement('div');
  bar.className = 'code-toolbar';
  const label = document.createElement('span');
  label.textContent = block.className.match(/language-([\w-]+)/)?.[1]?.toUpperCase() || 'CODE';
  const b = document.createElement('button');
  b.className = 'copy-code';
  b.type = 'button';
  b.textContent = 'Copy';
  b.setAttribute('aria-label', 'Copy code');
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      b.textContent = 'Copied';
      setTimeout(() => (b.textContent = 'Copy'), 1800);
    } catch {
      b.textContent = 'Select to copy';
      const s = window.getSelection();
      const r = document.createRange();
      r.selectNodeContents(code);
      s.removeAllRanges();
      s.addRange(r);
    }
  });
  bar.append(label, b);
  block.prepend(bar);
});
const navButton = $('#nav-toggle'),
  scrim = $('.nav-scrim');
function closeNav() {
  document.body.classList.remove('nav-open');
  navButton?.setAttribute('aria-expanded', 'false');
  if (scrim) scrim.hidden = true;
  document.body.style.overflow = '';
}
navButton?.addEventListener('click', () => {
  const open = !document.body.classList.contains('nav-open');
  document.body.classList.toggle('nav-open', open);
  navButton.setAttribute('aria-expanded', String(open));
  scrim.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
});
scrim?.addEventListener('click', closeNav);
const dialog = $('#search-dialog'),
  input = $('#search-input'),
  results = $('#search-results');
let searchData = null;
let loading = null;
let searchRequest = 0;
async function getSearch() {
  if (searchData) return searchData;
  if (!loading)
    loading = fetch(document.body.dataset.baseurl + '/search.json')
      .then((r) => {
        if (!r.ok) throw Error('Search unavailable');
        return r.json();
      })
      .then((pages) => {
        // The index strips tags, but Markdown's HTML entities still need decoding.
        const decoder = document.createElement('textarea');
        searchData = pages.map((page) => {
          decoder.innerHTML = page.content;
          return { ...page, content: decoder.value };
        });
        return searchData;
      })
      .catch((e) => {
        loading = null;
        throw e;
      });
  return loading;
}
function message(s) {
  results.replaceChildren();
  const p = document.createElement('p');
  p.className = 'search-message';
  p.textContent = s;
  results.append(p);
}
function highlightMatches(element, text, terms) {
  let end = 0;
  for (const match of text.matchAll(/[\p{L}\p{N}_]+/gu)) {
    if (!terms.some((term) => match[0].toLowerCase().startsWith(term))) continue;
    element.append(document.createTextNode(text.slice(end, match.index)));
    const mark = document.createElement('mark');
    mark.textContent = match[0];
    element.append(mark);
    end = match.index + match[0].length;
  }
  element.append(document.createTextNode(text.slice(end)));
}
async function runSearch() {
  const request = ++searchRequest;
  const q = input.value.trim().toLowerCase();
  if (!q) {
    results.setAttribute('aria-busy', 'false');
    message('Type a concept, keyword, or function.');
    return;
  }
  results.setAttribute('aria-busy', 'true');
  message('Searching…');
  try {
    const data = await getSearch();
    if (request !== searchRequest) return;
    const terms = searchTerms(q);
    const matches = searchLessons(data, q);
    results.replaceChildren();
    if (!matches.length) {
      message('No matching topics. Try a function name or a shorter phrase.');
      return;
    }
    for (const p of matches) {
      const a = document.createElement('a');
      a.className = 'search-result';
      a.href = p.url;
      const strong = document.createElement('strong');
      highlightMatches(strong, p.title, terms);
      const small = document.createElement('small');
      highlightMatches(small, searchSnippet(p, terms), terms);
      a.append(strong, small);
      results.append(a);
    }
  } catch {
    if (request === searchRequest)
      message('Search could not load. Please retry or browse the chapter navigation.');
  } finally {
    if (request === searchRequest) results.setAttribute('aria-busy', 'false');
  }
}
function openSearch() {
  closeNav();
  dialog.showModal();
  input.focus();
  getSearch().catch(() => {});
  runSearch();
}
$$('.search-open').forEach((b) => b.addEventListener('click', openSearch));
$('#search-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      dialog.close();
  }
});
input?.addEventListener('input', runSearch);
input?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    $('.search-result')?.focus();
  }
  if (e.key === 'Enter') $('.search-result')?.click();
});
results?.addEventListener('keydown', (e) => {
  const a = $$('.search-result');
  const i = a.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    a[Math.min(i + 1, a.length - 1)]?.focus();
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (i <= 0) input.focus();
    else a[i - 1].focus();
  }
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    dialog.open ? dialog.close() : openSearch();
  }
  if (e.key === 'Escape') closeNav();
});
// Tiny frame explorer: real values and exact ROWS boundaries.
$$('.frame-demo').forEach((d) => {
  const values = [10, 20, 30, 40, 50];
  const row = $('input', d),
    mode = $('select', d),
    grid = $('.frame-grid', d),
    out = $('.frame-output', d);
  function update() {
    const current = Number(row.value);
    const bounds =
      mode.value === 'trailing'
        ? [current - 2, current]
        : mode.value === 'following'
          ? [current, current + 2]
          : mode.value === 'previous'
            ? [current - 3, current - 1]
            : [0, current];
    const lo = Math.max(0, bounds[0]),
      hi = Math.min(4, bounds[1]);
    let sum = 0,
      n = 0;
    grid.replaceChildren();
    values.forEach((v, i) => {
      const inFrame = i >= lo && i <= hi;
      const el = document.createElement('div');
      el.className =
        'frame-cell' + (inFrame ? ' in-frame' : '') + (i === current ? ' current' : '');
      el.innerHTML = '<small>Row ' + (i + 1) + '</small>' + v;
      grid.append(el);
      if (inFrame) {
        sum += v;
        n++;
      }
    });
    out.textContent =
      'Current row: ' + (current + 1) + ' · Rows in frame: ' + n + ' · SUM = ' + (n ? sum : 'NULL');
  }
  row.addEventListener('input', update);
  mode.addEventListener('change', update);
  update();
});
const filters = $$('.practice-filter');
function filterPractice() {
  let count = 0;
  $$('.practice-item').forEach((el) => {
    const show = filters.every((f) => !f.value || el.dataset[f.dataset.field] === f.value);
    el.hidden = !show;
    if (show) count++;
  });
  const n = $('.practice-count');
  if (n) n.textContent = count + ' problems';
}
filters.forEach((f) => f.addEventListener('change', filterPractice));
if (filters.length) filterPractice();
