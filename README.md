# 🗣️ EchoFluent

**Luyện phản xạ giao tiếp tiếng Anh — không phải luyện thi.**

Một web app chạy hoàn toàn trên máy bạn, thiết kế riêng cho một lập trình viên Việt Nam
muốn nói tiếng Anh trôi chảy **cả trong công việc lẫn ngoài đời sống**.

Mục tiêu không phải điểm IELTS. Mục tiêu là: **nghe người ta nói xong là hiểu liền, và
đáp lại được ngay** — không phải dịch trong đầu, không phải im lặng ba giây rồi mới ra
được nửa câu.

---

## Chạy thử trong 30 giây

```bash
npm install
```

```bash
npm run dev
```

Mở <http://localhost:5180>. Xong. Không cần tài khoản, không cần API key, không cần
internet (trừ lần tải font đầu tiên).

Build bản tĩnh để dùng lâu dài:

```bash
npm run build && npm run preview
```

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

- **147 cụm phản xạ** sắp theo *chức năng giao tiếp* (câu giờ, phản đối lịch sự, làm rõ,
  giành lượt nói…) chứ không theo chủ đề từ vựng
- **61 câu hỏi phản xạ** trải đều 4 kiểu bài
- **54 bài luyện nghe** về nuốt âm, nối âm, rút gọn, âm yếu, số má, cụm động từ, thành ngữ
- **12 tình huống nhập vai** — 107 lượt thoại, trong đó **54 lượt bạn phải nói**, kèm
  **108 cách nói thay thế** để không bị đóng khung vào một câu duy nhất
- **10 bộ shadowing** (63 câu) đã đánh dấu sẵn trọng âm và nhóm nghĩa
- **14 huy hiệu** và nhiệm vụ tuần đổi mới mỗi thứ Hai

Muốn thêm nội dung? Mọi file trong `src/data/` đều có chú thích tiếng Việt và cấu trúc rõ
ràng — thêm một object là xong.

---

## Công nghệ

- **React 18 + TypeScript + Vite** — build 1,6 giây
- **Tailwind CSS** với biến CSS → đổi sáng/tối không cần viết lại style
- **Zustand + persist** — toàn bộ tiến độ nằm trong `localStorage`
- **Web Speech API** — phát âm và nhận diện giọng nói *ngay trong trình duyệt*.
  Không server, không API key, không tốn tiền, không gửi giọng bạn đi đâu.
- **Không backend.** Không tài khoản. Không tracking.

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
│   ├── chunks.ts       147 cụm phản xạ
│   ├── reflex.ts       61 câu hỏi phản xạ
│   ├── listening.ts    54 bài nghe
│   ├── scenarios.ts    12 tình huống nhập vai
│   ├── shadowing.ts    10 bộ shadowing (63 câu)
│   └── gamify.ts       nhiệm vụ, huy hiệu, hệ thống cấp độ
├── lib/
│   ├── speech.ts       bọc Web Speech API (đọc + nghe)
│   ├── match.ts        chấm điểm câu nói (cố tình dễ tính)
│   ├── srs.ts          lặp lại ngắt quãng kiểu SM-2 rút gọn
│   └── utils.ts
├── store/useStore.ts   toàn bộ tiến độ + localStorage
├── hooks/useSpeech.ts  hook cho TTS, micro, đồng hồ đếm ngược
├── components/         Shell, các nút mic/loa, vòng đếm ngược
└── pages/              9 màn hình
```

---

## Sao lưu tiến độ

Dữ liệu nằm trong `localStorage` của trình duyệt. Xoá dữ liệu duyệt web là **mất sạch**.

Vào **Cài đặt → Dữ liệu → Tải file sao lưu** để xuất một file JSON. Mỗi tháng làm một lần
là đủ an tâm. Nút **Khôi phục từ file** đưa mọi thứ trở lại.

---

## Tài liệu kèm theo

- **[HUONG_DAN.md](HUONG_DAN.md)** — phương pháp học, lộ trình 12 tuần, cách dùng cho hiệu quả.
  **Đọc file này trước khi học buổi đầu tiên.**
- **[IMAGE_PROMPTS.md](IMAGE_PROMPTS.md)** — prompt sinh ảnh minh hoạ cho 12 tình huống,
  kèm đúng tên file và thư mục. App chạy tốt kể cả khi không có ảnh nào.
