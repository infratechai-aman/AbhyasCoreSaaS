import path from "path";

/**
 * Sanitize a chapter ID / filename to prevent path traversal attacks.
 *
 * Strips directory separators, ".." sequences, null bytes, and any character
 * that isn't alphanumeric, underscore, or hyphen.  Returns only the basename.
 *
 * @param raw - The raw user-supplied identifier (e.g. chapterId, chapter name)
 * @returns The sanitized, safe-to-use filename component (without extension)
 */
export function sanitizeChapterId(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  // Take only the basename to strip any directory components
  let sanitized = path.basename(raw);

  // Remove ".xml" extension if user supplied it
  sanitized = sanitized.replace(/\.xml$/i, "");

  // Remove null bytes (can bypass path checks on some systems)
  sanitized = sanitized.replace(/\0/g, "");

  // Remove any ".." sequences
  sanitized = sanitized.replace(/\.\./g, "");

  // Allow only alphanumeric, underscores, and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9_\-]/g, "");

  // Reject empty or suspiciously short results
  if (sanitized.length < 2) return "";

  return sanitized;
}

/**
 * Validate that a sanitized chapter ID maps to an existing XML file
 * within the raw_questions directory. Returns the safe absolute path
 * or null if invalid.
 */
export function getChapterFilePath(
  chapterId: string,
  rawDir: string
): string | null {
  const safe = sanitizeChapterId(chapterId);
  if (!safe) return null;

  const filePath = path.join(rawDir, `${safe}.xml`);

  // Defense in depth: ensure resolved path is still within rawDir
  const resolved = path.resolve(filePath);
  const resolvedDir = path.resolve(rawDir);
  if (!resolved.startsWith(resolvedDir + path.sep)) {
    return null;
  }

  return filePath;
}
