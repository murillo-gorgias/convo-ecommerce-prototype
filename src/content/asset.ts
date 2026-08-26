/**
 * Resolves a public-folder asset against the site's base path, so images and
 * media load whether the prototype is served from the root or a subdirectory.
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
