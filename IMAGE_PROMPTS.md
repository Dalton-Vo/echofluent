# 🖼️ Danh sách ảnh cần sinh — EchoFluent

App **chạy được ngay mà không cần một tấm ảnh nào**: chỗ nào thiếu ảnh, code tự vẽ một
gradient màu ổn định theo từng tình huống. File này dành cho khi bạn muốn nâng cấp phần
nhìn — chỉ cần sinh ảnh, đặt đúng tên vào đúng thư mục là app tự nhận, không phải sửa code.

---

## Cách dùng file này

1. Copy phần **Prompt** của ảnh bạn muốn, dán vào công cụ sinh ảnh (Midjourney, DALL·E,
   Stable Diffusion, Ideogram, Firefly… hoặc Claude nếu có sinh ảnh).
2. Xuất ảnh, đổi tên đúng như cột **Tên file**.
3. Thả vào thư mục ghi ở cột **Đường dẫn**.
4. Refresh trình duyệt. Xong. Không cần sửa dòng code nào.

> Nếu một ảnh lỗi hoặc không tồn tại, `onError` trong code sẽ ẩn thẻ `<img>` đi và
> gradient nền hiện ra như bình thường. Không bao giờ vỡ giao diện.

---

## Phong cách chung (dán kèm mọi prompt)

Để 12 ảnh trông như một bộ chứ không phải 12 ảnh rời rạc, dán đoạn này vào **cuối mọi
prompt**:

```
Style: cinematic editorial photography, shallow depth of field, soft directional light,
muted desaturated palette with a single teal-mint accent, dark moody background,
no text, no logos, no watermarks, no readable screens, faces turned away or cropped out,
16:9 aspect ratio, high detail, photorealistic.
```

**Thông số kỹ thuật:**

| Mục | Giá trị |
|---|---|
| Tỉ lệ | 16:9 (ngang) |
| Kích thước tối thiểu | 1200 × 675 px |
| Kích thước lý tưởng | 1600 × 900 px |
| Định dạng | `.jpg` (nén chất lượng ~80, giữ file dưới 300 KB) |
| Lưu ý | Ảnh bị phủ lớp tối + gradient nên **đừng chọn ảnh quá tối sẵn** |

---

## 1. Ảnh cho 12 tình huống nhập vai

**Đường dẫn:** `public/images/scenarios/`

Đây là nhóm ảnh duy nhất mà code đang trỏ tới sẵn. Sinh xong là thấy ngay.

| # | Tên file | Tình huống | Prompt |
|---|---|---|---|
| 1 | `standup.jpg` | Họp standup buổi sáng | `A small software team gathered around a standing desk in a bright modern office at morning, laptops open, one person mid-sentence gesturing, morning sunlight through blinds, coffee cups, sticky notes on a glass board` |
| 2 | `code-review.jpg` | Review code căng thẳng | `Two developers side by side at a monitor, one leaning in pointing at the screen, the other with arms crossed thinking, tense but respectful body language, dim office at dusk, screen glow on their faces` |
| 3 | `one-on-one.jpg` | 1:1 với sếp | `Two people in a quiet glass meeting room having a private conversation, one taking notes in a paper notebook, warm afternoon light, plants in the background, calm and serious mood` |
| 4 | `interview.jpg` | Phỏng vấn kỹ thuật từ xa | `Over-the-shoulder view of a person at a desk during a video interview, headphones on, notebook and pen beside the laptop, tidy home office, soft window light, calm focused atmosphere` |
| 5 | `planning.jpg` | Sprint planning | `A team planning session with a large board covered in colored sticky notes, someone reaching up to move a note, others seated and discussing, modern startup office, energetic but organized` |
| 6 | `incident.jpg` | Sự cố production | `A developer alone at night in front of multiple monitors showing red alert dashboards and graphs, hand on forehead, dark room lit only by screens, tension and urgency, blurred abstract charts` |
| 7 | `cafe.jpg` | Quán cà phê | `A busy specialty coffee shop counter from the customer's point of view, barista's hands preparing an iced latte, warm wood and brass, steam, blurred queue behind, cozy and inviting` |
| 8 | `doctor.jpg` | Phòng khám bác sĩ | `A calm clean doctor's consultation room, stethoscope on a desk beside a laptop, empty patient chair, soft daylight through a window, reassuring and clinical but not cold` |
| 9 | `airport.jpg` | Sân bay, chuyến bay hoãn | `An airport departure hall at night, large departure board with blurred flight rows, a traveler with a suitcase seen from behind waiting, cool blue tones with warm terminal lights` |
| 10 | `apartment.jpg` | Đi xem nhà thuê | `An empty modern apartment living room with large windows and afternoon light falling across bare wooden floor, a single set of keys on the windowsill, clean and full of possibility` |
| 11 | `meetup.jpg` | Meetup công nghệ | `An evening tech meetup in a loft space, small groups of people talking with drinks in hand, string lights overhead, a projector screen glowing softly in the background, warm and social` |
| 12 | `phone-call.jpg` | Gọi điện khiếu nại | `A person on a phone call at a kitchen table, paper bill and pen in front of them, slightly frustrated posture, late afternoon light, domestic and relatable` |

---

## 2. Ảnh mở rộng (tuỳ chọn — cần sửa code một dòng)

Những ảnh dưới đây **chưa được code dùng**. Nếu muốn, bạn sinh rồi làm theo hướng dẫn
"cách gắn" ngay bên dưới mỗi mục.

### 2.1 Ảnh nền cho màn hình chào

- **Tên file:** `public/images/hero.jpg`
- **Prompt:**
  ```
  Abstract sound waves made of thin flowing mint-green light ribbons on a near-black
  background, subtle violet secondary glow, minimal and elegant, lots of negative space
  on the left side for text, dark ambient mood
  ```
- **Cách gắn:** mở `src/pages/Onboarding.tsx`, tìm `<div className="grain relative min-h-screen overflow-hidden bg-bg">` và thêm:
  ```tsx
  style={{ backgroundImage: 'url(/images/hero.jpg)', backgroundSize: 'cover' }}
  ```

### 2.2 Ảnh bìa cho 10 bộ shadowing

- **Đường dẫn:** `public/images/packs/`
- **Tên file:** `sh01.jpg` … `sh10.jpg` (khớp `id` trong `src/data/shadowing.ts`)
- **Prompt mẫu (đổi chủ đề theo từng bộ):**
  ```
  Minimal abstract composition representing <chủ đề>, soft gradient background,
  single subtle object, lots of negative space, muted palette with mint accent
  ```
  Chủ đề từng bộ: `sh01` họp buổi sáng · `sh02` giới thiệu bản thân · `sh03` giải thích lỗi ·
  `sh04` bất đồng quan điểm · `sh05` quán cà phê · `sh06` suy nghĩ và câu giờ ·
  `sh07` kể chuyện · `sh08` cuộc gọi điện thoại · `sh09` biểu cảm ngạc nhiên · `sh10` tạm biệt
- **Cách gắn:** trong `src/pages/Shadowing.tsx`, ở phần `PackPicker`, thay thanh màu
  ```tsx
  <div className="h-1.5 w-full" style={{ background: gradientFor(p.id + p.title) }} />
  ```
  bằng
  ```tsx
  <div className="h-24 w-full bg-cover bg-center" style={{ backgroundImage: `url(/images/packs/${p.id}.jpg)` }} />
  ```

### 2.3 Icon ứng dụng / favicon

- **Tên file:** `public/icon.png` (512 × 512, nền trong suốt)
- **Prompt:**
  ```
  A minimal app icon: a speech bubble outline with three sound-wave arcs radiating
  from it, mint green on transparent background, flat vector, rounded geometry,
  no text, centered, generous padding
  ```
- **Cách gắn:** trong `index.html`, thay dòng `<link rel="icon" ...>` bằng
  `<link rel="icon" href="/icon.png" />`

---

## 3. Checklist

Đánh dấu khi sinh xong để khỏi sót:

```
Tình huống nhập vai (bắt buộc nếu muốn có ảnh):
[ ] standup.jpg        [ ] code-review.jpg    [ ] one-on-one.jpg
[ ] interview.jpg      [ ] planning.jpg       [ ] incident.jpg
[ ] cafe.jpg           [ ] doctor.jpg         [ ] airport.jpg
[ ] apartment.jpg      [ ] meetup.jpg         [ ] phone-call.jpg

Tuỳ chọn:
[ ] hero.jpg           [ ] icon.png           [ ] packs/sh01–sh10.jpg
```

---

## 4. Thêm tình huống mới có ảnh riêng

Khi bạn tự viết thêm tình huống trong `src/data/scenarios.ts`, chỉ cần thêm trường
`image`:

```ts
{
  id: 's13',
  title: 'Negotiating a salary',
  titleVi: 'Đàm phán lương',
  emoji: '💰',
  image: '/images/scenarios/salary.jpg',   // ← thêm dòng này
  // …phần còn lại
}
```

Bỏ trường `image` đi thì app tự dùng gradient. Không có gì hỏng cả.
