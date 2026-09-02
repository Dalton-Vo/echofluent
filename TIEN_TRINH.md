# Tiến trình phát triển EchoFluent

Ghi lại những gì đã làm, vì sao làm vậy, và còn gì chưa xong. Đọc file này
trước khi làm tiếp để khỏi phải dò lại từ đầu.

Cập nhật lần cuối: 02/09/2026

---

## 1. Vì sao bấm micro mà không thu được giọng

Đây là lỗi được báo, và hoá ra không phải một lỗi mà là **năm lỗi chồng lên
nhau**. Mỗi lỗi đều tự nó đủ làm micro "im lìm", nên sửa lẻ một cái sẽ không
thấy khác gì.

### 1.1 Tự bật micro không kèm cú bấm của người dùng — nguyên nhân chính

Bản cũ, trong `ReflexDrill.tsx`:

```
say(p.cue, { onEnd: begin });   // đọc xong câu hỏi thì...
// begin() → mic.start()        // ...tự bật micro
```

`mic.start()` nằm trong callback của bộ đọc, tức là **không gắn với cú bấm nào
của người dùng**. Trình duyệt chặn thẳng những lời gọi micro kiểu này — chặn
lặng lẽ: không lỗi, không hộp thoại xin quyền, không gì cả. Nhìn từ ngoài đúng
y như app hỏng.

**Sửa:** micro chỉ tự bật khi quyền đã được cấp từ trước
(`navigator.permissions.query({ name: 'microphone' })` trả về `granted`). Lần
đầu người dùng tự bấm — lúc đó là cú bấm thật, hộp thoại hiện ra bình thường.
Từ câu sau trở đi micro tự bật như ý ban đầu.

### 1.2 Chrome tự tắt nhận diện sau vài giây im lặng

`continuous = true` **không** giữ được phiên nghe. Chrome vẫn tự ngắt sau
khoảng 5–8 giây không nghe thấy tiếng. Mà bài luyện phản xạ thì người học im
vài giây đầu để nghĩ là chuyện đương nhiên — micro tắt ngóm ngay trước lúc họ
mở miệng.

**Sửa:** trong `lib/speech.ts`, khi `onend` bắn mà ta chưa hề bảo dừng thì tạo
phiên mới và nối tiếp, giữ nguyên phần chữ đã nghe được. Có chặn trên 20 lần
để không thành vòng lặp.

### 1.3 Bấm "xong" là mất vế cuối của câu

```
onStop={() => finishAnswer(mic.transcript)}   // đọc state React ngay lập tức
```

Mảnh chữ cuối cùng của trình duyệt chỉ tới **sau** khi gọi `stop()`. Đọc thẳng
state ngay lúc bấm nút thì luôn thiếu vế cuối, và với câu ngắn thì mất sạch —
app báo "chưa nói được" dù người ta vừa nói xong.

**Sửa:** `stop()` giờ trả về `Promise<string>`, chỉ resolve khi phiên nghe thật
sự khép lại. Có lưới an toàn 1.5 giây cho Safari (nó đôi khi nuốt luôn `onend`).

### 1.4 Không có cách nào biết micro có ăn tiếng hay không

Nút cũ nhấp nháy theo một nhịp cố định. Micro hỏng hay chạy tốt nhìn y hệt nhau
— người dùng nói hết cả câu rồi mới biết công cốc.

**Sửa:** mở micro bằng `getUserMedia` và cắm `AnalyserNode` để đo RMS. Nút bấm
giờ có vòng sáng phồng theo độ to của giọng, cộng thêm dải 9 vạch mức âm. Im
lặng quá lâu thì hiện luôn dòng "Chưa nghe thấy gì — nói to hơn một chút".

### 1.5 Trạng thái lỗi gộp hết làm một

Bản cũ chỉ có `denied` cho mọi thứ. Bị chặn quyền, máy không có micro, và trình
duyệt không hỗ trợ là ba chuyện khác hẳn nhau, cách xử lý cũng khác.

**Sửa:** tách thành `idle | starting | listening | denied | nomic | unsupported`,
mỗi trạng thái một hướng dẫn cụ thể.

---

## 2. Chấm phát âm kiểu ELSA

Nhận diện giọng nói của trình duyệt chỉ trả về **chữ**, và tệ hơn: nó *tự sửa
hộ*. Đọc "tree" nó vẫn đoán ra "three" nhờ ngữ cảnh — đúng cái lỗi nặng nhất
thì bị giấu đi.

Nên bản ghi âm được gửi thẳng cho Gemini. Đã kiểm chứng thật: đưa một câu có
lỗi vào, nó bắt đúng `three → tree` (lỗi kinh điển của người Việt), `days →
day` (rụng âm cuối), `I'd → I`.

**Kết quả trả về** (`lib/gemini.ts`):

| Trường | Nghĩa |
|---|---|
| `transcript` | Nghe được nguyên văn, **không** sửa hộ |
| `overall` / `pronunciation` / `fluency` / `intonation` / `completeness` | Điểm 0–100 |
| `words[]` | Mỗi từ: điểm, IPA đúng, IPA **bạn vừa đọc ra**, mẹo sửa bằng tiếng Việt |
| `focus[]` | 2–3 âm đáng sửa trước nhất |

Giao diện (`PronunciationCard.tsx`) tô màu từng từ theo ngưỡng của ELSA: xanh
≥80, vàng ≥55, đỏ dưới đó. Bấm vào từ để xem phiên âm đúng đặt cạnh phiên âm
mình vừa đọc.

Prompt có liệt kê thẳng **bộ lỗi kinh điển của người Việt** (rụng phụ âm cuối,
/θ/→/t/, giản lược cụm phụ âm, lẫn /s/ /z/ /ʃ/, nguyên âm dài-ngắn, nhịp câu
đều đều). Không có phần này thì model khen chung chung cho qua chuyện.

### Khoá API — đọc kỹ chỗ này

Khoá **không** nằm trong mã nguồn và **không** được commit. Hai đường dùng:

1. **Dán vào Cài đặt** → chỉ nằm trong `localStorage` của đúng máy đó. Tiện khi
   học một mình. Dùng máy khác phải dán lại.
2. **Qua Worker** → khoá nằm ở máy chủ, trình duyệt không giữ gì:
   ```
   cd worker
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler deploy
   ```
   rồi điền địa chỉ Worker vào Cài đặt, để trống ô khoá.

Khoá cũng **không** đi vào dữ liệu đồng bộ — `snapshot()` trong `lib/sync.ts`
liệt kê tường minh các trường được gửi đi, `ai` cố tình nằm ngoài danh sách đó.
Có test canh điều này (`gemini.test.ts` → "đi qua Worker thì TUYỆT ĐỐI không
gửi khoá lên").

---

## 3. Hỏi bất chợt (nhắc luyện định kỳ)

Cứ N phút một lần, một câu nhảy ra giữa màn hình và chờ bạn nói.

Ý đồ: ép phản xạ ở đúng trạng thái khó nhất — đang làm việc khác, đầu chưa hề ở
chế độ tiếng Anh. Ngồi vào bàn học tử tế 30 phút thì não đã kịp khởi động, mà
trong cuộc họp thật thì chẳng ai cho mình khoảng khởi động đó.

- Chu kỳ 5 / 15 / 30 / 60 phút.
- Cửa sổ đang thu nhỏ → nổi thông báo hệ thống macOS, bấm vào là mở app lên.
- Trả lời bằng giọng nói, chấm luôn, muốn thì chấm cả phát âm.
- `Esc` để bỏ qua. Góc màn hình có đồng hồ đếm ngược, bấm vào để hỏi luôn.
- Điểm XP cao hơn bài thường (12 thay vì 8) — trả lời được lúc bị hỏi bất chợt
  khó hơn hẳn lúc ngồi học tử tế.

**Giới hạn cần biết trước, không phải lỗi:** đồng hồ chỉ chạy khi app còn mở.
Đóng hẳn cửa sổ thì không có gì nhắc — trình duyệt không cho trang web chạy nền
sau khi đóng. Trên macOS nên cài app ra cửa sổ riêng (Chrome → ⋮ → Cast, Save
and Share → Install) rồi để chạy nền.

Đếm theo mốc thời gian thật (`Date.now()`) chứ không cộng dồn từng nhịp
`setInterval` — macOS bóp cổ hẹn giờ của tab chạy nền xuống một nhịp mỗi phút,
cộng dồn kiểu kia sẽ trôi lệch cả chục phút sau vài tiếng.

---

## 4. Từ điển phiên âm offline

Lấy từ **CMU Pronouncing Dictionary** (135.000 từ, 4.6 MB — quá nặng cho web).

`scripts/build-phonemes.mjs` quét toàn bộ nội dung học, tra đúng những từ app
dùng tới rồi ghi ra `src/data/phonemes.ts`: **1.736 từ, 30 KB**, phủ 99.5% các
câu mẫu. Nhẹ hơn từ điển gốc 150 lần.

Có ARPABET → IPA kèm đặt dấu trọng âm theo nguyên tắc maximal onset, nên
"develop" ra `/dɪˈvɛləp/` chứ không phải `/dɪvˈɛləp/` — đặt sai chỗ thì người
học đọc nhấn sai luôn.

Dùng ở: Thư viện cụm (hiện IPA dưới mỗi cụm, không cần mạng) và làm nguồn dự
phòng khi AI bỏ trống phiên âm.

Thêm nội dung mới thì chạy lại: `npm run build-phonemes`

---

## 5. Đo thời gian phản xạ chính xác hơn

Bản cũ tính mốc "đã bật ra tiếng" từ lúc **chữ đầu tiên hiện ra**. Nhưng nhận
diện giọng nói trả chữ về chậm 300–800 ms so với lúc miệng thật sự phát ra
tiếng — mà đây lại là con số cốt lõi của cả app. Ai cũng bị cộng oan gần một
giây.

Giờ đo bằng **âm lượng** (`mic.level > 0.07`), lấy mốc chữ làm dự phòng.

---

## 6. Trình duyệt nào chạy được gì

| | Nhận chữ | Ghi âm | Chấm phát âm AI |
|---|---|---|---|
| Chrome / Edge | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ✅ |
| Firefox | ❌ | ✅ | ✅ (AI chép chữ thay) |

Firefox không có Web Speech API, nhưng ghi âm vẫn chạy — nên khi bật AI thì
Gemini chép lời thành chữ và bài vẫn được chấm như thường. Đây là lý do phần
ghi âm và phần nhận chữ được tách rời hẳn nhau trong `useMic`.

---

## 7. File đã thêm / sửa

**Thêm mới**
```
src/lib/audio.ts                          xin quyền, đo mức âm, ghi âm, xuất WAV
src/lib/gemini.ts                         gọi Gemini, chuẩn hoá kết quả
src/hooks/useAiCoach.ts                   cầu nối ghi âm → chấm điểm
src/hooks/useNudge.ts                     đồng hồ hỏi bất chợt
src/components/shared/PronunciationCard.tsx   bảng điểm kiểu ELSA
src/components/shared/NudgeQuiz.tsx       bảng hỏi bật lên
src/components/settings/AiSection.tsx     cấu hình khoá AI
src/components/settings/NudgeSection.tsx  cấu hình nhắc luyện
src/data/phonemes.ts                      từ điển IPA (sinh tự động)
scripts/build-phonemes.mjs                script sinh từ điển
src/lib/speech.test.ts                    10 test
src/lib/gemini.test.ts                    18 test
```

**Sửa**
```
src/lib/speech.ts             viết lại phần nhận diện: tự nối lại, dừng có chờ
src/hooks/useSpeech.ts        useMic viết lại hoàn toàn
src/components/shared/MicButton.tsx   vòng sáng theo giọng, tách trạng thái lỗi
src/pages/ReflexDrill.tsx     nối AI, sửa auto-start, đo phản xạ bằng âm lượng
src/pages/Shadowing.tsx       nối AI, sửa mic
src/pages/ScenarioPlayer.tsx  sửa mic
src/pages/Review.tsx          sửa mic
src/pages/ChunkLibrary.tsx    hiện IPA
src/pages/Settings.tsx        thêm hai mục mới
src/store/useStore.ts         thêm state ai + nudge
src/App.tsx                   gắn NudgeQuiz
worker/src/index.ts           thêm POST /ai/:model
```

Test: **178 pass** (thêm 28 test mới).

---

## 8. Ảnh minh hoạ

Đã kiểm tra: **không thiếu ảnh nào.** 24 ảnh trong `public/images/` khớp đủ với
mọi đường dẫn code gọi tới (12 kịch bản + 10 bộ shadowing + hero + icon).
`IMAGE_PROMPTS.md` giữ lại prompt gốc nếu sau này muốn vẽ lại.

Khoá Google này còn gọi được cả model sinh ảnh (`gemini-3-pro-image`,
`nano-banana-pro-preview`), nên muốn thay ảnh mới thì không cần qua ChatGPT nữa
— sinh thẳng bằng chính khoá đang dùng. Chưa làm vì ảnh hiện tại vẫn tốt.

---

## 9. Còn có thể làm tiếp

- **Nhớ lịch sử điểm phát âm theo từng âm.** Hiện mỗi lần chấm là một lần độc
  lập. Gom lại theo `focus[]` sẽ vẽ được biểu đồ "âm /θ/ của bạn ba tuần qua"
  — thứ giữ chân người học tốt nhất ở ELSA.
- **Luyện riêng âm yếu.** Có dữ liệu ở trên rồi thì sinh bài tập nhắm đúng vào
  2–3 âm tệ nhất.
- **Chia nhỏ bundle.** Hiện 652 KB (219 KB sau gzip), vượt ngưỡng cảnh báo của
  Vite. Tách route bằng `React.lazy` là xuống ngay.
- **Chấm phát âm trong Nhập vai.** Đã có ở Phản xạ, Nói đuối và Hỏi bất chợt;
  màn Nhập vai chưa nối.
