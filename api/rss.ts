import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  const rssUrl = `https://letterboxd.com/${username}/rss/`;

  try {
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Cataboxd/1.0)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Letterboxd returned ${response.status}`
      });
    }

    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).send(xml);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch RSS feed'
    });
  }
}
