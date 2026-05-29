import { useMemo } from 'react';
import Fuse from 'fuse.js';

export interface AutocompleteMatchResult {
  original: string;
  highlightedHtml: string;
}

/**
 * Highlights matched characters using Fuse.js matches.
 */
function getHighlightedText(
  text: string,
  matches: readonly any[] | undefined
): string {
  if (!matches || matches.length === 0) {
    return text;
  }

  // We look for matches on the text/value key
  const match = matches[0]; // Take first match
  if (!match.indices) {
    return text;
  }

  const indices = match.indices;
  let highlighted = '';
  let lastIdx = 0;

  // Indices are sorted by start index
  for (const [start, end] of indices) {
    // Add text before match
    highlighted += text.slice(lastIdx, start);
    // Add highlighted match (using CSS tailwind classes or style)
    highlighted += `<mark class="bg-data-blue/20 text-data-blue px-0.5 rounded font-semibold">${text.slice(
      start,
      end + 1
    )}</mark>`;
    lastIdx = end + 1;
  }

  // Add remaining text
  highlighted += text.slice(lastIdx);
  return highlighted;
}

export function useAutocomplete(
  list: string[],
  query: string,
  maxResults = 6
): AutocompleteMatchResult[] {
  const fuseItems = useMemo(() => {
    return list.map((item) => ({ name: item }));
  }, [list]);

  const fuse = useMemo(() => {
    return new Fuse(fuseItems, {
      keys: ['name'],
      threshold: 0.4,
      includeMatches: true,
    });
  }, [fuseItems]);

  return useMemo(() => {
    if (!query.trim()) {
      return list.slice(0, maxResults).map((item) => ({
        original: item,
        highlightedHtml: item,
      }));
    }

    const results = fuse.search(query);
    return results.slice(0, maxResults).map((res) => {
      const original = res.item.name;
      const highlightedHtml = getHighlightedText(original, res.matches);
      return {
        original,
        highlightedHtml,
      };
    });
  }, [fuse, query, list, maxResults]);
}
