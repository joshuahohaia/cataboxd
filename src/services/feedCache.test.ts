// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  isCacheStale,
  getCachedMovies,
  setCachedMovies,
  clearCachedMovies,
  CACHE_DURATION,
} from './feedCache';

describe('isCacheStale', () => {
  it('treats a missing timestamp as stale', () => {
    expect(isCacheStale(null)).toBe(true);
  });

  it('treats a fresh timestamp as not stale', () => {
    const now = 1_000_000;
    expect(isCacheStale(now - 1000, now)).toBe(false);
  });

  it('treats a timestamp exactly at the boundary as not stale', () => {
    const now = 1_000_000;
    expect(isCacheStale(now - CACHE_DURATION, now)).toBe(false);
  });

  it('treats a timestamp past the boundary as stale', () => {
    // Regression guard for the revalidation fix: this is what the focus and
    // interval checks rely on to refresh an app left open past the TTL.
    const now = 1_000_000;
    expect(isCacheStale(now - CACHE_DURATION - 1, now)).toBe(true);
  });
});

describe('cached movies round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing is cached', () => {
    expect(getCachedMovies()).toBeNull();
  });

  it('returns movies stored within the TTL', () => {
    const movies = [{ id: '1', filmTitle: 'Test', filmYear: 2024 }];
    setCachedMovies(movies as never);
    expect(getCachedMovies()).toEqual(movies);
  });

  it('expires movies older than the TTL', () => {
    const movies = [{ id: '1', filmTitle: 'Test', filmYear: 2024 }];
    setCachedMovies(movies as never);
    const past = Date.now() - CACHE_DURATION - 1000;
    localStorage.setItem('cataboxd_cache_time', past.toString());
    expect(getCachedMovies()).toBeNull();
  });

  it('clears the cache', () => {
    setCachedMovies([{ id: '1' }] as never);
    clearCachedMovies();
    expect(getCachedMovies()).toBeNull();
  });
});
