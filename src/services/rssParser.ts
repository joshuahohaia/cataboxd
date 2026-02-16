import type { Movie } from '../types/movie';
import {
  extractPosterUrl,
  extractReviewText,
  extractTitleFromTitle,
  extractYearFromTitle,
} from './posterExtractor';

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

async function fetchWithFallback(url: string): Promise<string> {
  for (const proxy of CORS_PROXIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(proxy + encodeURIComponent(url), {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.text();
      }
    } catch {
      continue;
    }
  }
  throw new Error('Failed to fetch feed. Check the username and try again.');
}

function getTextContent(element: Element, tagName: string): string {
  const el = element.getElementsByTagName(tagName)[0];
  return el?.textContent?.trim() || '';
}

function getNamespacedContent(element: Element, namespace: string, localName: string): string {
  let el = element.getElementsByTagName(`${namespace}:${localName}`)[0];
  if (!el) {
    el = element.getElementsByTagName(localName)[0];
  }
  return el?.textContent?.trim() || '';
}

export async function fetchLetterboxdFeed(username: string): Promise<Movie[]> {
  const rssUrl = `https://letterboxd.com/${username}/rss/`;
  const xmlContent = await fetchWithFallback(rssUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid RSS feed. Check the username.');
  }

  const items = doc.querySelectorAll('item');
  const movies: Movie[] = [];

  items.forEach((item) => {
    const title = getTextContent(item, 'title');
    const link = getTextContent(item, 'link');
    const guid = getTextContent(item, 'guid');
    const description = getTextContent(item, 'description');

    const filmTitle = getNamespacedContent(item, 'letterboxd', 'filmTitle');
    const filmYear = getNamespacedContent(item, 'letterboxd', 'filmYear');
    const memberRating = getNamespacedContent(item, 'letterboxd', 'memberRating');
    const watchedDate = getNamespacedContent(item, 'letterboxd', 'watchedDate');
    const rewatch = getNamespacedContent(item, 'letterboxd', 'rewatch');
    const memberLike = getNamespacedContent(item, 'letterboxd', 'memberLike');

    // Skip list entries
    if (!filmTitle && !title.match(/^.+,\s*\d{4}/)) {
      return;
    }

    movies.push({
      id: guid || link || crypto.randomUUID(),
      filmTitle: filmTitle || extractTitleFromTitle(title),
      filmYear: parseInt(filmYear) || extractYearFromTitle(title),
      memberRating: parseFloat(memberRating) || 0,
      posterUrl: extractPosterUrl(description),
      review: extractReviewText(description),
      watchedDate: watchedDate,
      link: link,
      isRewatch: rewatch === 'Yes',
      isLiked: memberLike === 'Yes',
    });
  });

  if (movies.length === 0) {
    throw new Error('No movies found. The user may not have any logged films.');
  }

  return movies;
}
