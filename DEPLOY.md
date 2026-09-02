# Deploy — việc nào bạn phải tự làm

Phần web đã tự động rồi: push lên `main` là GitHub Actions build và đưa lên
https://dalton-vo.github.io/echofluent/ trong khoảng hai phút.

Còn lại **một việc duy nhất cần bạn đăng nhập**: máy chủ đồng bộ.

---

## Vì sao tôi không làm hộ được

Worker chạy bằng **tài khoản Cloudflare của bạn**, và `wrangler login` mở
trình duyệt để bạn bấm đồng ý. Tôi không có tài khoản đó, và cũng không nên
có — nếu tôi deploy bằng tài khoản của tôi thì dữ liệu học của bạn nằm trên
tài khoản người khác.

Miễn phí, làm một lần rồi thôi.

---

## Ba lệnh

Mở Terminal, vào thư mục dự án:

```bash
cd worker

# 1. Đăng nhập Cloudflare (mở trình duyệt, bấm Allow)
npx wrangler login

# 2. Đặt mật khẩu đồng bộ.
#    CHÚ Ý: lệnh này chỉ nhận TÊN biến, không nhận giá trị.
#    Gõ xong bấm Enter, nó hiện "Enter a secret value:" thì mới dán mật khẩu.
npx wrangler secret put SYNC_SECRET

# 3. (tuỳ chọn) Nếu muốn khoá Gemini nằm ở máy chủ thay vì trong trình duyệt
npx wrangler secret put GEMINI_API_KEY

# 4. Đưa lên
npx wrangler deploy
```

Lệnh cuối in ra địa chỉ dạng:

```
https://echofluent-sync.<tên-của-bạn>.workers.dev
```

---

## Ba cái bẫy hay vấp

**Sai thư mục.** `wrangler` đọc `wrangler.jsonc` từ thư mục hiện tại. Đứng ở
`~` mà chạy thì nó báo *"Required Worker name missing"*. Phải `cd` vào
`echofluent/worker` trước.

**Gõ mật khẩu chung một dòng với tên biến.** `wrangler secret put SYNC_SECRET
abc123` sẽ báo *"Unknown argument: abc123"*. Lệnh chỉ nhận tên biến; giá trị
nhập ở dòng hỏi tiếp theo. Muốn tránh mật khẩu lọt vào lịch sử lệnh thì đưa
qua đường ống:

```bash
SECRET=$(openssl rand -base64 24)
printf '%s' "$SECRET" | npx wrangler secret put SYNC_SECRET
echo "Mật khẩu của bạn: $SECRET"
```

**Quên commit id của KV namespace.** File `worker/wrangler.jsonc` khai kho lưu
mà không có `id`. Lần deploy đầu, wrangler tự tạo namespace rồi tự ghi id vào
file — trên máy bạn. Không commit thay đổi đó thì lần deploy sau từ máy khác
sẽ tạo **namespace thứ hai**, và toàn bộ tiến độ cũ biến mất không một lời báo
lỗi: app chỉ thấy một kho trống. Sau lần deploy đầu, luôn chạy:

```bash
git diff worker/wrangler.jsonc     # có thêm dòng "id": "..." không?
git add worker/wrangler.jsonc && git commit -m "Ghi lại id KV namespace"
```

**Gõ thiếu chữ trong tên biến.** Đặt thành `SYNC_SECRE` thì lệnh vẫn báo thành
công, Worker vẫn deploy được, nhưng đồng bộ lặng lẽ không chạy — và bạn chỉ
phát hiện ra vào lúc đổi máy, tức là lúc đã mất tiến độ. Kiểm tra lại bằng:

```bash
npx wrangler secret list
```

Phải thấy đúng `SYNC_SECRET`. Lỡ đặt sai thì xoá đi:

```bash
npx wrangler secret delete SYNC_SECRE
```

---

## Sau khi deploy

1. Mở app → **Cài đặt → Mang tiến độ sang máy khác**
2. Dán địa chỉ Worker vào ô *Địa chỉ Worker*
3. Dán mật khẩu vừa đặt ở bước 2 vào ô *Mật khẩu đồng bộ*
4. App hiện ra **mã của bạn** dạng `EF1.…` — đó là thứ thay cho tài khoản

Trên máy/điện thoại khác: mở app → Cài đặt → dán mã đó vào ô *Đã có mã từ
máy khác* → bấm **Dùng mã**. Xong.

Tiến độ hai bên được **trộn** chứ không ghi đè, nên lỡ học ở cả hai máy cũng
không mất bên nào.

---

## Nếu muốn khoá Gemini nằm ở máy chủ

Chỉ nên làm khi bạn mở app trên máy dùng chung. Sau khi đã `wrangler secret
put GEMINI_API_KEY`:

- Cài đặt → **Chấm phát âm bằng AI** → mở phần *Cách an toàn hơn*
- Điền địa chỉ Worker
- Ô "Khoá" bên trên sẽ đổi nhãn thành **Mật khẩu Worker** — điền đúng giá trị
  `SYNC_SECRET`, không phải khoá Google

Khi đó trình duyệt không giữ khoá Google nữa. Worker chỉ nhận request kèm
đúng mật khẩu này, nên không ai xài ké được hạn mức của bạn.

---

## Kiểm tra deploy có sống không

```bash
curl https://echofluent-sync.<tên-của-bạn>.workers.dev/health
```

Trả về `{"ok":true,"service":"echofluent-sync"}` là chạy tốt.

Trong app cũng có nút **Kiểm tra kết nối** ở mục Chấm phát âm bằng AI.

---

## Nhắc về mã đồng bộ

Mã `EF1.…` **chính là mật khẩu**. Ai cầm được nó là đọc và ghi được tiến độ
của bạn. Gửi cho chính mình thì được, đừng đăng lên chỗ công khai.

Mã này không nằm trong file sao lưu (`sanitizeBackup` lọc ra), và cũng không
đi theo dữ liệu đồng bộ.
