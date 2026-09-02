import { describe, expect, it } from 'vitest';
import { sanitizeBackup } from './backup';

describe('sanitizeBackup', () => {
  it('removes sync credentials and the Gemini key', () => {
    const raw = JSON.stringify({
      state: {
        sync: { url: 'https://worker.example', secret: 'sync-secret' },
        ai: { key: 'gemini-or-proxy-secret', proxyUrl: '', enabled: true },
        xp: 42,
      },
    });

    const exported = JSON.parse(sanitizeBackup(raw));
    expect(exported.state.sync).toEqual({ url: '', secret: '' });
    expect(exported.state.ai.key).toBe('');
    expect(exported.state.xp).toBe(42);
    expect(sanitizeBackup(raw)).not.toContain('sync-secret');
    expect(sanitizeBackup(raw)).not.toContain('gemini-or-proxy-secret');
  });

  it('never returns malformed raw storage that could contain a secret', () => {
    expect(sanitizeBackup('{"secret":"leaked"')).toBe('{}');
  });
});
