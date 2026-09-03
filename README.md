# 🗣️ EchoFluent

**Luyện phản xạ giao tiếp tiếng Anh — không phải luyện thi.**

Một web app chạy hoàn toàn trên máy bạn, thiết kế riêng cho một lập trình viên Việt Nam
muốn nói tiếng Anh trôi chảy **cả trong công việc lẫn ngoài đời sống**.

Mục tiêu không phải điểm IELTS. Mục tiêu là: **nghe người ta nói xong là hiểu liền, và
đáp lại được ngay** — không phải dịch trong đầu, không phải im lặng ba giây rồi mới ra
được nửa câu.

---

## Cách dùng

### Bản đã deploy (khuyên dùng)

**<https://dalton-vo.github.io/echofluent/>**

Mở bằng Chrome trên máy tính hoặc điện thoại, nhập mã PIN là học được ngay. Không cần
cài gì cả.

> **Về lớp mã PIN:** nó là *tấm rèm*, không phải *ổ khoá*. Trang này là web tĩnh nên mọi
> thứ chạy ở trình duyệt — người rành kỹ thuật tải bundle về dò offline vẫn ra được mã.
> Nó đủ để người lạ tình cờ mở link không vào được, thế thôi. Đừng đặt gì nhạy cảm sau nó.
> Muốn chặn thật thì cần Cloudflare Access hoặc GitHub Pages trên gói trả phí.

Đổi mã PIN:

```bash
npm run set-pin -- 123456
```

Rồi `git add -A && git commit -m "đổi mã" && git push` — khoảng một phút sau bản trên
mạng tự cập nhật. Chạy `npm run set-pin` không kèm số thì máy tự sinh mã ngẫu nhiên;
`npm run set-pin -- --off` thì gỡ hẳn lớp khoá.

### Chạy ở máy

```bash
npm install
```

```bash
npm run dev
```

Mở <http://localhost:5180>.

> ⚠️ Tiến độ lưu trong `localStorage` của **từng trình duyệt và từng tên miền**, nên bản
> localhost và bản trên mạng là hai kho riêng. Trỏ cả hai vào cùng một máy chủ đồng bộ
> thì chúng gặp nhau; không thì dùng **Cài đặt → Dữ liệu → Tải file sao lưu**.

### Kiểm tra chất lượng

```bash
npm run check
```

Chạy một lượt: kiểm tra kiểu dữ liệu → 208 test → build. Workflow deploy cũng chạy đúng
bộ này trước khi đẩy lên, nên nội dung sai thì không lên được mạng.

---

## Vì sao lại làm khác các app học tiếng Anh khác

Hầu hết app dạy bạn **biết thêm**. App này ép bạn **bật ra nhanh hơn**.

| Vấn đề thật của bạn | Cách app xử lý |
|---|---|
| Nghe người bản xứ nói là không kịp | **Listening Gym** — dạy tai nhận ra dạng *nói thật* (`Whaddaya wanna do?`) chứ không phải dạng *viết trong sách* (`What do you want to do?`) |
| Biết từ nhưng đến lúc nói thì đứng hình | **Reflex Drill** — có đồng hồ đếm ngược. Câu xấu mà nhanh được điểm cao hơn câu đẹp mà chậm |
| Nói đều đều từng chữ, nghe rất "Tây học tiếng Việt" | **Shadowing** — nói đè lên giọng mẫu, có đánh dấu sẵn trọng âm và chỗ ngắt hơi |
| Vào tình huống thật là quên sạch | **Nhập vai** — 12 hoàn cảnh có thật, mỗi lượt nói có nhiệm vụ riêng |
| Học xong vài hôm là quên | **Ôn tập bằng miệng** — lặp lại ngắt quãng, nhưng bắt buộc phải NÓI mới được lật thẻ |
| Nhớ được nghĩa nhưng không nhớ để dùng | **Mẹo nhớ cho từng cụm** — bẻ nghĩa đen, cảnh báo lỗi người Việt hay mắc, phân biệt với cụm dễ nhầm; cộng thêm ô ghi chú để bạn tự viết bằng lời mình |
| Không biết hôm nay nên tập gì | **Buổi học hôm nay** — bốn bước theo công thức 15 phút, tự đánh dấu khi xong |

---

## Bảy chế độ luyện

| Chế độ | Chữa bệnh gì | Thời lượng |
|---|---|---|
| ⚡ **Phản xạ nhanh** | Đứng hình, phải dịch trong đầu | 5–12 phút |
| 🎧 **Luyện nghe hiểu liền** | Nghe không kịp người bản xứ | 5 phút |
| 🔁 **Nói đuổi (shadowing)** | Nhịp điệu và trọng âm sai | 6 phút |
| 🎭 **Nhập vai tình huống** | Vào việc thật là quên sạch | 5–7 phút |
| 📚 **Thư viện cụm** | Không biết nói gì cho tự nhiên | tra cứu |
| ♻️ **Ôn tập bằng miệng** | Học rồi quên | 5 phút |
| 📊 **Tiến độ** | Không thấy mình tiến bộ nên nản | — |

### Bốn kiểu bài trong Phản xạ nhanh

- **Trả lời** — nghe câu hỏi tiếng Anh, đáp ngay trong 6–10 giây.
- **Việt → Anh** — thấy câu tiếng Việt, bật ra tiếng Anh trong 5 giây. Không dịch từng chữ.
- **Khai triển** — cho ba chữ (`deploy failed yesterday`), tự phình thành câu đủ ý.
- **Phản ứng** — nghe một câu, phản ứng như người bản xứ. Cấm im lặng, cấm "ok".

---

## Nội dung có sẵn

Tất cả viết tay, nhắm thẳng vào bối cảnh của bạn — dev mobile/game, họp bằng tiếng Anh,
sống và xoay xở bằng tiếng Anh:

- **223 cụm phản xạ** sắp theo *chức năng giao tiếp* (câu giờ, phản đối lịch sự, làm rõ,
  giành lượt nói…) chứ không theo chủ đề từ vựng
- **83 câu hỏi phản xạ** trải đều 4 kiểu bài
- **74 bài luyện nghe** về nuốt âm, nối âm, rút gọn, âm yếu, số má, cụm động từ, thành ngữ
- **14 tình huống nhập vai** — 123 lượt thoại, trong đó **62 lượt bạn phải nói**, kèm
  **124 cách nói thay thế** để không bị đóng khung vào một câu duy nhất
- **12 bộ shadowing** (73 câu) đã đánh dấu sẵn trọng âm và nhóm nghĩa
- **223 mẹo nhớ** — mỗi cụm một cái móc để bám: nghĩa đen, lỗi hay mắc, cụm dễ nhầm
- **14 huy hiệu** và nhiệm vụ tuần đổi mới mỗi thứ Hai

### Mảng nói bựa

**47 cụm** tiếng Anh mà người bản xứ thật sự dùng khi không có ai chấm điểm — chửi thề,
cà khịa bạn bè, xả bực, dẹp chuyện. Bật bằng nút **🔥 Chỉ cụm bựa** trong Thư viện cụm;
nội dung cũng tự chảy vào Phản xạ, Luyện nghe, Nhập vai và Nói đuổi.

Mỗi cụm mang một **thang độ nóng** ba bậc (15 nhẹ · 17 vừa · 15 nặng) và một dòng nói rõ
*nói được với ai, tuyệt đối tránh chỗ nào*. Cái nguy hiểm không phải là không biết chửi —
mà là biết một câu rồi mang ra dùng sai phòng.

Trọng tâm không phải danh sách từ bậy mà là **ngữ pháp của chửi thề**: `fucking` chèn làm
trạng từ (`it's fucking brilliant` là lời KHEN), `the fuck` chèn vào câu hỏi,
`abso-fucking-lutely` chèn vào giữa một từ, và bẫy Anh–Mỹ `pissed` (Mỹ = cáu, Anh = xỉn).
Phần luyện nghe nhắm đúng chỗ khó nhất: chửi thề là nơi nuốt âm nặng nhất — `for fuck's
sake` dính thành một tiếng, `piece of shit` thành “peesa shit”.

**Không có từ miệt thị** nhắm vào chủng tộc, giới tính hay xu hướng tính dục, và có test
quét chặn để nội dung thêm sau này không vô tình kéo chúng vào. Chửi thề sai chỗ làm bạn
nghe thô; một từ miệt thị làm bạn mất bạn và mất việc — hai thứ đó không cùng một thang.

Toàn bộ dự án có **208 test**. Riêng phần nội dung có 48 phép kiểm tra chất lượng thật
sự, chứ không chỉ kiểm tra cú pháp:

- câu ví dụ phải thật sự chứa cụm đang dạy
- câu mẫu phải tự chấm được điểm cao — nếu không thì người học không bao giờ đạt nổi
- đáp án đúng của bài nghe không được nhận ra chỉ nhờ độ dài (bẫy kinh điển của trắc nghiệm)
- mọi cụm mà tình huống tham chiếu đều phải tồn tại
- mọi cụm đều phải có mẹo nhớ
- mọi cụm bựa đều phải nói rõ độ nóng và chỗ dùng được — thiếu là fail
- không một từ miệt thị nào lọt vào bất kỳ tệp nội dung nào

Muốn thêm nội dung? Mọi file trong `src/data/` đều có chú thích tiếng Việt và cấu trúc rõ
ràng — thêm một object là xong.

---

## Công nghệ

- **React 18 + TypeScript + Vite** — build 1,6 giây
- **Tailwind CSS** với biến CSS → đổi sáng/tối không cần viết lại style
- **Zustand + persist** — toàn bộ tiến độ nằm trong `localStorage`
- **Web Speech API** — phát âm và nhận diện giọng nói *ngay trong trình duyệt*.
  Không API key, không tốn tiền, không gửi giọng bạn đi đâu.
- **Cloudflare Worker + KV** — chỉ dùng khi bạn bật đồng bộ đa thiết bị, và chỉ để giữ
  đúng một cục JSON tiến độ. Không bật thì app chạy hoàn toàn ngoại tuyến.
- Không tài khoản. Không tracking.

### Yêu cầu trình duyệt

| Tính năng | Chrome / Edge | Safari | Firefox |
|---|---|---|---|
| Phát âm (TTS) | ✅ | ✅ | ✅ |
| Nhận diện giọng nói (chấm điểm tự động) | ✅ | ⚠️ một phần | ❌ |

**Khuyến nghị dùng Chrome.** Với Firefox, app tự chuyển sang chế độ tự chấm: bạn vẫn nói
ra miệng bình thường, chỉ là tự đánh giá thay vì máy chấm. Toàn bộ bài tập vẫn dùng được.

Lần đầu vào bài nói, trình duyệt sẽ xin quyền micro — bấm **Allow**.

---

## Cấu trúc thư mục

```
src/
├── data/           ← toàn bộ nội dung học, sửa thoải mái
│   ├── chunks.ts       223 cụm phản xạ (47 cụm bựa có thang độ nóng)
│   ├── memoryHooks.ts  223 mẹo nhớ đi kèm
│   ├── reflex.ts       83 câu hỏi phản xạ
│   ├── listening.ts    74 bài nghe
│   ├── scenarios.ts    14 tình huống nhập vai
│   ├── shadowing.ts    12 bộ shadowing (73 câu)
│   └── gamify.ts       nhiệm vụ, huy hiệu, hệ thống cấp độ
├── lib/
│   ├── speech.ts       bọc Web Speech API (đọc + nghe)
│   ├── match.ts        chấm điểm câu nói (cố tình dễ tính)
│   ├── srs.ts          lặp lại ngắt quãng kiểu SM-2 rút gọn
│   ├── merge.ts        trộn tiến độ giữa hai thiết bị (phần dễ mất dữ liệu nhất)
│   ├── sync.ts         kéo về → trộn → đẩy lên
│   └── utils.ts
├── store/useStore.ts   toàn bộ tiến độ + localStorage
├── hooks/useSpeech.ts  hook cho TTS, micro, đồng hồ đếm ngược
├── components/         Shell, các nút mic/loa, vòng đếm ngược
└── pages/              9 màn hình
```

---

## Máy chủ đồng bộ

Nằm trong [`worker/`](worker/) — một Cloudflare Worker khoảng 150 dòng, nhiệm vụ duy nhất
là giữ một cục JSON và cho đọc/ghi bằng mật khẩu. Việc trộn dữ liệu cố ý đặt hết ở phía
trình duyệt để máy chủ không có gì hỏng được.

| Endpoint | Việc |
|---|---|
| `GET /health` | kiểm tra máy chủ sống, không cần mật khẩu |
| `GET /state` | lấy tiến độ đang lưu |
| `PUT /state` | ghi đè tiến độ |
| `DELETE /state` | xoá sạch |

Chạy thử ở máy: `cd worker && npx wrangler dev` (tạo file `.dev.vars` với
`SYNC_SECRET=...` trước; file này đã được gitignore).

## Deploy

Đã dựng sẵn. Mỗi lần `git push` lên `main`, GitHub Actions tự chạy typecheck + test +
build rồi cập nhật <https://dalton-vo.github.io/echofluent/>. Xem tiến trình ở tab
**Actions** của repo.

Vì Pages phục vụ trang ở thư mục con `/echofluent/`, mọi đường dẫn ảnh phải đi qua helper
`asset()` trong [`src/lib/utils.ts`](src/lib/utils.ts). Thêm ảnh mới mà quên bọc qua nó
thì ảnh sẽ chạy ở máy nhưng 404 sau khi deploy.

## Tiến độ được lưu thế nào

App **có nhớ**: XP, chuỗi ngày, bộ thẻ ôn, ghi chú, huy hiệu, tình huống đã diễn — tất cả
tự lưu, đóng trình duyệt mở lại vẫn còn nguyên. Không cần đăng nhập.

Nhưng nó lưu trong `localStorage`, nên có ba giới hạn thật:

| Tình huống | Kết quả |
|---|---|
| Đóng tab, tắt máy, mở lại | ✅ còn nguyên |
| Điện thoại và máy tính | ✅ tự đồng bộ, nếu bạn bật (xem bên dưới) |
| Bản localhost và bản trên mạng | ⚠️ hai kho riêng, trừ khi trỏ cùng một máy chủ đồng bộ |
| Xoá dữ liệu duyệt web / dùng ẩn danh | ❌ mất sạch |
| Safari trên iPhone, nghỉ hơn 7 ngày | ❌ iOS tự dọn dữ liệu của web thường |

### Đồng bộ giữa điện thoại và máy tính

Bật rồi thì học trên điện thoại, mở laptop là thấy đủ — không phải chép file qua lại.

Cần dựng một máy chủ nhỏ trên Cloudflare, **làm một lần**, miễn phí. Trong thư mục
[`worker/`](worker/):

```bash
npx wrangler login && npx wrangler deploy && npx wrangler secret put SYNC_SECRET
```

Lệnh `deploy` in ra địa chỉ dạng `https://echofluent-sync.<tên-bạn>.workers.dev`, còn
`secret put` sẽ hỏi mật khẩu — gõ một chuỗi bạn tự nghĩ. Điền cả hai vào **Cài đặt →
Đồng bộ giữa các thiết bị**, bấm *Đồng bộ ngay*. Trên máy thứ hai thì bấm *Sao chép link
cài đặt* ở máy thứ nhất rồi mở link đó — app tự điền.

Vài điểm đáng biết:

- **Không phải ghi đè, mà là trộn.** Học trên điện thoại buổi sáng rồi mở laptop buổi
  tối, laptop sẽ không xoá mất buổi sáng: app trộn theo từng trường (số liệu lấy giá trị
  lớn hơn, thẻ ôn giữ bản đã học sâu hơn, ghi chú hợp lại). Có 24 test riêng canh phần
  này, gồm cả kiểm tra trộn nhiều lần không làm dữ liệu trôi đi.
- **Tự chạy** lúc mở app và lúc rời app. Nút bấm tay chỉ để bạn yên tâm.
- **Mật khẩu chỉ nằm trong trình duyệt bạn**, không có trong mã nguồn, không lên GitHub,
  không nằm trong file sao lưu.
- Cloudflare cho 100.000 lượt gọi mỗi ngày ở gói miễn phí. Dùng cá nhân thì không bao giờ
  chạm tới.

**Hai việc nên làm dù có bật đồng bộ hay không:**

1. **Thêm vào màn hình chính** (iPhone: nút Chia sẻ → *Thêm vào MH chính*; Android Chrome:
   menu → *Cài đặt ứng dụng*). App mở toàn màn hình như app thật, **và quan trọng hơn**:
   trên iPhone nó thoát khỏi cơ chế tự dọn dữ liệu sau 7 ngày.
2. **Thỉnh thoảng sao lưu.** Cài đặt → Dữ liệu → *Tải file sao lưu* ra một file JSON.
   Đây cũng là cách chuyển tiến độ từ máy này sang máy khác — máy kia bấm *Khôi phục từ
   file*. App tự nhắc khi bạn đã học được vài ngày mà chưa sao lưu lần nào.

---

## Tài liệu kèm theo

- **[HUONG_DAN.md](HUONG_DAN.md)** — phương pháp học, lộ trình 12 tuần, cách dùng cho hiệu quả.
  **Đọc file này trước khi học buổi đầu tiên.**
- **[IMAGE_PROMPTS.md](IMAGE_PROMPTS.md)** — prompt sinh ảnh minh hoạ cho 12 tình huống
  đầu, kèm đúng tên file và thư mục. Hai tình huống của mảng nói bựa chưa có prompt; app
  tự vẽ gradient thay thế, và chạy tốt kể cả khi không có ảnh nào.
