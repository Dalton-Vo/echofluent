/**
 * ============================================================================
 *  Dựng bộ phiên âm IPA offline cho đúng những từ app dạy
 * ============================================================================
 *
 *  Nguồn: CMU Pronouncing Dictionary (135.000 từ, ~4.6MB) — quá nặng để nhét
 *  vào bundle của một trang web. Nhưng app chỉ dùng tới vài nghìn từ, nên ở
 *  đây quét toàn bộ nội dung học, tra đúng những từ đó rồi ghi ra một file nhỏ.
 *
 *  Đổi được gì: mở thư viện cụm hay bảng điểm phát âm là thấy IPA ngay, không
 *  cần mạng, không tốn lượt gọi AI. Phần AI để dành cho việc nó làm tốt hơn —
 *  nghe xem bạn ĐỌC RA cái gì, chứ không phải tra từ điển.
 *
 *  Chạy lại mỗi khi thêm nội dung mới:  npm run build-phonemes
 * ========================================================================== */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dictionary } from 'cmu-pronouncing-dictionary';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ARPABET → IPA. Nguyên âm phụ thuộc trọng âm nên xử lý riêng bên dưới. */
const MAP = {
  AA: 'ɑ', AE: 'æ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ', EH: 'ɛ', EY: 'eɪ',
  IH: 'ɪ', IY: 'i', OW: 'oʊ', OY: 'ɔɪ', UH: 'ʊ', UW: 'u',
  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', F: 'f', G: 'ɡ', HH: 'h', JH: 'dʒ',
  K: 'k', L: 'l', M: 'm', N: 'n', NG: 'ŋ', P: 'p', R: 'ɹ', S: 's', SH: 'ʃ',
  T: 't', TH: 'θ', V: 'v', W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ',
};

const VOWELS = new Set(['AA','AE','AH','AO','AW','AY','EH','ER','EY','IH','IY','OW','OY','UH','UW']);

function symbolFor(base, stress) {
  // AH và ER đổi hẳn ký hiệu khi không mang trọng âm — đây là khác biệt người
  // học nghe rõ nhất: "ə" nhẹ tênh so với "ʌ".
  if (base === 'AH') return stress === '0' ? 'ə' : 'ʌ';
  if (base === 'ER') return stress === '0' ? 'ɚ' : 'ɝ';
  return MAP[base] ?? '';
}

/**
 * Đổi một dòng ARPABET thành IPA, có đặt dấu trọng âm.
 *
 * Dấu trọng âm lùi về trước cả cụm phụ âm đứng đầu âm tiết (nguyên tắc "maximal
 * onset"), nên "develop" ra /dɪˈvɛləp/ chứ không phải /dɪvˈɛləp/ — đặt sai chỗ
 * thì người học đọc nhấn sai luôn.
 */
function toIpa(arpa) {
  const parts = arpa.trim().split(/\s+/);
  const out = [];

  for (const p of parts) {
    const stress = /\d$/.test(p) ? p.slice(-1) : '';
    const base = stress ? p.slice(0, -1) : p;
    const sym = symbolFor(base, stress);
    if (!sym) continue;

    if (VOWELS.has(base) && (stress === '1' || stress === '2')) {
      // lùi về đầu cụm phụ âm liền trước
      let at = out.length;
      while (at > 0 && !out[at - 1].vowel) at -= 1;
      out.splice(at, 0, { sym: stress === '1' ? 'ˈ' : 'ˌ', vowel: false, mark: true });
    }
    out.push({ sym, vowel: VOWELS.has(base), mark: false });
  }

  return out.map((o) => o.sym).join('');
}

/* ------------------- gom từ từ toàn bộ nội dung học ------------------- */

const words = new Set();
const dataDir = join(ROOT, 'src/data');

for (const file of readdirSync(dataDir)) {
  if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
  const text = readFileSync(join(dataDir, file), 'utf8');
  /* Chỉ lấy chuỗi ASCII — chữ tiếng Việt có dấu tự nhiên bị loại ở bước này.
   * Giữ nguyên dấu nháy trong từ: CMU có sẵn "didn't", "i'm", "it's" như những
   * mục riêng, cắt dấu nháy ra là mất luôn phần lớn từ hay gặp nhất. */
  for (const m of text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g)) {
    words.add(m[0].toLowerCase());
  }
}

const out = {};
let hit = 0;
for (const w of [...words].sort()) {
  const arpa = dictionary[w];
  if (!arpa) continue;
  const ipa = toIpa(arpa);
  if (ipa) {
    out[w] = ipa;
    hit += 1;
  }
}

const body = `/* ============================================================================
 *  Phiên âm IPA — SINH TỰ ĐỘNG, ĐỪNG SỬA TAY
 * ============================================================================
 *
 *  Nguồn: CMU Pronouncing Dictionary.
 *  Sinh lại bằng: npm run build-phonemes
 *
 *  Chỉ chứa những từ xuất hiện trong nội dung học của app, nên nhẹ hơn từ điển
 *  gốc khoảng 50 lần mà vẫn phủ hết chỗ cần dùng.
 * ========================================================================== */

export const PHONEMES: Record<string, string> = ${JSON.stringify(out, null, 0)};

/** Tra phiên âm của một từ. Trả về chuỗi rỗng nếu không có trong từ điển. */
export function ipaOf(word: string): string {
  const key = word.toLowerCase().replace(/[^a-z']/g, '');
  return PHONEMES[key] ?? '';
}
`;

writeFileSync(join(ROOT, 'src/data/phonemes.ts'), body);
console.log(`Đã tra ${hit}/${words.size} từ → src/data/phonemes.ts`);
console.log(`Kích thước: ${(body.length / 1024).toFixed(1)} KB`);
console.log('Thử: three =', out.three, '| develop =', out.develop, '| street =', out.street);
