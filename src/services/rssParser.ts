import Parser from 'rss-parser';
import type { Movie } from '../types/movie';
import {
  extractPosterUrl,
  extractReviewText,
  extractTitleFromTitle,
  extractYearFromTitle,
} from './posterExtractor';

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

const LETTERBOXD_RSS = 'https://letterboxd.com/joshaia/rss/';

interface LetterboxdItem {
  title?: string;
  link?: string;
  guid?: string;
  content?: string;
  'content:encoded'?: string;
  filmTitle?: string;
  filmYear?: string;
  memberRating?: string;
  watchedDate?: string;
  rewatch?: string;
  memberLike?: string;
}

// Configure parser for Letterboxd's custom fields
const parser: Parser<unknown, LetterboxdItem> = new Parser({
  customFields: {
    item: [
      ['letterboxd:filmTitle', 'filmTitle'],
      ['letterboxd:filmYear', 'filmYear'],
      ['letterboxd:memberRating', 'memberRating'],
      ['letterboxd:watchedDate', 'watchedDate'],
      ['letterboxd:rewatch', 'rewatch'],
      ['letterboxd:memberLike', 'memberLike'],
    ],
  },
});

async function fetchWithFallback(url: string): Promise<string> {
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url));
      if (response.ok) {
        return await response.text();
      }
    } catch {
      continue;
    }
  }
  throw new Error('All CORS proxies failed');
}

export async function fetchLetterboxdFeed(): Promise<Movie[]> {
  const xmlContent = await fetchWithFallback(LETTERBOXD_RSS);
  const feed = await parser.parseString(xmlContent);

  return feed.items
    .filter((item) => {
      // Filter out list entries (they don't have filmTitle)
      return item.filmTitle || item.title?.match(/^\w+.*,\s*\d{4}/);
    })
    .map((item) => {
      const htmlContent = item.content || item['content:encoded'] || '';

      return {
        id: item.guid || item.link || crypto.randomUUID(),
        filmTitle: item.filmTitle || extractTitleFromTitle(item.title || ''),
        filmYear: parseInt(item.filmYear || '0') || extractYearFromTitle(item.title || ''),
        memberRating: parseFloat(item.memberRating || '0') || 0,
        posterUrl: extractPosterUrl(htmlContent),
        review: extractReviewText(htmlContent),
        watchedDate: item.watchedDate || '',
        link: item.link || '',
        isRewatch: item.rewatch === 'Yes',
        isLiked: item.memberLike === 'Yes',
      };
    });
}
