import sanitizeHtml from "sanitize-html";

/**
 * Cleans the input text string by removing all HTML tags (XSS protection)
 * using the industry-standard sanitize-html library.
 * The default configuration disallows all HTML tags and attributes.
 * @param value The input value to sanitize
 */
export function sanitizeString(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}
