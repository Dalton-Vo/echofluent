import { useStore } from '@/store/useStore';
import { mergeStates, type PersistedState, type SyncEnvelope } from '@/lib/merge';

/* ============================================================================
 *  ĐỒNG BỘ GIỮA CÁC THIẾT BỊ
 *
 *  Một lượt đồng bộ luôn đi đúng ba bước: KÉO VỀ → TRỘN → ĐẨY LÊN.
 *  Không bao giờ đẩy đè thẳng, vì làm vậy là ăn mất tiến độ của máy kia.
 *
 *  Mật khẩu nằm trong localStorage của từng máy, do người dùng tự nhập.
 *  Nó không có trong mã nguồn, không có trong bản build, không lên GitHub.
 * ========================================================================== */

export type SyncStatus = 'ok' | 'off' | 'error';

export interface SyncResult {
  status: SyncStatus;
  message: string;
  at: number;
}

/** Lấy đúng phần tiến độ cần đồng bộ ra khỏi store */
export function snapshot(): PersistedState {
  const s = useStore.getState();
  return {
    settings: s.settings,
    xp: s.xp,
    streak: s.streak,
    bestStreak: s.bestStreak,
    lastActive: s.lastActive,
    history: s.history,
    totals: s.totals,
    week: s.week,
    srs: s.srs,
    achievements: s.achievements,
    scenarioDone: s.scenarioDone,
    bestReactionMs: s.bestReactionMs,
    weakIds: s.weakIds,
    notes: s.notes,
    lastBackupAt: s.lastBackupAt,
    onboarded: s.onboarded,
  };
}

function endpoint(url: string): string {
  return `${url.replace(/\/+$/, '')}/state`;
}

function secureSyncUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

/** Kiểm tra máy chủ đồng bộ có sống không — không cần mật khẩu */
export async function pingSync(url: string): Promise<SyncResult> {
  if (!url.trim()) return fail('Chưa điền địa chỉ máy chủ.');
  if (!secureSyncUrl(url)) return fail('Địa chỉ đồng bộ phải bắt đầu bằng https://.');
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/health`);
    if (!res.ok) return fail(`Máy chủ trả về lỗi ${res.status}.`);
    const body = (await res.json()) as { service?: string };
    if (body.service !== 'echofluent-sync') {
      return fail('Địa chỉ này không phải máy chủ đồng bộ của EchoFluent.');
    }
    return { status: 'ok', message: 'Máy chủ đang chạy tốt.', at: Date.now() };
  } catch {
    return fail('Không gọi được tới máy chủ. Kiểm tra lại địa chỉ và mạng.');
  }
}

/**
 * Chạy một lượt đồng bộ đầy đủ.
 * An toàn khi gọi nhiều lần: hàm trộn là bất biến nên lặp lại không đổi dữ liệu.
 */
export async function syncNow(): Promise<SyncResult> {
  const { sync, lastSyncAt, hydrate } = useStore.getState();

  if (!sync.url.trim() || !sync.secret.trim()) {
    return { status: 'off', message: 'Chưa bật đồng bộ.', at: Date.now() };
  }
  if (!secureSyncUrl(sync.url)) return fail('Địa chỉ đồng bộ phải bắt đầu bằng https://.');

  const headers = {
    Authorization: `Bearer ${sync.secret}`,
    'Content-Type': 'application/json',
  };

  /* ---------- 1. kéo về ---------- */
  let remote: SyncEnvelope | null = null;
  try {
    const res = await fetch(endpoint(sync.url), { headers });

    if (res.status === 401) return fail('Sai mật khẩu đồng bộ.');
    if (res.status === 404) {
      remote = null; // máy chủ chưa có gì — lần đầu đồng bộ
    } else if (!res.ok) {
      return fail(`Máy chủ trả về lỗi ${res.status}.`);
    } else {
      remote = (await res.json()) as SyncEnvelope;
    }
  } catch {
    return fail('Không kết nối được tới máy chủ đồng bộ.');
  }

  /* ---------- 2. trộn ---------- */
  const local = snapshot();
  let merged = local;

  if (remote?.data) {
    // Nếu máy chủ được ghi sau lần đồng bộ gần nhất của máy này, nghĩa là máy
    // kia có thay đổi mà máy này chưa biết → coi bản trên máy chủ là mới hơn.
    const remoteIsNewer = (remote.updatedAt ?? 0) > (lastSyncAt ?? 0);
    merged = mergeStates(local, remote.data, remoteIsNewer);
    hydrate(merged);
  }

  /* ---------- 3. đẩy lên ---------- */
  try {
    const body: SyncEnvelope = { updatedAt: Date.now(), data: merged };
    const res = await fetch(endpoint(sync.url), {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    if (res.status === 401) return fail('Sai mật khẩu đồng bộ.');
    if (!res.ok) return fail(`Đẩy dữ liệu lên thất bại (lỗi ${res.status}).`);
  } catch {
    return fail('Kéo về được nhưng đẩy lên thất bại.');
  }

  useStore.setState({ lastSyncAt: Date.now() });

  return {
    status: 'ok',
    message: remote?.data
      ? 'Đã trộn xong tiến độ của cả hai máy.'
      : 'Đã tải tiến độ của máy này lên lần đầu.',
    at: Date.now(),
  };
}

/** Xoá sạch dữ liệu trên máy chủ đồng bộ (không đụng tới máy này) */
export async function wipeRemote(): Promise<SyncResult> {
  const { sync } = useStore.getState();
  if (!sync.url.trim() || !sync.secret.trim()) return fail('Chưa bật đồng bộ.');
  if (!secureSyncUrl(sync.url)) return fail('Địa chỉ đồng bộ phải bắt đầu bằng https://.');
  try {
    const res = await fetch(endpoint(sync.url), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sync.secret}` },
    });
    if (!res.ok) return fail(`Xoá thất bại (lỗi ${res.status}).`);
    useStore.setState({ lastSyncAt: null });
    return { status: 'ok', message: 'Đã xoá dữ liệu trên máy chủ.', at: Date.now() };
  } catch {
    return fail('Không kết nối được tới máy chủ.');
  }
}

function fail(message: string): SyncResult {
  return { status: 'error', message, at: Date.now() };
}

/* ------------------------------ link cấu hình ------------------------------ */

/**
 * Tạo một đường link chứa sẵn địa chỉ và mật khẩu, để khỏi phải gõ tay trên
 * điện thoại. Mở link đó trên máy kia là app tự điền.
 *
 * ⚠️ Link này chứa mật khẩu đồng bộ. Chỉ tự gửi cho chính mình.
 */
export function buildSetupLink(baseUrl: string, url: string, secret: string): string {
  if (!secureSyncUrl(url) || !secret.trim()) return '';
  const payload = btoa(
    encodeURIComponent(JSON.stringify({ u: url, s: secret })),
  );
  return `${baseUrl.replace(/#.*$/, '')}#/settings?sync=${payload}`;
}

/** Đọc cấu hình từ link nếu có. Trả về null nếu link không chứa gì. */
export function readSetupLink(hash: string): { url: string; secret: string } | null {
  const m = hash.match(/[?&]sync=([^&]+)/);
  if (!m) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(m[1]))) as { u?: string; s?: string };
    if (!parsed.u || !parsed.s) return null;
    if (!secureSyncUrl(parsed.u)) return null;
    return { url: parsed.u, secret: parsed.s };
  } catch {
    return null;
  }
}


/* ============================================================================
 *  Mã đồng bộ — thứ đóng vai "tài khoản"
 * ============================================================================
 *
 *  App này không có máy chủ tài khoản, nên cũng không có đăng nhập theo nghĩa
 *  thường. Thay vào đó là MỘT mã duy nhất gói cả địa chỉ máy chủ lẫn mật khẩu.
 *  Dán mã đó vào máy mới là tiến độ về đủ — về mặt sử dụng thì không khác gì
 *  đăng nhập.
 *
 *  Vì sao không làm tài khoản thật: tài khoản đòi máy chủ giữ mật khẩu người
 *  dùng, và giữ mật khẩu cho tử tế là việc dễ làm sai tới mức nguy hiểm. Một
 *  mã ngẫu nhiên đủ dài thì không có gì để lộ ngoài chính nó.
 *
 *  Mã này CHÍNH LÀ mật khẩu. Ai cầm được mã là đọc ghi được tiến độ của bạn —
 *  đừng đưa lên chỗ công khai.
 * ========================================================================== */

const CODE_PREFIX = 'EF1.';

/** Base64 an toàn cho URL và cho việc gõ tay: bỏ +/= dễ nhầm */
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafe(s: string): string {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  return t + '='.repeat((4 - (t.length % 4)) % 4);
}

/** Gói địa chỉ Worker và mật khẩu thành một mã để mang sang máy khác */
export function buildSyncCode(url: string, secret: string): string {
  if (!url.trim() || !secret.trim()) return '';
  if (!secureSyncUrl(url)) return '';
  const packed = btoa(encodeURIComponent(JSON.stringify({ u: url.trim(), s: secret.trim() })));
  return CODE_PREFIX + toUrlSafe(packed);
}

/**
 * Đọc mã đồng bộ.
 *
 * Bỏ qua khoảng trắng ở hai đầu và cả xuống dòng: mã hay đi qua Zalo hay ghi
 * chú rồi dính thêm ký tự thừa, mà lỗi đó thì người dùng không tài nào tự
 * nhìn ra được.
 */
export function readSyncCode(code: string): { url: string; secret: string } | null {
  const clean = code.trim().replace(/\s+/g, '');
  if (!clean.startsWith(CODE_PREFIX)) return null;
  try {
    const parsed = JSON.parse(
      decodeURIComponent(atob(fromUrlSafe(clean.slice(CODE_PREFIX.length)))),
    ) as { u?: string; s?: string };
    if (!parsed.u || !parsed.s) return null;
    // Chỉ nhận https — mã này mang theo mật khẩu, gửi qua http là lộ.
    if (!secureSyncUrl(parsed.u)) return null;
    return { url: parsed.u, secret: parsed.s };
  } catch {
    return null;
  }
}

/** Sinh mật khẩu đồng bộ ngẫu nhiên — dùng khi lập "tài khoản" lần đầu */
export function randomSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return toUrlSafe(btoa(String.fromCharCode(...bytes)));
}
