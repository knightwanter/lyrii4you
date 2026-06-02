/**
 * Strict HTML sanitizer for user-generated post content (Tiptap output).
 *
 * This is an allow-list scrubber that removes anything not on the
 * Tiptap-produced safe set, plus all event handlers, javascript: urls,
 * <script>, <style>, <iframe>, <object>, <embed>, <link>, <meta>, <form>.
 *
 * For maximum safety in production, also install `sanitize-html` and swap
 * the implementation below — but this baseline kills the realistic XSS
 * vectors that come through Tiptap.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "hr",
  "a", "span", "div",
]);

const ALLOWED_ATTRS_BY_TAG: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  span: new Set(["class"]),
  div: new Set(["class"]),
  code: new Set(["class"]),
  pre: new Set(["class"]),
};

const DANGEROUS_BLOCK_TAGS = /<(script|style|iframe|object|embed|link|meta|form|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi;
const DANGEROUS_VOID_TAGS = /<(script|style|iframe|object|embed|link|meta|form|svg|math)\b[^>]*\/?>/gi;

function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  // Block javascript:, data:, vbscript: URIs
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return null;
  return trimmed;
}

function sanitizeAttributes(tagName: string, attrString: string): string {
  const allowed = ALLOWED_ATTRS_BY_TAG[tagName] ?? new Set<string>();
  const out: string[] = [];

  // Match attr="value" / attr='value' / attr=value / bare attr
  const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";

    // Strip every event handler attribute (onclick, onerror, on*)
    if (name.startsWith("on")) continue;
    if (!allowed.has(name)) continue;

    if (name === "href" || name === "src") {
      const safe = sanitizeUrl(value);
      if (!safe) continue;
      out.push(`${name}="${escapeAttr(safe)}"`);
      continue;
    }
    if (name === "target") {
      out.push(`target="_blank"`);
      out.push(`rel="noopener noreferrer nofollow"`);
      continue;
    }
    out.push(`${name}="${escapeAttr(value)}"`);
  }

  return out.length ? " " + out.join(" ") : "";
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sanitizePostHtml(input: string): string {
  if (!input) return "";

  // 1. Remove dangerous tags entirely (with their content).
  let html = input.replace(DANGEROUS_BLOCK_TAGS, "");
  html = html.replace(DANGEROUS_VOID_TAGS, "");

  // 2. Strip HTML comments (can hide payloads in some parsers).
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  // 3. Walk every remaining tag, drop disallowed ones, scrub attrs on the rest.
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, rawName: string, rawAttrs: string) => {
    const name = rawName.toLowerCase();
    const isClosing = full.startsWith("</");
    if (!ALLOWED_TAGS.has(name)) return "";
    if (isClosing) return `</${name}>`;
    const cleanedAttrs = sanitizeAttributes(name, rawAttrs);
    const selfClosing = name === "br" || name === "hr";
    return `<${name}${cleanedAttrs}${selfClosing ? " /" : ""}>`;
  });

  return html;
}

/** Plain-text length of an HTML string (for size limits and word counts). */
export function htmlTextLength(html: string): number {
  return html.replace(/<[^>]*>/g, "").trim().length;
}
