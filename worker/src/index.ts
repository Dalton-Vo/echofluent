/**
 * ============================================================================
 *  EchoFluent — máy chủ đồng bộ tiến độ
 * ============================================================================
 *
 *  Nhiệm vụ duy nhất: giữ MỘT cục JSON tiến độ học, cho phép đọc và ghi đè.
 *  Việc trộn dữ liệu giữa hai thiết bị do phía trình duyệt lo (src/lib/merge.ts),
 *  ở đây cố tình giữ thật ngu và thật nhỏ để không có gì hỏng được.
 *
 *  Bảo mật: một mật khẩu duy nhất, đặt bằng `wrangler secret put SYNC_SECRET`.
 *  Nó là secret phía máy chủ — KHÔNG bao giờ nằm trong bundle của trang web.
 *  Trình duyệt gửi nó lên qua header Authorization.
 *
 *  API:
 *    GET  /health  → không cần mật khẩu, dùng để kiểm tra deploy có sống không
 *    GET  /state   → { updatedAt, data } | 404 nếu chưa có gì
 *    PUT  /state   → nhận { updatedAt, data }, ghi đè
 *    DELETE /state → xoá sạch
 */

interface Env {
  STATE: KVNamespace;
  SYNC_SECRET: string;
  ALLOWED_ORIGINS: string;
}

const KEY = 'progress';
const MAX_BYTES = 2_000_000; // tiến độ thật chỉ vài KB; đây là chặn phòng hờ

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'echofluent-sync' }, 200, cors);
    }

    if (url.pathname !== '/state') {
      return json({ error: 'not_found' }, 404, cors);
    }

    if (!env.SYNC_SECRET) {
      return json(
        { error: 'chua_dat_mat_khau', hint: 'Chạy: npx wrangler secret put SYNC_SECRET' },
        500,
        cors,
      );
    }

    if (!(await authorized(request, env.SYNC_SECRET))) {
      return json({ error: 'sai_mat_khau' }, 401, cors);
    }

    switch (request.method) {
      case 'GET': {
        const stored = await env.STATE.get(KEY, 'text');
        if (!stored) return json({ error: 'chua_co_du_lieu' }, 404, cors);
        return new Response(stored, {
          status: 200,
          headers: { ...cors, 'content-type': 'application/json; charset=utf-8' },
        });
      }

      case 'PUT': {
        const body = await request.text();
        if (body.length > MAX_BYTES) return json({ error: 'du_lieu_qua_lon' }, 413, cors);

        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch {
          return json({ error: 'json_khong_hop_le' }, 400, cors);
        }
        if (typeof parsed !== 'object' || parsed === null || !('data' in parsed)) {
          return json({ error: 'thieu_truong_data' }, 400, cors);
        }

        await env.STATE.put(KEY, body);
        return json({ ok: true, bytes: body.length }, 200, cors);
      }

      case 'DELETE': {
        await env.STATE.delete(KEY);
        return json({ ok: true }, 200, cors);
      }

      default:
        return json({ error: 'method_khong_ho_tro' }, 405, cors);
    }
  },
} satisfies ExportedHandler<Env>;

/* ------------------------------ tiện ích ------------------------------ */

/**
 * So sánh mật khẩu theo kiểu không lộ thời gian.
 * Băm cả hai trước để hai chuỗi luôn cùng độ dài — timingSafeEqual đòi hỏi vậy,
 * và làm thế thì độ dài mật khẩu cũng không bị lộ qua thời gian phản hồi.
 */
async function authorized(request: Request, secret: string): Promise<boolean> {
  const header = request.headers.get('Authorization') ?? '';
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!given) return false;

  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(given)),
    crypto.subtle.digest('SHA-256', enc.encode(secret)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

function corsHeaders(origin: string | null, allowed: string): Record<string, string> {
  const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  const ok = origin && list.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : list[0] ?? '',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'content-type': 'application/json; charset=utf-8' },
  });
}
