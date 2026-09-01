import { describe, expect, it } from 'vitest';
import { contentWords, normalize, scoreAnswer, shadowAccuracy, shuffle, words } from './match';

/* Chấm điểm là thứ người học nhìn thấy nhiều nhất — nó phải dễ tính đúng cách,
 * chứ không phải dễ tính bừa. Bộ test này khoá lại hành vi đó. */

describe('normalize', () => {
  it('đưa dạng nói nhanh về dạng chuẩn', () => {
    expect(normalize("I'm gonna hafta go")).toContain('going to');
    expect(normalize('I wanna try')).toContain('want to');
    expect(normalize('lemme know')).toContain('let me');
    expect(normalize('dunno')).toContain("don't know");
  });

  it('gộp dạng đầy đủ và dạng rút gọn về cùng một chuỗi', () => {
    expect(normalize('I am ready')).toBe(normalize("I'm ready"));
    expect(normalize('it is fine')).toBe(normalize("it's fine"));
    expect(normalize('I would say')).toBe(normalize("I'd say"));
  });

  it('bỏ dấu câu và dấu nháy cong', () => {
    expect(normalize('Well, that’s… interesting!')).toBe("well that's interesting");
  });
});

describe('contentWords', () => {
  it('loại bỏ hư từ và tiếng ừm à', () => {
    expect(contentWords('um, I think the deploy failed')).toEqual([
      'think',
      'deploy',
      'failed',
    ]);
  });

  it('trả về mảng rỗng cho chuỗi rỗng', () => {
    expect(contentWords('   ')).toEqual([]);
    expect(words('')).toEqual([]);
  });
});

describe('scoreAnswer', () => {
  const targets = ['off the top of my head', 'two days'];
  const model = "Off the top of my head, I'd say about two days.";

  it('cho điểm cao khi bắn trúng hết cụm khoá', () => {
    const r = scoreAnswer("Off the top of my head, I'd say about two days", targets, model);
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.verdict).toBe('great');
    expect(r.missed).toHaveLength(0);
  });

  it('vẫn công nhận khi người học diễn đạt hơi khác', () => {
    const r = scoreAnswer(
      'Off the top of my head I would guess maybe two days or so',
      targets,
      model,
    );
    expect(r.hit).toContain('off the top of my head');
    expect(r.hit).toContain('two days');
  });

  it('chấm thấp khi nói lạc đề', () => {
    const r = scoreAnswer('I like pizza', targets, model);
    expect(r.score).toBeLessThan(35);
    expect(r.verdict).toBe('weak');
  });

  it('không bao giờ vượt 100 dù nói rất dài', () => {
    const r = scoreAnswer(
      `${model} ${model} ${model} and a lot of extra words here to pad it out`,
      targets,
      model,
    );
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it('xử lý được chuỗi rỗng mà không nổ', () => {
    const r = scoreAnswer('', targets, model);
    expect(r.score).toBe(0);
    expect(r.spokenWords).toBe(0);
  });

  it('không lỗi khi câu hỏi không có cụm khoá nào', () => {
    const r = scoreAnswer('anything at all', [], 'anything at all');
    expect(r.score).toBeGreaterThan(0);
    expect(r.missed).toHaveLength(0);
  });

  it('bỏ qua khác biệt về dạng rút gọn', () => {
    const withFull = scoreAnswer('I am not sure about that', ["I'm not sure"], "I'm not sure");
    expect(withFull.hit).toHaveLength(1);
  });
});

describe('shadowAccuracy', () => {
  it('trả 100 khi nói đúng y hệt', () => {
    expect(shadowAccuracy('Let me think for a second', 'Let me think for a second')).toBe(100);
  });

  it('giảm dần khi thiếu từ', () => {
    const full = shadowAccuracy('Let me think for a second', 'Let me think for a second');
    const half = shadowAccuracy('Let me think', 'Let me think for a second');
    expect(half).toBeLessThan(full);
    expect(half).toBeGreaterThan(0);
  });

  it('không tính điểm cho từ lặp lại nhiều hơn bản gốc', () => {
    expect(shadowAccuracy('think think think think', 'Let me think for a second')).toBeLessThan(30);
  });

  it('trả 0 cho câu gốc rỗng thay vì chia cho 0', () => {
    expect(shadowAccuracy('hello', '')).toBe(0);
  });
});

describe('shuffle', () => {
  it('giữ nguyên toàn bộ phần tử', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const out = shuffle(arr, 42);
    expect(out).toHaveLength(4);
    expect([...out].sort()).toEqual([...arr].sort());
  });

  it('không làm thay đổi mảng gốc', () => {
    const arr = ['a', 'b', 'c'];
    shuffle(arr, 7);
    expect(arr).toEqual(['a', 'b', 'c']);
  });

  it('cùng hạt giống cho cùng thứ tự', () => {
    expect(shuffle(['a', 'b', 'c', 'd', 'e'], 99)).toEqual(shuffle(['a', 'b', 'c', 'd', 'e'], 99));
  });
});
