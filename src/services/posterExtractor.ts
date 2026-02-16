export function extractPosterUrl(htmlContent: string): string {
  if (!htmlContent) return '';

  // The description contains HTML with an img tag
  // Example: <img src="https://a.ltrbxd.com/resized/...jpg"/>
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);

  if (imgMatch && imgMatch[1]) {
    // Letterboxd uses resized images, return as-is or modify for larger size
    return imgMatch[1];
  }

  return '';
}

export function extractReviewText(htmlContent: string): string {
  if (!htmlContent) return '';

  // Remove img tags
  const withoutImg = htmlContent.replace(/<img[^>]*>/gi, '');

  // Extract text from paragraph tags
  const paragraphs = withoutImg.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);

  if (paragraphs) {
    return paragraphs
      .map((p) => p.replace(/<[^>]+>/g, '').trim())
      .filter((text) => text.length > 0)
      .join('\n\n');
  }

  // Fallback: strip all HTML and return
  return withoutImg.replace(/<[^>]+>/g, '').trim();
}

export function extractTitleFromTitle(title: string): string {
  // Title format: "Film Name, Year - Rating"
  const match = title.match(/^(.+?),\s*\d{4}/);
  return match ? match[1].trim() : title;
}

export function extractYearFromTitle(title: string): number {
  // Title format: "Film Name, Year - Rating"
  const match = title.match(/,\s*(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}
