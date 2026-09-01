/* ============================================================================
 *  CẤU HÌNH LỚP KHOÁ PIN
 *
 *  File này do `npm run set-pin -- <mã>` sinh ra — đừng sửa tay.
 *  Ở đây chỉ chứa muối (salt) và giá trị băm, KHÔNG chứa mã PIN.
 *
 *  ⚠️ Nói cho rõ ràng: đây là TẤM RÈM, không phải Ổ KHOÁ.
 *  Trang này là web tĩnh nên toàn bộ mã chạy ở phía trình duyệt. Người rành kỹ
 *  thuật tải bundle về và dò offline vẫn ra được mã PIN — PBKDF2 200k vòng chỉ
 *  làm việc đó chậm và phiền, chứ không chặn được.
 *  Nó đủ để người lạ tình cờ mở link không vào được. Đừng bao giờ đặt dữ liệu
 *  thật sự nhạy cảm sau lớp này.
 * ========================================================================== */

export interface GateConfig {
  enabled: boolean;
  /** muối ngẫu nhiên, dạng hex */
  salt: string;
  /** kết quả PBKDF2-SHA256 của mã PIN, dạng hex */
  hash: string;
  iterations: number;
}

export const GATE: GateConfig = {
  enabled: true,
  salt: 'b8fe13ddbbb913b6b310bee3b31c5155',
  hash: '9f9b2c5045957163d97642fb13d5e2a0853c818de8bcf2819dc6884130d8e241',
  iterations: 200000,
};

/** Băm mã PIN đúng cách mà script set-pin đã dùng */
export async function derive(pin: string, salt: string, iterations: number): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    // ép kiểu vì TypeScript mới phân biệt ArrayBuffer với SharedArrayBuffer,
    // còn Uint8Array tạo bằng độ dài thì mang kiểu chung ArrayBufferLike
    { name: 'PBKDF2', salt: hexToBytes(salt) as BufferSource, iterations, hash: 'SHA-256' },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}
