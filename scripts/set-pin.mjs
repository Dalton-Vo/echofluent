#!/usr/bin/env node
/**
 * Đặt hoặc đổi mã PIN mở app.
 *
 *   npm run set-pin -- 481902     đặt mã 481902
 *   npm run set-pin -- --off      gỡ bỏ lớp khoá
 *   npm run set-pin               tự sinh một mã 6 số ngẫu nhiên
 *
 * Script ghi muối + giá trị băm vào src/gate.config.ts. Mã PIN KHÔNG được lưu
 * ở đâu cả — nên nếu quên thì chỉ việc chạy lại script để đặt mã mới.
 */
import { webcrypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ITERATIONS = 200000;
const here = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(here, '../src/gate.config.ts');

const arg = process.argv[2];

function hex(bytes) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function derive(pin, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  const key = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await webcrypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return hex(bits);
}

function write({ enabled, salt, hash }) {
  const src = readFileSync(configPath, 'utf8');
  const next = src.replace(
    /export const GATE: GateConfig = \{[\s\S]*?\n\};/,
    `export const GATE: GateConfig = {
  enabled: ${enabled},
  salt: '${salt}',
  hash: '${hash}',
  iterations: ${ITERATIONS},
};`,
  );
  if (next === src) {
    console.error('✗ Không tìm thấy khối GATE trong src/gate.config.ts — file có bị sửa tay không?');
    process.exit(1);
  }
  writeFileSync(configPath, next);
}

if (arg === '--off') {
  write({ enabled: false, salt: '', hash: '' });
  console.log('✓ Đã gỡ lớp khoá PIN. Ai có link cũng vào thẳng được.');
  console.log('  Nhớ commit và push lại để bản trên mạng cập nhật theo.');
  process.exit(0);
}

const pin = arg ?? String(Math.floor(100000 + webcrypto.getRandomValues(new Uint32Array(1))[0] % 900000));

if (!/^\d{4,12}$/.test(pin)) {
  console.error('✗ Mã PIN phải là 4–12 chữ số.');
  process.exit(1);
}

const salt = hex(webcrypto.getRandomValues(new Uint8Array(16)));
const hash = await derive(pin, salt);
write({ enabled: true, salt, hash });

console.log('');
console.log('  ✓ Đã đặt mã PIN mới');
console.log('');
console.log(`      ┌──────────────┐`);
console.log(`      │   ${pin.padEnd(10)} │`);
console.log(`      └──────────────┘`);
console.log('');
console.log('  Ghi lại mã này — nó không được lưu ở bất kỳ đâu.');
console.log('  Quên thì chạy lại lệnh này để đặt mã khác.');
console.log('');
console.log('  Bước tiếp theo: git add -A && git commit -m "đổi mã PIN" && git push');
console.log('');
