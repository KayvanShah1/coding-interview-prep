export function searchTerms(query) {
  return [...new Set(query.toLowerCase().match(/[\p{L}\p{N}_]+/gu) || [])];
}

function fieldTerms(value) {
  if (Array.isArray(value)) return searchTerms(value.join(' '));
  return searchTerms(value || '');
}

export function searchLessons(pages, query) {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  const phrase = terms.join(' ');

  return pages
    .map((page) => {
      const title = fieldTerms(page.title);
      const description = fieldTerms(page.description);
      const aliases = fieldTerms(page.aliases);
      const keywords = fieldTerms(page.keywords);
      const tools = fieldTerms(page.tools);
      const interview = fieldTerms(page.interview_queries);
      const words = (page.content || '').toLowerCase().match(/[\p{L}\p{N}_]+/gu) || [];
      const searchable = [
        ...title,
        ...description,
        ...aliases,
        ...keywords,
        ...tools,
        ...interview,
        ...words,
      ];
      let score = 0;

      for (const term of terms) {
        const exact = searchable.includes(term);
        const matches = (word) => (exact ? word === term : word.startsWith(term));
        const titleMatch = title.some(matches);
        const descriptionMatch = description.some(matches);
        const aliasMatch = aliases.some(matches);
        const keywordMatch = keywords.some(matches);
        const toolMatch = tools.some(matches);
        const interviewMatch = interview.some(matches);
        const count = words.filter(matches).length;
        if (
          !titleMatch &&
          !descriptionMatch &&
          !aliasMatch &&
          !keywordMatch &&
          !toolMatch &&
          !interviewMatch &&
          !count
        )
          return null;

        // Repeated body mentions saturate quickly. Explicit retrieval metadata is
        // intentionally stronger than an incidental mention in a long page.
        const contentScore = (10 * count) / (count + 1.2 * (0.25 + (0.75 * words.length) / 500));
        score +=
          ((titleMatch ? 18 : 0) +
            (aliasMatch ? 14 : 0) +
            (toolMatch ? 10 : 0) +
            (keywordMatch ? 8 : 0) +
            (interviewMatch ? 5 : 0) +
            (descriptionMatch ? 3 : 0) +
            contentScore) *
          (exact ? 1 : 0.6);
      }

      if (title.join(' ') === phrase) score += 12;
      if (terms.length > 1 && page.title.toLowerCase().includes(phrase)) score += 8;
      if ((page.aliases || []).some((alias) => alias.toLowerCase() === phrase)) score += 10;
      return { ...page, score };
    })
    .filter(Boolean)
    .sort(
      (a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.url.localeCompare(b.url),
    )
    .slice(0, 18);
}

export function searchSnippet(page, terms) {
  const content = (page.content || '').replace(/\s+/g, ' ').trim();
  const matches = [...content.matchAll(/[\p{L}\p{N}_]+/gu)].filter((match) =>
    terms.some((term) => match[0].toLowerCase().startsWith(term)),
  );
  if (!matches.length) return page.description || '';

  let best = matches[0];
  let bestCoverage = 0;
  for (const match of matches) {
    const window = content.slice(Math.max(0, match.index - 60), match.index + 130).toLowerCase();
    const coverage = terms.filter((term) => window.includes(term)).length;
    if (coverage > bestCoverage) {
      best = match;
      bestCoverage = coverage;
    }
  }
  let start = Math.max(0, best.index - 60);
  if (start) start = content.indexOf(' ', start) + 1;
  let end = Math.min(content.length, start + Math.max(190, best[0].length + 60));
  if (end < content.length) {
    const boundary = content.lastIndexOf(' ', end);
    if (boundary > best.index + best[0].length) end = boundary;
  }
  return (start ? '…' : '') + content.slice(start, end).trim() + (end < content.length ? '…' : '');
}
