#!/usr/bin/env bash
# =============================================================================
#  Kiểm tra máy chủ đồng bộ sau khi deploy
# =============================================================================
#
#  Chạy:
#     bash scripts/check-worker.sh https://echofluent-sync.<tên>.workers.dev
#
#  Nó sẽ hỏi mật khẩu SYNC_SECRET, rồi thử đủ vòng: sống chưa, có chặn người
#  lạ không, ghi được không, đọc lại có đúng không, và dọn sạch sau khi thử.
#
#  Vì sao cần: sai một chữ trong tên biến bí mật thì mọi thứ vẫn "chạy", chỉ
#  là đồng bộ lặng lẽ không hoạt động — và bạn chỉ phát hiện ra vào lúc đổi
#  máy, tức là lúc đã mất tiến độ.
# =============================================================================

set -uo pipefail

URL="${1:-}"
if [ -z "$URL" ]; then
  echo "Thiếu địa chỉ Worker."
  echo "Dùng: bash scripts/check-worker.sh https://echofluent-sync.<tên>.workers.dev"
  exit 1
fi
URL="${URL%/}"

printf "Dán mật khẩu SYNC_SECRET (gõ vào sẽ không hiện): "
read -rs SECRET
echo
[ -z "$SECRET" ] && { echo "Chưa nhập mật khẩu."; exit 1; }

pass=0
fail=0
ok()   { echo "  ✅ $1"; pass=$((pass+1)); }
bad()  { echo "  ❌ $1"; fail=$((fail+1)); }

echo
echo "Đang kiểm tra $URL"
echo

# --- 1. Worker sống chưa -----------------------------------------------------
echo "1. Worker có chạy không"
body=$(curl -sS --max-time 20 "$URL/health" 2>&1)
if echo "$body" | grep -q '"ok":true'; then
  ok "Worker đang chạy"
else
  bad "Không gọi được /health — kiểm tra lại địa chỉ, hoặc deploy chưa xong"
  echo "     máy chủ trả về: $body"
  echo
  echo "Dừng ở đây vì các bước sau đều cần Worker sống."
  exit 1
fi

# --- 2. Có chặn người lạ không ----------------------------------------------
echo
echo "2. Có chặn người không có mật khẩu không"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 "$URL/state")
if [ "$code" = "401" ]; then
  ok "Không mật khẩu thì bị chặn (401)"
else
  bad "Đáng lẽ phải trả 401 mà lại trả $code — máy chủ đang mở cho bất kỳ ai"
fi

code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 \
  -H "Authorization: Bearer mat-khau-bay-ba" "$URL/state")
if [ "$code" = "401" ]; then
  ok "Mật khẩu sai cũng bị chặn (401)"
else
  bad "Mật khẩu sai lại trả $code"
fi

# --- 3. Mật khẩu của bạn có đúng không --------------------------------------
echo
echo "3. Mật khẩu bạn vừa đặt có khớp không"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 \
  -H "Authorization: Bearer $SECRET" "$URL/state")
if [ "$code" = "401" ]; then
  bad "Mật khẩu KHÔNG khớp."
  echo "     Hay gặp nhất: đặt nhầm tên biến. Phải đúng là SYNC_SECRET."
  echo "     Kiểm tra bằng:  npx wrangler secret list"
  echo "     Đặt lại bằng:   npx wrangler secret put SYNC_SECRET"
  echo
  echo "Dừng ở đây vì các bước sau đều cần đúng mật khẩu."
  exit 1
elif [ "$code" = "404" ]; then
  ok "Mật khẩu đúng (chưa có dữ liệu nào — bình thường với máy chủ mới)"
elif [ "$code" = "200" ]; then
  ok "Mật khẩu đúng, và đã có sẵn tiến độ trên máy chủ"
else
  bad "Trả về mã lạ: $code"
fi

# --- 4. Ghi và đọc lại ------------------------------------------------------
echo
echo "4. Ghi lên rồi đọc lại có đúng không"
STAMP="kiem-tra-$(date +%s)"

# Giữ lại tiến độ đang có, để lát nữa trả về nguyên trạng.
BACKUP=$(curl -sS --max-time 20 -H "Authorization: Bearer $SECRET" "$URL/state" 2>/dev/null)
HAD_DATA=$(echo "$BACKUP" | grep -c '"data"' || true)

code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 -X PUT \
  -H "Authorization: Bearer $SECRET" -H "content-type: application/json" \
  -d "{\"updatedAt\":1,\"data\":{\"thu\":\"$STAMP\"}}" "$URL/state")
if [ "$code" = "200" ]; then
  ok "Ghi lên được"
else
  bad "Ghi thất bại (mã $code)"
fi

got=$(curl -sS --max-time 20 -H "Authorization: Bearer $SECRET" "$URL/state")
if echo "$got" | grep -q "$STAMP"; then
  ok "Đọc lại đúng thứ vừa ghi"
else
  bad "Đọc lại KHÔNG khớp — dữ liệu không được giữ đúng"
  echo "     máy chủ trả về: $got"
fi

# --- 5. Trả lại nguyên trạng ------------------------------------------------
echo
echo "5. Dọn dẹp"
if [ "$HAD_DATA" -gt 0 ]; then
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 -X PUT \
    -H "Authorization: Bearer $SECRET" -H "content-type: application/json" \
    -d "$BACKUP" "$URL/state")
  [ "$code" = "200" ] && ok "Đã trả lại tiến độ có sẵn từ trước" \
                      || bad "KHÔNG trả lại được tiến độ cũ — mở app và bấm đồng bộ tay ngay"
else
  curl -sS -o /dev/null --max-time 20 -X DELETE \
    -H "Authorization: Bearer $SECRET" "$URL/state"
  ok "Đã xoá dữ liệu thử (trước đó máy chủ vốn trống)"
fi

# --- 6. Proxy AI (tuỳ chọn) -------------------------------------------------
echo
echo "6. Proxy chấm phát âm (bỏ qua nếu bạn không đặt GEMINI_API_KEY)"
resp=$(curl -sS --max-time 30 -X POST \
  -H "Authorization: Bearer $SECRET" \
  -H "content-type: application/json" \
  -H "Origin: https://dalton-vo.github.io" \
  -d '{"contents":[{"role":"user","parts":[{"text":"Tra loi dung mot chu: OK"}]}]}' \
  "$URL/ai/gemini-3.5-flash")
if echo "$resp" | grep -q '"candidates"'; then
  ok "Proxy AI chạy được — khoá Gemini đang nằm ở máy chủ"
elif echo "$resp" | grep -q 'chua_dat_khoa_ai'; then
  echo "  ⏭  Chưa đặt GEMINI_API_KEY — bỏ qua, không sao"
  echo "     (chỉ cần nếu bạn muốn khoá Google nằm ở máy chủ thay vì trong trình duyệt)"
else
  bad "Proxy AI trả về thứ lạ"
  echo "     máy chủ trả về: $(echo "$resp" | head -c 200)"
fi

# --- kết luận ---------------------------------------------------------------
echo
echo "────────────────────────────────"
if [ "$fail" -eq 0 ]; then
  echo "Xong: $pass mục đạt, không có lỗi."
  echo
  echo "Giờ mở app → Cài đặt → Mang tiến độ sang máy khác, điền:"
  echo "  Địa chỉ Worker : $URL"
  echo "  Mật khẩu       : chuỗi bạn vừa nhập ở đây"
  echo
  echo "App sẽ hiện ra mã EF1.… — đó là thứ dán sang máy khác."
else
  echo "Có $fail mục KHÔNG đạt (và $pass mục đạt)."
  echo "Đừng giao tiến độ cho máy chủ này cho tới khi sửa xong."
fi
