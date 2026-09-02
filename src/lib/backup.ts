/** Remove credentials before a localStorage snapshot leaves the browser. */
export function sanitizeBackup(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.state?.sync) parsed.state.sync = { url: '', secret: '' };
    if (parsed?.state?.ai) parsed.state.ai = { ...parsed.state.ai, key: '' };
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
}
