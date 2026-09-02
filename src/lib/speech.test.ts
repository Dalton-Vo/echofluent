import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startListening } from '@/lib/speech';

/* ============================================================================
 *  Test cho phần nhận diện giọng nói.
 *
 *  Hai hành vi dưới đây chính là hai lỗi làm người dùng tưởng micro hỏng, nên
 *  chúng phải có test canh: bị ngắt giữa chừng thì tự nối lại, và dừng thì
 *  phải CHỜ mảnh chữ cuối cùng chứ không cắt ngang.
 * ========================================================================== */

/** SpeechRecognition giả, cho phép bắn sự kiện theo ý muốn trong test */
class FakeRecognition {
  static instances: FakeRecognition[] = [];

  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  started = false;
  aborted = false;

  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  onstart: (() => void) | null = null;

  constructor() {
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started = true;
  }
  stop() {
    this.started = false;
    // Trình duyệt thật bắn onend bất đồng bộ sau khi gọi stop().
    queueMicrotask(() => this.onend?.());
  }
  abort() {
    this.aborted = true;
    this.started = false;
  }

  /* --------- tiện ích cho test --------- */

  say(text: string, isFinal: boolean) {
    this.onresult?.({
      resultIndex: 0,
      results: { length: 1, 0: { isFinal, length: 1, 0: { transcript: text, confidence: 0.9 } } },
    });
  }

  fail(code: string) {
    this.onerror?.({ error: code });
  }

  /** Trình duyệt tự tắt vì im lặng quá lâu */
  dropOut() {
    this.onend?.();
  }
}

beforeEach(() => {
  FakeRecognition.instances = [];
  (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeRecognition;
  (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = undefined;
});

const latest = () => FakeRecognition.instances[FakeRecognition.instances.length - 1];

describe('startListening — tự nối lại khi bị ngắt', () => {
  it('bật lại phiên nghe mới khi trình duyệt tự tắt giữa chừng', () => {
    const onResume = vi.fn();
    startListening({ onResume });

    expect(FakeRecognition.instances).toHaveLength(1);

    // Chrome tự tắt sau vài giây im lặng — người học còn đang nghĩ.
    latest().dropOut();

    expect(FakeRecognition.instances).toHaveLength(2);
    expect(latest().started).toBe(true);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('giữ lại chữ đã nghe được ở phiên trước khi nối lại', async () => {
    const ctrl = startListening()!;

    latest().say('I think', true);
    latest().dropOut();
    latest().say('we should ship it', true);

    expect(ctrl.text()).toBe('I think we should ship it');
  });

  it('KHÔNG nối lại khi bị chặn quyền micro', () => {
    const onError = vi.fn();
    startListening({ onError });

    latest().fail('not-allowed');
    latest().dropOut();

    expect(FakeRecognition.instances).toHaveLength(1);
    expect(onError).toHaveBeenCalledWith('not-allowed');
  });

  it('coi "no-speech" là chuyện thường, không báo lỗi ra ngoài', () => {
    const onError = vi.fn();
    startListening({ onError });

    latest().fail('no-speech');

    expect(onError).not.toHaveBeenCalled();
    // vẫn nối lại như bình thường
    latest().dropOut();
    expect(FakeRecognition.instances).toHaveLength(2);
  });

  it('có chặn trên số lần nối lại để không thành vòng lặp vô tận', () => {
    startListening();
    for (let i = 0; i < 40; i += 1) latest().dropOut();
    expect(FakeRecognition.instances.length).toBeLessThanOrEqual(21);
  });
});

describe('stop() — phải chờ mảnh chữ cuối cùng', () => {
  it('trả về đầy đủ câu, kể cả phần vừa chốt sau khi bấm dừng', async () => {
    const ctrl = startListening()!;
    const rec = latest();

    rec.say('off the top of my head', true);

    const pending = ctrl.stop();
    // Trình duyệt chốt nốt vế cuối SAU khi đã gọi stop() — đây đúng là chỗ bản
    // cũ đọc thẳng state React nên mất chữ.
    rec.say(' about three days', true);

    await expect(pending).resolves.toBe('off the top of my head about three days');
  });

  it('gộp cả phần chữ tạm chưa chốt, không bỏ phí', async () => {
    const ctrl = startListening()!;
    latest().say('I would say', false);
    await expect(ctrl.stop()).resolves.toBe('I would say');
  });

  it('gọi onFinal đúng một lần dù dừng nhiều lần', async () => {
    const onFinal = vi.fn();
    const ctrl = startListening({ onFinal })!;
    latest().say('hello', true);

    await ctrl.stop();
    await ctrl.stop();

    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal).toHaveBeenCalledWith('hello');
  });

  it('abort() dừng hẳn và không nối lại', () => {
    const ctrl = startListening()!;
    ctrl.abort();
    latest().dropOut();
    expect(FakeRecognition.instances).toHaveLength(1);
  });
});

describe('khi trình duyệt không hỗ trợ', () => {
  it('báo unsupported thay vì ném lỗi', () => {
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = undefined;
    const onError = vi.fn();
    expect(startListening({ onError })).toBeNull();
    expect(onError).toHaveBeenCalledWith('unsupported');
  });
});
