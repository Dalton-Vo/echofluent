import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isAiReady,
  aiErrorText,
  reviewPronunciation,
  transcribeAudio,
  AiFailure,
  type AiConfig,
} from '@/lib/gemini';

/* ============================================================================
 *  Test cho phần chấm phát âm.
 *
 *  Trọng tâm là bước CHUẨN HOÁ: model ngôn ngữ không phải cái máy tất định,
 *  thỉnh thoảng nó trả về thiếu trường, trả điểm 150, hay nhét kiểu dữ liệu
 *  lạ. Giao diện lại vẽ thẳng từ những con số đó, nên hỏng ở đây là vỡ màn
 *  hình kết quả ngay trước mặt người học.
 * ========================================================================== */

const CFG: AiConfig = { key: 'test-key', proxyUrl: '', model: 'gemini-3.5-flash' };

function mockReply(payload: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
    }),
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockReply({}));
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isAiReady', () => {
  it('cần ít nhất khoá hoặc địa chỉ proxy', () => {
    expect(isAiReady({ key: '', proxyUrl: '', model: '' })).toBe(false);
    expect(isAiReady({ key: '  ', proxyUrl: '  ', model: '' })).toBe(false);
    expect(isAiReady({ key: 'k', proxyUrl: '', model: '' })).toBe(true);
    expect(isAiReady({ key: '', proxyUrl: 'https://w.dev', model: '' })).toBe(true);
  });
});

describe('reviewPronunciation — chuẩn hoá kết quả', () => {
  it('giữ nguyên báo cáo hợp lệ, kể cả điểm từng từ', async () => {
    vi.stubGlobal(
      'fetch',
      mockReply({
        transcript: 'tree days',
        overall: 62,
        pronunciation: 58,
        fluency: 70,
        intonation: 65,
        completeness: 80,
        words: [
          { word: 'three', score: 30, ipa: '/θriː/', heard: '/triː/', tip: 'Đặt lưỡi giữa răng' },
          { word: 'days', score: 85, ipa: '/deɪz/', heard: '/deɪz/', tip: '' },
        ],
        focus: ['âm /θ/', 'âm cuối /z/'],
        summary: 'Chú ý âm th.',
      }),
    );

    const r = await reviewPronunciation(CFG, 'BASE64', 'audio/wav', 'three days');

    expect(r.transcript).toBe('tree days');
    expect(r.overall).toBe(62);
    expect(r.words).toHaveLength(2);
    expect(r.words[0]).toMatchObject({ word: 'three', score: 30, heard: '/triː/' });
    expect(r.focus).toEqual(['âm /θ/', 'âm cuối /z/']);
  });

  it('ép điểm về khoảng 0–100 khi model trả số vô lý', async () => {
    vi.stubGlobal(
      'fetch',
      mockReply({
        transcript: 'hi',
        overall: 150,
        pronunciation: -20,
        fluency: 'tám mươi',
        intonation: 70,
        completeness: 999,
        words: [{ word: 'hi', score: 1000, ipa: '/haɪ/', heard: '/haɪ/', tip: '' }],
        focus: [],
        summary: '',
      }),
    );

    const r = await reviewPronunciation(CFG, 'B', 'audio/wav', 'hi');

    expect(r.overall).toBe(100);
    expect(r.pronunciation).toBe(0);
    expect(r.fluency).toBe(0); // không phải số → về 0 thay vì NaN
    expect(r.completeness).toBe(100);
    expect(r.words[0].score).toBe(100);
  });

  it('tự tính overall khi model quên trả', async () => {
    vi.stubGlobal(
      'fetch',
      mockReply({
        transcript: 'ok',
        pronunciation: 77,
        fluency: 80,
        intonation: 75,
        completeness: 90,
        words: [],
        focus: [],
        summary: '',
      }),
    );

    const r = await reviewPronunciation(CFG, 'B', 'audio/wav', 'ok');
    expect(r.overall).toBe(77);
  });

  it('bỏ qua mục từ rác thay vì vẽ ô trống lên màn hình', async () => {
    vi.stubGlobal(
      'fetch',
      mockReply({
        transcript: 'a',
        overall: 50,
        pronunciation: 50,
        fluency: 50,
        intonation: 50,
        completeness: 50,
        words: [
          { word: '', score: 10, ipa: '', heard: '', tip: '' },
          null,
          { word: 'good', score: 90, ipa: '/ɡʊd/', heard: '/ɡʊd/', tip: '' },
        ],
        focus: [],
        summary: '',
      }),
    );

    const r = await reviewPronunciation(CFG, 'B', 'audio/wav', 'good');
    expect(r.words).toHaveLength(1);
    expect(r.words[0].word).toBe('good');
  });

  it('không gục khi model trả JSON hỏng', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: '{ vỡ' }] } }] }),
      }),
    );
    await expect(reviewPronunciation(CFG, 'B', 'audio/wav', 'x')).rejects.toMatchObject({
      code: 'khong_doc_duoc',
    });
  });
});

describe('reviewPronunciation — báo lỗi cho đúng', () => {
  it('chưa cấu hình gì thì nói thẳng, không gọi mạng', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    await expect(
      reviewPronunciation({ key: '', proxyUrl: '', model: '' }, 'B', 'audio/wav', 'x'),
    ).rejects.toMatchObject({ code: 'chua_cau_hinh' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('không có audio thì báo riêng, khỏi tốn lượt gọi', async () => {
    await expect(reviewPronunciation(CFG, '', 'audio/wav', 'x')).rejects.toMatchObject({
      code: 'khong_co_audio',
    });
  });

  it.each([
    [401, 'sai_khoa'],
    [403, 'sai_khoa'],
    [400, 'sai_khoa'],
    [429, 'het_hang_muc'],
    [500, 'mang_loi'],
  ])('HTTP %i → %s', async (status, code) => {
    vi.stubGlobal('fetch', mockReply({}, status));
    await expect(reviewPronunciation(CFG, 'B', 'audio/wav', 'x')).rejects.toMatchObject({ code });
  });

  it('mất mạng thì báo lỗi mạng chứ không văng ra ngoài', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('failed to fetch')));
    await expect(reviewPronunciation(CFG, 'B', 'audio/wav', 'x')).rejects.toMatchObject({
      code: 'mang_loi',
    });
  });

  it('mọi mã lỗi đều có câu giải thích bằng tiếng Việt', () => {
    for (const c of [
      'chua_cau_hinh',
      'khong_co_audio',
      'sai_khoa',
      'het_hang_muc',
      'mang_loi',
      'khong_doc_duoc',
    ] as const) {
      expect(aiErrorText(c).length).toBeGreaterThan(10);
    }
    expect(new AiFailure('sai_khoa').code).toBe('sai_khoa');
  });
});

describe('đường đi của khoá API', () => {
  it('gọi thẳng Google thì đính khoá vào header', async () => {
    const spy = mockReply({ transcript: '', overall: 0, pronunciation: 0, fluency: 0, intonation: 0, completeness: 0, words: [], focus: [], summary: '' });
    vi.stubGlobal('fetch', spy);

    await reviewPronunciation(CFG, 'B', 'audio/wav', 'x');

    const [url, init] = spy.mock.calls[0];
    expect(url).toContain('generativelanguage.googleapis.com');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('test-key');
  });

  it('đi qua Worker thì TUYỆT ĐỐI không gửi khoá lên — khoá nằm ở máy chủ', async () => {
    const spy = mockReply({ transcript: '', overall: 0, pronunciation: 0, fluency: 0, intonation: 0, completeness: 0, words: [], focus: [], summary: '' });
    vi.stubGlobal('fetch', spy);

    await reviewPronunciation(
      { key: 'khong-duoc-gui-di', proxyUrl: 'https://w.dev/', model: 'gemini-3.5-flash' },
      'B',
      'audio/wav',
      'x',
    );

    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('https://w.dev/ai/gemini-3.5-flash');
    expect(init.headers).not.toHaveProperty('x-goog-api-key');
    expect(JSON.stringify(init)).not.toContain('khong-duoc-gui-di');
  });
});

describe('transcribeAudio', () => {
  it('bóc bỏ dấu ngoặc kép model hay tự thêm', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '  "I think we should ship it"  ' }] } }],
        }),
      }),
    );
    await expect(transcribeAudio(CFG, 'B', 'audio/wav')).resolves.toBe(
      'I think we should ship it',
    );
  });
});
