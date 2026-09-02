import { beforeAll, describe, expect, it } from 'vitest';
import { AI_MODELS, authorized } from '../../worker/src/security';

describe('Worker AI proxy authentication', () => {
  beforeAll(() => {
    if (!('timingSafeEqual' in crypto.subtle)) {
      Object.defineProperty(crypto.subtle, 'timingSafeEqual', {
        configurable: true,
        value: (a: ArrayBuffer, b: ArrayBuffer) => {
          const left = new Uint8Array(a);
          const right = new Uint8Array(b);
          if (left.length !== right.length) return false;
          let diff = 0;
          for (let i = 0; i < left.length; i += 1) diff |= left[i] ^ right[i];
          return diff === 0;
        },
      });
    }
  });
  it('rejects an allowed but spoofable Origin when bearer auth is missing', async () => {
    const request = new Request('https://worker.example/ai/bad!', {
      method: 'POST',
      headers: { Origin: 'https://dalton-vo.github.io' },
    });
    await expect(authorized(request, 'real-secret')).resolves.toBe(false);
  });

  it('keeps the model allowlist limited to models the app uses', () => {
    expect(AI_MODELS.has('gemini-made-up')).toBe(false);
    expect(AI_MODELS.has('gemini-2.5-flash-preview-tts')).toBe(true);
  });
});
