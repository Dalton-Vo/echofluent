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
#    Lấy mật khẩu từ trong app: Cài đặt → Mang tiến độ sang máy khác → nút "Sinh".
#    Chép ra rồi dán vào đây khi được hỏi.
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
