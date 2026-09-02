import { describe, it, expect } from 'vitest';
import { reviewPronunciation, transcribeAudio, pingAi, type AiConfig } from '@/lib/gemini';
import { pcmToWav } from '@/lib/tts';

/* ============================================================================
 *  Kiểm thử tích hợp — GỌI THẬT ra Google
 * ============================================================================
 *
 *  Bộ test thường dùng fetch giả, nên nó canh được phần chuẩn hoá dữ liệu
 *  nhưng KHÔNG phát hiện được khi Google đổi hình dạng API, đổi tên model, hay
 *  siết lại schema. Bộ này gọi thật để bắt đúng loại hỏng đó.
 *
 *  Mặc định bỏ qua, chỉ chạy khi có khoá trong biến môi trường:
 *      GEMINI_KEY=... npx vitest run src/lib/ai.integration.test.ts
 *
 *  Cố tình đọc khoá từ biến môi trường chứ không đặt trong file: repo này công
 *  khai, và một khoá lỡ commit vào lịch sử git thì xoá đi vẫn còn nguyên trong
 *  lịch sử.
 * ========================================================================== */

const KEY = process.env.GEMINI_KEY ?? '';
const cfg: AiConfig = { key: KEY, proxyUrl: '', model: 'gemini-3.5-flash' };

/** Sinh một câu tiếng Anh có thật để chấm, bằng chính TTS của Google */
async function speechSample(text: string): Promise<{ b64: string; mime: string }> {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      }),
    },
  );
  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((p: unknown) => (p as { inlineData?: unknown }).inlineData)?.inlineData;
  expect(part?.data, 'TTS phải trả về audio').toBeTruthy();

  // Đúng đường đi trong app: PCM trần → bọc header WAV → base64
  const bin = atob(part.data as string);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  const rate = Number(/rate=(\d+)/.exec(part.mimeType as string)?.[1] ?? 24000);
  const wav = pcmToWav(bytes, rate);

  const buf = Buffer.from(await wav.arrayBuffer());
  return { b64: buf.toString('base64'), mime: 'audio/wav' };
}

describe.skipIf(!KEY)('gọi thật ra Gemini', () => {
  it('pingAi báo kết nối tốt', { timeout: 60_000 }, async () => {
    const r = await pingAi(cfg);
    expect(r.ok, r.message).toBe(true);
  });

  it('pcmToWav tạo ra file WAV hợp lệ', { timeout: 120_000 }, async () => {
    const { b64 } = await speechSample('Testing one two three.');
    const head = Buffer.from(b64, 'base64').subarray(0, 12).toString('latin1');
    expect(head.startsWith('RIFF')).toBe(true);
    expect(head.includes('WAVE')).toBe(true);
  });

  it('chấm phát âm trả về đủ trường và điểm từng từ', { timeout: 180_000 }, async () => {
    const target = "No blockers on my end, although I'm still waiting on the API key.";
    const { b64, mime } = await speechSample(target);

    const r = await reviewPronunciation(cfg, b64, mime, target);

    expect(r.transcript.length).toBeGreaterThan(5);
    for (const n of [r.overall, r.pronunciation, r.fluency, r.intonation, r.completeness]) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(100);
    }
    // Phải chấm được TỪNG TỪ — đây là điểm khác biệt so với chấm bằng so chữ
    expect(r.words.length).toBeGreaterThan(4);
    for (const w of r.words) {
      expect(w.word).toBeTruthy();
      expect(w.score).toBeGreaterThanOrEqual(0);
      expect(w.score).toBeLessThanOrEqual(100);
    }
    expect(r.summary.length).toBeGreaterThan(5);

    // Giọng máy đọc chuẩn thì phải được điểm cao. Chấm thấp ở đây nghĩa là
    // thang điểm bị lệch và người học sẽ bị chấm oan.
    expect(r.overall).toBeGreaterThan(60);
  });

  it('chép lời thành chữ đúng nội dung', { timeout: 180_000 }, async () => {
    const { b64, mime } = await speechSample('I think the problem is the database.');
    const text = (await transcribeAudio(cfg, b64, mime)).toLowerCase();
    expect(text).toContain('database');
    expect(text).not.toMatch(/^["']/); // đã bóc dấu ngoặc kép
  });

  it('khoá sai bị báo đúng mã lỗi', { timeout: 60_000 }, async () => {
    await expect(
      reviewPronunciation({ ...cfg, key: 'khoa-bay-ba' }, 'AAAA', 'audio/wav', 'hi'),
    ).rejects.toMatchObject({ code: 'sai_khoa' });
  });
});
