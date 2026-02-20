/**
 * Converts an article title into a URL-safe slug.
 * e.g. "Ghana's 24-Hour Economy: What it Means" → "ghanas-24-hour-economy-what-it-means"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')                        // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')         // strip diacritic marks
    .replace(/[''`]/g, '')                   // remove apostrophes
    .replace(/[^a-z0-9]+/g, '-')            // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')                 // trim leading/trailing hyphens
    .slice(0, 80);                           // cap at 80 chars
}
