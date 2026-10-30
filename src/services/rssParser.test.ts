// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchLetterboxdFeed } from './rssParser';

const RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Letterboxd - testuser</title>
    <item>
      <title>Test Film, 2024 - ★★★★</title>
      <link>https://letterboxd.com/testuser/film/test-film/</link>
      <guid>letterboxd-watch-1</guid>
      <description>&lt;p&gt;Great film.&lt;/p&gt;</description>
    </item>
  </channel>
</rss>`;

function okResponse(body: string) {
  return { ok: true, status: 200, text: () => Promise.resolve(body) } as Response;
}

function errorResponse(status: number) {
  return { ok: false, status, text: () => Promise.resolve('') } as Response;
}

describe('fetchLetterboxdFeed proxy fallback', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses our own API route when it works, without touching proxies', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(okResponse(RSS_XML));

    const movies = await fetchLetterboxdFeed('testuser');

    expect(movies).toHaveLength(1);
    expect(movies[0].filmTitle).toBe('Test Film');
    expect(movies[0].filmYear).toBe(2024);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain('/api/rss');
  });

  it('does not call public CORS proxies when the fallback is disabled', async () => {
    // Regression: production used to silently fall back to public proxies,
    // sending the requested username through third-party services.
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(errorResponse(500));

    await expect(
      fetchLetterboxdFeed('testuser', { allowProxyFallback: false })
    ).rejects.toThrow('API returned 500');

    expect(fetch).toHaveBeenCalledTimes(1);
    const urls = (fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes('allorigins') || u.includes('codetabs') || u.includes('corsproxy'))).toBe(false);
  });

  it('falls back to a CORS proxy in local development when the API fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (String(url).includes('/api/rss')) {
        return Promise.resolve(errorResponse(404));
      }
      return Promise.resolve(okResponse(RSS_XML));
    });

    const movies = await fetchLetterboxdFeed('testuser', { allowProxyFallback: true });

    expect(movies).toHaveLength(1);
    const urls = (fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes('allorigins'))).toBe(true);
  });
});
