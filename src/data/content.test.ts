import { describe, expect, it } from 'vitest';
import { CHUNKS, CHUNK_BY_ID } from './chunks';
import { REFLEX } from './reflex';
import { LISTENING } from './listening';
import { SCENARIOS } from './scenarios';
import { SHADOW_PACKS, parseShadowLine, plainShadowText } from './shadowing';
import { ACHIEVEMENTS, MISSION_POOL, levelFromXp, missionsForWeek } from './gamify';
import { MEMORY_HOOKS } from './memoryHooks';
import { normalize, scoreAnswer } from '@/lib/match';
import { DOMAIN_LABEL, FN_LABEL, FOCUS_LABEL } from '@/types';

/* ============================================================================
 *  KIỂM ĐỊNH CHẤT LƯỢNG NỘI DUNG
 *
 *  Nội dung mới là sản phẩm thật của app này — code chỉ là cái khung. Một câu
 *  hỏi mà người học không thể nào đạt điểm cao, một bài nghe mà đáp án đúng
 *  luôn là lựa chọn dài nhất, một tình huống trỏ tới cụm không tồn tại — đó là
 *  lỗi nghiêm trọng hơn cả lỗi code, vì nó âm thầm dạy sai.
 * ========================================================================== */

const ALL_IDS = [
  ...CHUNKS.map((c) => c.id),
  ...REFLEX.map((r) => r.id),
  ...LISTENING.map((l) => l.id),
  ...SCENARIOS.map((s) => s.id),
  ...SHADOW_PACKS.map((p) => p.id),
];

describe('Tính toàn vẹn chung', () => {
  it('không có id nào trùng nhau trên toàn bộ dữ liệu', () => {
    const seen = new Map<string, number>();
    for (const id of ALL_IDS) seen.set(id, (seen.get(id) ?? 0) + 1);
    const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    expect(dupes).toEqual([]);
  });

  it('có đủ lượng nội dung để một phiên học không bị lặp', () => {
    expect(CHUNKS.length).toBeGreaterThanOrEqual(120);
    expect(REFLEX.length).toBeGreaterThanOrEqual(50);
    expect(LISTENING.length).toBeGreaterThanOrEqual(50);
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(10);
    expect(SHADOW_PACKS.length).toBeGreaterThanOrEqual(8);
  });
});

describe('Thư viện cụm', () => {
  it('mọi cụm đều có đủ trường bắt buộc và không để trống', () => {
    for (const c of CHUNKS) {
      expect(c.en.trim(), `${c.id}.en`).not.toBe('');
      expect(c.vi.trim(), `${c.id}.vi`).not.toBe('');
      expect(c.example.trim(), `${c.id}.example`).not.toBe('');
      expect(c.exampleVi.trim(), `${c.id}.exampleVi`).not.toBe('');
    }
  });

  it('mọi nhãn chức năng và bối cảnh đều dịch được ra tiếng Việt', () => {
    for (const c of CHUNKS) {
      expect(FN_LABEL[c.fn], `${c.id}.fn`).toBeDefined();
      expect(DOMAIN_LABEL[c.domain], `${c.id}.domain`).toBeDefined();
    }
  });

  it('câu ví dụ thật sự có chứa cụm đang dạy', () => {
    // Nếu ví dụ không chứa cụm thì người học không thấy được cách dùng.
    const broken: string[] = [];
    for (const c of CHUNKS) {
      const core = normalize(c.en.replace(/…|\.\.\./g, '').replace(/[?!.]/g, ''));
      const head = core.split(' ').slice(0, 3).join(' ');
      if (!normalize(c.example).includes(head)) broken.push(`${c.id}: "${c.en}" ↛ "${c.example}"`);
    }
    expect(broken).toEqual([]);
  });

  it('không có hai cụm nào trùng nội dung tiếng Anh', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const c of CHUNKS) {
      const key = normalize(c.en);
      if (seen.has(key)) dupes.push(`${c.id} trùng ${seen.get(key)}: "${c.en}"`);
      else seen.set(key, c.id);
    }
    expect(dupes).toEqual([]);
  });

  it('phủ đủ cả bốn bối cảnh, không dồn hết vào công việc', () => {
    for (const domain of ['work', 'tech', 'daily', 'social'] as const) {
      const n = CHUNKS.filter((c) => c.domain === domain).length;
      expect(n, `bối cảnh ${domain}`).toBeGreaterThanOrEqual(15);
    }
  });

  it('phủ hết mọi nhóm chức năng đã khai báo', () => {
    for (const fn of Object.keys(FN_LABEL)) {
      const n = CHUNKS.filter((c) => c.fn === fn).length;
      expect(n, `chức năng ${fn}`).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('Mẹo nhớ', () => {
  it('mọi mẹo nhớ đều gắn với một cụm có thật', () => {
    const orphans = Object.keys(MEMORY_HOOKS).filter((id) => !CHUNK_BY_ID.has(id));
    expect(orphans).toEqual([]);
  });

  it('mọi cụm đều có mẹo nhớ — đây là thứ quyết định bạn có nhớ được hay không', () => {
    const missing = CHUNKS.filter((c) => !MEMORY_HOOKS[c.id]).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it('mỗi mẹo nhớ đều có ít nhất một nội dung thật, không để trống', () => {
    for (const [id, h] of Object.entries(MEMORY_HOOKS)) {
      const filled = [h.hook, h.pitfall, h.contrast].filter((x) => x && x.trim().length > 8);
      expect(filled.length, `${id} không có nội dung`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Câu hỏi phản xạ', () => {
  it('mọi câu đều có cụm khoá và câu mẫu', () => {
    for (const r of REFLEX) {
      expect(r.targets.length, `${r.id}.targets`).toBeGreaterThan(0);
      expect(r.model.trim(), `${r.id}.model`).not.toBe('');
      expect(r.modelVi.trim(), `${r.id}.modelVi`).not.toBe('');
      expect(r.cue.trim(), `${r.id}.cue`).not.toBe('');
    }
  });

  it('câu mẫu phải đạt điểm cao khi tự chấm chính nó', () => {
    // Nếu chính câu mẫu cũng không ăn điểm thì cụm khoá đang đặt sai — người
    // học sẽ không bao giờ đạt được điểm cao dù nói hoàn hảo.
    const weak: string[] = [];
    for (const r of REFLEX) {
      const s = scoreAnswer(r.model, r.targets, r.model);
      if (s.score < 85) weak.push(`${r.id}: ${s.score} điểm, thiếu [${s.missed.join(', ')}]`);
    }
    expect(weak).toEqual([]);
  });

  it('thời gian cho phép hợp lý theo độ dài câu mẫu', () => {
    for (const r of REFLEX) {
      expect(r.seconds, `${r.id}.seconds`).toBeGreaterThanOrEqual(3);
      expect(r.seconds, `${r.id}.seconds`).toBeLessThanOrEqual(15);
    }
  });

  it('có đủ cả bốn kiểu bài', () => {
    for (const type of ['respond', 'translate', 'expand', 'react'] as const) {
      expect(REFLEX.filter((r) => r.type === type).length, `kiểu ${type}`).toBeGreaterThanOrEqual(5);
    }
  });

  it('bài dịch Việt→Anh phải có gợi ý bằng tiếng Việt thật', () => {
    for (const r of REFLEX.filter((x) => x.type === 'translate')) {
      // cue của bài dịch là câu tiếng Việt — không được là tiếng Anh
      expect(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(r.cue), `${r.id}.cue`).toBe(true);
    }
  });
});

describe('Bài luyện nghe', () => {
  it('mỗi bài đúng 4 lựa chọn, không trùng nhau', () => {
    for (const l of LISTENING) {
      expect(l.options.length, `${l.id}`).toBe(4);
      expect(new Set(l.options).size, `${l.id} có lựa chọn trùng`).toBe(4);
    }
  });

  it('mọi bài đều có phần giải thích vì sao nghe ra như vậy', () => {
    for (const l of LISTENING) {
      expect(l.note.trim().length, `${l.id}.note quá ngắn`).toBeGreaterThan(20);
      expect(l.spoken.trim(), `${l.id}.spoken`).not.toBe('');
      expect(l.written.trim(), `${l.id}.written`).not.toBe('');
      expect(l.vi.trim(), `${l.id}.vi`).not.toBe('');
    }
  });

  it('đáp án đúng không được nhận ra chỉ nhờ độ dài', () => {
    // Lỗi kinh điển của trắc nghiệm: đáp án đúng luôn dài nhất, học viên đoán
    // bằng mắt và không hề luyện được cái tai. Bằng nhau thì không lộ.
    const uniquelyLongest = LISTENING.filter((l) => {
      const [answer, ...rest] = l.options.map((o) => o.length);
      return rest.every((n) => n < answer);
    }).length;
    const ratio = uniquelyLongest / LISTENING.length;
    expect(ratio, `${Math.round(ratio * 100)}% số bài có đáp án dài nhất`).toBeLessThan(0.35);
  });

  it('đáp án đúng cũng không phải lúc nào cũng ngắn nhất (tránh sửa quá tay)', () => {
    const uniquelyShortest = LISTENING.filter((l) => {
      const [answer, ...rest] = l.options.map((o) => o.length);
      return rest.every((n) => n > answer);
    }).length;
    const ratio = uniquelyShortest / LISTENING.length;
    expect(ratio, `${Math.round(ratio * 100)}% số bài có đáp án ngắn nhất`).toBeLessThan(0.6);
  });

  it('phủ hết mọi kiểu khó nghe đã khai báo', () => {
    for (const focus of Object.keys(FOCUS_LABEL)) {
      const n = LISTENING.filter((l) => l.focus === focus).length;
      expect(n, `kiểu ${focus}`).toBeGreaterThanOrEqual(4);
    }
  });

  it('không có hai bài nào trùng câu nói', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const l of LISTENING) {
      const key = normalize(l.spoken);
      if (seen.has(key)) dupes.push(l.id);
      seen.add(key);
    }
    expect(dupes).toEqual([]);
  });
});

describe('Tình huống nhập vai', () => {
  it('mọi cụm được tham chiếu đều tồn tại trong thư viện', () => {
    const missing: string[] = [];
    for (const s of SCENARIOS) {
      for (const id of s.chunkIds) if (!CHUNK_BY_ID.has(id)) missing.push(`${s.id} → ${id}`);
    }
    expect(missing).toEqual([]);
  });

  it('mọi lượt của người học đều có nhiệm vụ và cụm khoá rõ ràng', () => {
    for (const s of SCENARIOS) {
      for (const [i, t] of s.turns.entries()) {
        if (t.speaker !== 'you') continue;
        expect(t.task?.trim(), `${s.id} lượt ${i} thiếu nhiệm vụ`).toBeTruthy();
        expect(t.targets?.length, `${s.id} lượt ${i} thiếu cụm khoá`).toBeGreaterThan(0);
      }
    }
  });

  it('câu mẫu của mỗi lượt phải đạt điểm cao khi tự chấm', () => {
    const weak: string[] = [];
    for (const s of SCENARIOS) {
      for (const [i, t] of s.turns.entries()) {
        if (t.speaker !== 'you' || !t.targets) continue;
        const score = scoreAnswer(t.text, t.targets, t.text).score;
        if (score < 85) weak.push(`${s.id}#${i}: ${score} điểm`);
      }
    }
    expect(weak).toEqual([]);
  });

  it('mỗi lượt của người học có ít nhất hai cách nói thay thế kèm giải thích', () => {
    for (const s of SCENARIOS) {
      for (const [i, t] of s.turns.entries()) {
        if (t.speaker !== 'you') continue;
        expect(t.alts?.length, `${s.id} lượt ${i}`).toBeGreaterThanOrEqual(2);
        for (const a of t.alts ?? []) {
          expect(a.text.trim(), `${s.id} lượt ${i} alt rỗng`).not.toBe('');
          expect(a.note.trim().length, `${s.id} lượt ${i} note quá ngắn`).toBeGreaterThan(5);
        }
      }
    }
  });

  it('hội thoại không có hai lượt liên tiếp cùng một người nói', () => {
    for (const s of SCENARIOS) {
      for (let i = 1; i < s.turns.length; i += 1) {
        expect(
          s.turns[i].speaker === s.turns[i - 1].speaker,
          `${s.id} lặp lượt ${s.turns[i].speaker} ở vị trí ${i}`,
        ).toBe(false);
      }
    }
  });

  it('mọi lượt đều có bản dịch tiếng Việt', () => {
    for (const s of SCENARIOS) {
      for (const [i, t] of s.turns.entries()) {
        expect(t.vi.trim(), `${s.id} lượt ${i} thiếu bản dịch`).not.toBe('');
      }
    }
  });

  it('mỗi tình huống đủ dài để thành một hội thoại thật', () => {
    for (const s of SCENARIOS) {
      const you = s.turns.filter((t) => t.speaker === 'you').length;
      expect(you, `${s.id} quá ít lượt nói`).toBeGreaterThanOrEqual(3);
      expect(s.contextVi.trim(), `${s.id}.contextVi`).not.toBe('');
    }
  });

  it('phủ cả công việc lẫn đời sống, không lệch hẳn về một phía', () => {
    const workish = SCENARIOS.filter((s) => s.domain === 'work' || s.domain === 'tech').length;
    const lifeish = SCENARIOS.length - workish;
    expect(workish).toBeGreaterThanOrEqual(4);
    expect(lifeish).toBeGreaterThanOrEqual(4);
  });
});

describe('Bộ shadowing', () => {
  it('mọi dòng đều có trọng âm được đánh dấu', () => {
    for (const p of SHADOW_PACKS) {
      for (const [i, line] of p.lines.entries()) {
        expect(line.text.includes('*'), `${p.id} dòng ${i} thiếu trọng âm`).toBe(true);
        expect(line.vi.trim(), `${p.id} dòng ${i} thiếu bản dịch`).not.toBe('');
      }
    }
  });

  it('ký hiệu được gỡ sạch trước khi đưa vào bộ đọc', () => {
    for (const p of SHADOW_PACKS) {
      for (const line of p.lines) {
        const plain = plainShadowText(line.text);
        expect(plain).not.toContain('*');
        expect(plain).not.toContain('/');
        expect(plain).not.toMatch(/\s{2,}/);
        expect(plain.trim()).not.toBe('');
      }
    }
  });

  it('mỗi dòng tách được thành nhóm nghĩa hợp lệ', () => {
    for (const p of SHADOW_PACKS) {
      for (const [i, line] of p.lines.entries()) {
        const groups = parseShadowLine(line.text);
        expect(groups.length, `${p.id} dòng ${i}`).toBeGreaterThanOrEqual(1);
        expect(groups.every((g) => g.words.length > 0), `${p.id} dòng ${i} có nhóm rỗng`).toBe(true);
        expect(
          groups.some((g) => g.words.some((w) => w.stress)),
          `${p.id} dòng ${i} không nhóm nào có trọng âm`,
        ).toBe(true);
      }
    }
  });

  it('mỗi bộ đủ dài và có tốc độ gốc hợp lý', () => {
    for (const p of SHADOW_PACKS) {
      expect(p.lines.length, `${p.id}`).toBeGreaterThanOrEqual(5);
      expect(p.baseRate).toBeGreaterThanOrEqual(0.7);
      expect(p.baseRate).toBeLessThanOrEqual(1.3);
    }
  });
});

describe('Nhiệm vụ, huy hiệu, cấp độ', () => {
  it('mọi nhiệm vụ đo bằng chỉ số thật sự được theo dõi', () => {
    const metrics = [
      'drills', 'listens', 'shadowLines', 'scenarios',
      'reviews', 'fastAnswers', 'minutes', 'daysActive',
    ];
    for (const m of MISSION_POOL) {
      expect(metrics, `${m.id}.metric`).toContain(m.metric);
      expect(m.target).toBeGreaterThan(0);
      expect(m.xp).toBeGreaterThan(0);
    }
  });

  it('nhiệm vụ tuần luôn ra đúng 3 cái và không trùng nhau', () => {
    for (const wk of [202601, 202614, 202627, 202652]) {
      const picks = missionsForWeek(wk);
      expect(picks).toHaveLength(3);
      expect(new Set(picks.map((p) => p.id)).size).toBe(3);
    }
  });

  it('cùng một tuần luôn ra cùng bộ nhiệm vụ', () => {
    expect(missionsForWeek(202620).map((m) => m.id)).toEqual(
      missionsForWeek(202620).map((m) => m.id),
    );
  });

  it('các tuần khác nhau không phải lúc nào cũng ra cùng bộ', () => {
    const sets = [202601, 202602, 202603, 202604, 202605].map((w) =>
      missionsForWeek(w).map((m) => m.id).join(),
    );
    expect(new Set(sets).size).toBeGreaterThan(1);
  });

  it('huy hiệu có id duy nhất và điều kiện chạy được', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    const zero = {
      xp: 0,
      streak: 0,
      totals: {
        drills: 0, listens: 0, shadowLines: 0, scenarios: 0,
        reviews: 0, fastAnswers: 0, minutes: 0, daysActive: 0,
      },
      masteredChunks: 0,
      bestReactionMs: 0,
    };
    for (const a of ACHIEVEMENTS) {
      expect(a.check(zero), `${a.id} mở khoá khi chưa làm gì`).toBe(false);
    }
  });

  it('cấp độ tăng đều và luôn có tiêu đề', () => {
    let prev = 0;
    for (const xp of [0, 300, 1000, 5000, 20000, 100000]) {
      const lv = levelFromXp(xp);
      expect(lv.level).toBeGreaterThanOrEqual(prev);
      expect(lv.title).toBeTruthy();
      expect(lv.into).toBeLessThan(lv.need);
      prev = lv.level;
    }
  });
});
