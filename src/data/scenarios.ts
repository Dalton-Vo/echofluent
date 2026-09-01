import type { Scenario } from '@/types';

/* ============================================================================
 *  ROLE-PLAY — 12 tình huống bạn thật sự gặp
 *  Nửa công việc (dev), nửa đời sống. Mỗi lượt "you" đều có nhiệm vụ rõ ràng
 *  và vài cách nói thay thế để bạn không bị đóng khung vào một câu duy nhất.
 * ========================================================================== */

export const SCENARIOS: Scenario[] = [
  /* ============================= 1. STANDUP ============================= */
  {
    id: 's01',
    title: 'Daily standup',
    titleVi: 'Họp standup buổi sáng',
    emoji: '☀️',
    domain: 'work',
    level: 'B1',
    minutes: 5,
    context: "It's 9:05. Your team lead Sarah runs a quick standup on Google Meet.",
    contextVi:
      'Đúng 9h05. Sarah — team lead — chạy standup nhanh trên Google Meet. Bạn phải báo cáo trong 30 giây.',
    image: '/images/scenarios/standup.jpg',
    chunkIds: ['c090', 'c091', 'c092', 'c093', 'c094', 'c096', 'c097'],
    turns: [
      {
        speaker: 'them',
        text: "Morning everyone. Let's keep this short — Thinh, do you want to kick us off?",
        vi: 'Chào mọi người. Mình làm nhanh thôi — Thịnh, bạn mở màn nhé?',
      },
      {
        speaker: 'you',
        text: "Sure. Yesterday I wrapped up the login flow and pushed it for review.",
        vi: 'Được. Hôm qua tôi hoàn thành luồng đăng nhập và đẩy lên review.',
        task: 'Nói bạn làm gì HÔM QUA. Một câu, quá khứ.',
        targets: ['yesterday', 'wrapped up', 'finished', 'pushed'],
        alts: [
          { text: "Yeah, sure. Yesterday I finished the login screen.", note: 'Ngắn gọn, an toàn.' },
          {
            text: "Happy to. So yesterday was mostly the login flow — it's up for review now.",
            note: 'Tự nhiên hơn, có "so" mở đầu như người bản xứ.',
          },
        ],
      },
      {
        speaker: 'them',
        text: 'Nice. And today?',
        vi: 'Tốt. Còn hôm nay?',
      },
      {
        speaker: 'you',
        text: "Today I'm picking up the offline caching ticket. I should have something by tomorrow.",
        vi: 'Hôm nay tôi nhận ticket cache offline. Chắc mai sẽ có gì đó.',
        task: 'Nói kế hoạch HÔM NAY + ước lượng thời gian.',
        targets: ['today', 'picking up', 'working on', 'tomorrow'],
        alts: [
          { text: "Today I'm starting on the offline caching.", note: 'Đơn giản nhất.' },
          {
            text: "Today I'll be heads-down on offline caching — hoping to have a draft PR by end of day.",
            note: '"heads-down" = tập trung cày, dân dev hay dùng.',
          },
        ],
      },
      {
        speaker: 'them',
        text: 'Great. Anything blocking you?',
        vi: 'Tốt. Có gì cản trở không?',
      },
      {
        speaker: 'you',
        text: "One thing — I'm still waiting on the staging API key from DevOps. Not a blocker yet, but it will be by Thursday.",
        vi: 'Có một chuyện — tôi vẫn chờ API key staging từ DevOps. Chưa chặn, nhưng thứ Năm thì sẽ chặn.',
        task: 'Nêu vướng mắc + nói rõ MỨC ĐỘ khẩn cấp. Đừng chỉ nói "no".',
        targets: ['waiting on', 'blocked', 'not a blocker', 'need'],
        alts: [
          { text: "No blockers on my end.", note: 'Nếu thật sự không vướng gì.' },
          {
            text: "Kind of — I need the staging key. Could someone nudge DevOps?",
            note: '"nudge" = thúc nhẹ ai đó. Rất tự nhiên.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "I'll chase that up. By the way, did you see the crash reports from last night?",
        vi: 'Để tôi đi hỏi. À, bạn xem báo cáo crash tối qua chưa?',
      },
      {
        speaker: 'you',
        text: "I glanced at them but haven't dug in yet. I'll take a proper look after standup and take that offline with you.",
        vi: 'Tôi có liếc qua nhưng chưa đào sâu. Sau standup tôi xem kỹ và bàn riêng với bạn.',
        task: 'Thành thật là chưa xem kỹ, nhưng cam kết hành động. Đừng nói dối là đã xem.',
        targets: ['glanced', "haven't", 'take a look', 'offline', 'after'],
        alts: [
          { text: "Not yet — I'll look right after this and message you.", note: 'Thẳng và rõ.' },
          {
            text: "Only briefly. Let me dig in and I'll ping you in an hour.",
            note: '"ping you" = nhắn cho bạn, cực thông dụng trong tech.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Perfect. That's it from me — have a good one, everyone.",
        vi: 'Tuyệt. Tôi hết rồi — chúc mọi người một ngày tốt lành.',
      },
      {
        speaker: 'you',
        text: 'You too, thanks Sarah.',
        vi: 'Bạn cũng vậy, cảm ơn Sarah.',
        task: 'Chào kết thúc ngắn gọn. Không im lặng rồi tắt máy.',
        targets: ['you too', 'thanks', 'cheers'],
        alts: [
          { text: 'Cheers, thanks!', note: 'Giọng Anh/Úc, rất gọn.' },
          { text: 'Thanks — talk later!', note: 'Giọng Mỹ.' },
        ],
      },
    ],
  },

  /* ========================= 2. CODE REVIEW ========================= */
  {
    id: 's02',
    title: 'Defending your code review',
    titleVi: 'Bảo vệ quan điểm khi review code',
    emoji: '🔍',
    domain: 'tech',
    level: 'B2',
    minutes: 6,
    context:
      'A senior dev, Marcus, left blunt comments on your PR. He wants a rewrite. You disagree — but you need to stay professional.',
    contextVi:
      'Marcus — dev senior — để lại comment thẳng thừng trên PR của bạn, muốn bạn viết lại. Bạn không đồng ý, nhưng phải giữ chuyên nghiệp.',
    image: '/images/scenarios/code-review.jpg',
    chunkIds: ['c030', 'c035', 'c036', 'c061', 'c102', 'c105', 'c107'],
    turns: [
      {
        speaker: 'them',
        text: "Hey, I looked at your PR. Honestly, I think this whole service class should be split up. It's doing too much.",
        vi: 'Ê, tôi xem PR của bạn rồi. Thật lòng tôi nghĩ nguyên cái service class này nên tách ra. Nó ôm quá nhiều việc.',
      },
      {
        speaker: 'you',
        text: "I see where you're coming from. Can I ask what specifically feels like too much? I want to make sure I'm splitting it the right way.",
        vi: 'Tôi hiểu ý bạn. Cho tôi hỏi cụ thể chỗ nào bạn thấy quá tải? Tôi muốn tách cho đúng hướng.',
        task: 'Đừng phòng thủ. Công nhận trước, rồi HỎI cho cụ thể.',
        targets: ['see where', 'coming from', 'what specifically', 'can I ask'],
        alts: [
          {
            text: "Fair. Which part in particular — the network calls or the caching?",
            note: 'Ngắn, đi thẳng vào chi tiết kỹ thuật.',
          },
          {
            text: "That's fair feedback. Could you point me at the worst offender?",
            note: '"worst offender" = chỗ tệ nhất. Nói vui, giảm căng thẳng.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "It's handling network calls, caching, and mapping. Three responsibilities in one file.",
        vi: 'Nó vừa gọi mạng, vừa cache, vừa map dữ liệu. Ba trách nhiệm trong một file.',
      },
      {
        speaker: 'you',
        text: "That's a fair point on the mapping — I'll pull that out. But I'd push back a little on splitting the caching. It's only twenty lines and it's tightly coupled to the fetch logic.",
        vi: 'Về phần mapping thì bạn nói đúng — tôi sẽ tách ra. Nhưng tôi xin phản biện chút về tách cache. Nó chỉ 20 dòng và gắn chặt với logic fetch.',
        task: 'ĐỒNG Ý một phần, PHẢN BIỆN một phần. Có lý do cụ thể.',
        targets: ['fair point', 'push back', 'but', 'because', "I'd"],
        alts: [
          {
            text: "Agreed on mapping. On caching though — I'm not so sure. It's twenty lines and it'd need the same state.",
            note: 'Cấu trúc "Agreed on X. On Y though —" rất tự nhiên.',
          },
          {
            text: "You're right about mapping. I'd argue the caching belongs here though — splitting it means passing state around.",
            note: '"I\'d argue that…" mạnh mẽ hơn, hợp khi bạn tự tin.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Hmm. But if we add a second data source later, you'll have to untangle it anyway.",
        vi: 'Hừm. Nhưng nếu sau này thêm nguồn dữ liệu thứ hai, kiểu gì bạn cũng phải gỡ ra.',
      },
      {
        speaker: 'you',
        text: "That's true. My concern is that we're designing for something that might not happen. Could we agree to split it the moment a second source lands? I'll leave a TODO with your name on it.",
        vi: 'Đúng vậy. Điều tôi lo là mình thiết kế cho thứ có thể không xảy ra. Mình thống nhất là khi nào có nguồn thứ hai thì tách nhé? Tôi để lại TODO ghi tên bạn.',
        task: 'Công nhận rủi ro + đề xuất THOẢ HIỆP cụ thể. Đùa nhẹ để hạ nhiệt.',
        targets: ['my concern', 'could we', 'agree', 'when', 'TODO'],
        alts: [
          {
            text: "Fair. How about a compromise — I'll extract mapping now and leave a clear seam for caching?",
            note: '"a clear seam" = chỗ nối rõ ràng để sau dễ tách.',
          },
          {
            text: "You might be right. Can we revisit it when the second source actually shows up?",
            note: '"revisit" = xem lại sau, rất hay trong tranh luận kỹ thuật.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Alright, I can live with that. Just make the TODO specific — not just 'refactor later'.",
        vi: 'Thôi được, tôi chấp nhận. Nhưng ghi TODO cho cụ thể vào — đừng chỉ "refactor sau".',
      },
      {
        speaker: 'you',
        text: "Deal. I'll write down exactly what triggers the split. Thanks for pushing on this — it's a better PR now.",
        vi: 'Chốt. Tôi sẽ ghi rõ điều kiện nào thì tách. Cảm ơn bạn đã phản biện — PR tốt hơn rồi.',
        task: 'Chốt thoả thuận + cảm ơn thật lòng. Đây là điểm mà rất nhiều người bỏ qua.',
        targets: ['deal', 'thanks', 'better', "I'll"],
        alts: [
          { text: "Deal. Appreciate the review.", note: 'Cực ngắn, chuyên nghiệp.' },
          {
            text: "Sounds good. Thanks for taking the time — genuinely useful.",
            note: '"genuinely" làm lời cảm ơn nghe thật hơn.',
          },
        ],
      },
    ],
  },

  /* ====================== 3. 1:1 VỚI SẾP ====================== */
  {
    id: 's03',
    title: 'Asking for more responsibility',
    titleVi: 'Xin thêm trách nhiệm trong buổi 1:1',
    emoji: '📈',
    domain: 'work',
    level: 'B2',
    minutes: 6,
    context:
      "Your monthly 1:1 with your manager, David. You want to lead a feature — but you've never asked for anything like this before.",
    contextVi:
      'Buổi 1:1 hàng tháng với sếp David. Bạn muốn được dẫn dắt một tính năng — nhưng chưa bao giờ chủ động xin điều gì như vậy.',
    image: '/images/scenarios/one-on-one.jpg',
    chunkIds: ['c010', 'c014', 'c060', 'c062', 'c135', 'c184'],
    turns: [
      {
        speaker: 'them',
        text: "So, how are things going? Anything on your mind this month?",
        vi: 'Vậy dạo này thế nào? Tháng này có gì bạn muốn nói không?',
      },
      {
        speaker: 'you',
        text: "Actually yes, there's something I've been wanting to bring up. I'd like to take the lead on a feature next quarter.",
        vi: 'Thật ra là có, một chuyện tôi muốn đề cập từ lâu. Quý tới tôi muốn được dẫn dắt một tính năng.',
        task: 'Vào thẳng vấn đề. Đừng vòng vo, đừng xin lỗi trước.',
        targets: ['actually', "I'd like to", 'bring up', 'lead'],
        alts: [
          {
            text: "Yeah — I've been thinking about what's next for me. I want to own a feature end to end.",
            note: '"own X end to end" = làm chủ trọn vẹn, ngôn ngữ của người muốn thăng tiến.',
          },
          {
            text: "There is, actually. I'd like to step up and lead something next quarter.",
            note: '"step up" = nhận trách nhiệm lớn hơn.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Interesting. What makes you feel ready for that?",
        vi: 'Thú vị. Điều gì khiến bạn thấy mình sẵn sàng?',
      },
      {
        speaker: 'you',
        text: "A couple of things. I shipped the payments module on my own, and I've been the go-to person for the mobile build for about six months now.",
        vi: 'Vài lý do. Tôi tự ship module thanh toán, và khoảng sáu tháng nay tôi là người mọi người tìm đến cho bản build mobile.',
        task: 'Đưa BẰNG CHỨNG cụ thể, không nói chung chung "tôi cố gắng nhiều".',
        targets: ['I shipped', "I've been", 'go-to', 'months'],
        alts: [
          {
            text: "Mainly two things — the payments module was mine end to end, and I handle most of the build issues now.",
            note: 'Đánh số ý ("two things") giúp người nghe theo dõi.',
          },
          {
            text: "I've done it informally already. Nobody called it 'leading', but I did the planning and the reviews.",
            note: 'Chỉ ra bạn đã LÀM việc đó rồi, chỉ thiếu cái tên gọi.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "That's fair. Honestly, my hesitation is the communication side. Leading means a lot of syncing with the design team and the client.",
        vi: 'Cũng hợp lý. Thật lòng, điều tôi ngại là mảng giao tiếp. Dẫn dắt nghĩa là phải trao đổi rất nhiều với design và khách hàng.',
      },
      {
        speaker: 'you',
        text: "That's a fair concern, and honestly it's the part I want to grow in. Would it make sense to start me on something smaller — maybe co-leading with someone for one sprint?",
        vi: 'Đó là lo ngại chính đáng, và thật ra đó chính là mảng tôi muốn phát triển. Có hợp lý không nếu bắt đầu bằng việc nhỏ hơn — ví dụ đồng dẫn dắt với ai đó trong một sprint?',
        task: 'Không chối điểm yếu. Nhận nó và đề xuất bước đi nhỏ hơn.',
        targets: ['fair concern', 'grow', 'would it make sense', 'smaller', 'start'],
        alts: [
          {
            text: "You're right, and that's exactly why I want it. Could we try it on a small feature first?",
            note: 'Xoay điểm yếu thành lý do.',
          },
          {
            text: "I won't pretend that's my strength yet. What if I shadow you on the next client sync?",
            note: '"shadow someone" = đi theo học việc. Đề xuất rất cụ thể.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "You know what, that's a reasonable ask. Let me think about which feature makes sense.",
        vi: 'Bạn biết không, đề nghị đó hợp lý đấy. Để tôi nghĩ xem tính năng nào phù hợp.',
      },
      {
        speaker: 'you',
        text: "Thanks, I really appreciate you considering it. Could we put a check-in on the calendar for two weeks from now?",
        vi: 'Cảm ơn, tôi rất trân trọng việc anh cân nhắc. Mình đặt lịch trao đổi lại sau hai tuần được không?',
        task: 'Cảm ơn NGẮN rồi chốt bước tiếp theo. Đừng để câu chuyện trôi.',
        targets: ['appreciate', 'could we', 'check-in', 'two weeks', 'follow up'],
        alts: [
          {
            text: "Appreciate it. Shall we follow up in a couple of weeks?",
            note: 'Cực gọn và chuyên nghiệp.',
          },
          {
            text: "Thanks David. I'll send a short note with what I'd want to own, so you have it in writing.",
            note: 'Chủ động gửi văn bản — điểm cộng lớn.',
          },
        ],
      },
    ],
  },

  /* ====================== 4. PHỎNG VẤN KỸ THUẬT ====================== */
  {
    id: 's04',
    title: 'Technical interview',
    titleVi: 'Phỏng vấn kỹ thuật — kể về dự án',
    emoji: '🎯',
    domain: 'tech',
    level: 'B2',
    minutes: 7,
    context:
      'A remote interview. The interviewer is friendly but keeps digging. Your job: explain a real project clearly, and admit limits honestly.',
    contextVi:
      'Phỏng vấn từ xa. Người phỏng vấn thân thiện nhưng đào rất sâu. Nhiệm vụ: kể một dự án thật rõ ràng và thành thật về giới hạn.',
    image: '/images/scenarios/interview.jpg',
    chunkIds: ['c001', 'c005', 'c013', 'c065', 'c123', 'c126'],
    turns: [
      {
        speaker: 'them',
        text: "Thanks for joining. Let's start easy — tell me about a project you're proud of.",
        vi: 'Cảm ơn bạn đã tham gia. Bắt đầu nhẹ nhàng — kể về một dự án bạn tự hào.',
      },
      {
        speaker: 'you',
        text: "Sure. The one I'm most proud of is a Flutter app for warehouse staff. They scan items offline, and it syncs when they get signal again.",
        vi: 'Được. Dự án tôi tự hào nhất là một app Flutter cho nhân viên kho. Họ quét hàng khi offline, và app tự đồng bộ khi có mạng lại.',
        task: 'Một câu là gì + một câu vì sao đặc biệt. Đừng kể lể quá 20 giây ở lượt đầu.',
        targets: ['most proud', 'app', 'offline', 'sync'],
        alts: [
          {
            text: "Probably an offline-first warehouse app I built in Flutter — scanning works with no signal at all.",
            note: '"offline-first" là thuật ngữ đúng, gây ấn tượng ngay.',
          },
          {
            text: "A mobile app for a logistics client. The interesting part was making it work with zero connectivity.",
            note: 'Nêu ngay "the interesting part" để dẫn câu hỏi tiếp theo.',
          },
        ],
      },
      {
        speaker: 'them',
        text: 'Offline sync is tricky. How did you handle conflicts?',
        vi: 'Đồng bộ offline khó đấy. Bạn xử lý xung đột dữ liệu thế nào?',
      },
      {
        speaker: 'you',
        text: "We kept it simple — last write wins, but every change has a timestamp and a device ID, so we can always trace who overwrote what.",
        vi: 'Tụi tôi làm đơn giản — ai ghi sau thắng, nhưng mỗi thay đổi đều có timestamp và device ID nên luôn truy được ai ghi đè cái gì.',
        task: 'Trả lời kỹ thuật NGẮN + nói rõ ĐÁNH ĐỔI. Nhà tuyển dụng thích nghe trade-off.',
        targets: ['we kept it simple', 'last write wins', 'timestamp', 'trace'],
        alts: [
          {
            text: "Last write wins, honestly. It's not elegant, but for this domain a conflict was rare and cheap to fix.",
            note: 'Thừa nhận giải pháp "không đẹp" nhưng đúng bối cảnh — rất chín chắn.',
          },
          {
            text: "We went with a simple timestamp strategy. We considered CRDTs but that was overkill for the data volume.",
            note: '"overkill" = làm quá mức cần thiết. Cho thấy bạn có cân nhắc.',
          },
        ],
      },
      {
        speaker: 'them',
        text: 'And what would you do differently if you started again today?',
        vi: 'Nếu làm lại từ đầu hôm nay, bạn sẽ làm khác gì?',
      },
      {
        speaker: 'you',
        text: "I'd write the sync tests first. We built the feature and added tests afterwards, and honestly that cost us about a week of debugging.",
        vi: 'Tôi sẽ viết test cho phần đồng bộ trước. Tụi tôi làm tính năng xong mới thêm test, và thật lòng nó khiến tụi tôi mất cả tuần debug.',
        task: 'Thành thật về một sai lầm + rút ra bài học. Đừng nói "không có gì để cải thiện".',
        targets: ["I'd", 'differently', 'tests', 'cost us', 'lesson'],
        alts: [
          {
            text: "Tests first, definitely. We wrote them last and paid for it during the beta.",
            note: 'Ngắn và mạnh.',
          },
          {
            text: "I'd invest in observability earlier — we were flying blind for the first month.",
            note: '"flying blind" = làm mà không thấy gì, hình ảnh rất hay.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Last one — how do you handle a task where you genuinely don't know the answer?",
        vi: 'Câu cuối — bạn xử lý thế nào khi thật sự không biết câu trả lời?',
      },
      {
        speaker: 'you',
        text: "I timebox it. I'll give myself an hour to narrow it down on my own, and if I'm still stuck I ask — with what I've already ruled out, so I'm not wasting anyone's time.",
        vi: 'Tôi giới hạn thời gian. Tôi cho mình một tiếng tự khoanh vùng, nếu vẫn bí thì hỏi — kèm những gì tôi đã loại trừ, để không làm mất thời gian người khác.',
        task: 'Mô tả một QUY TRÌNH, không phải một tính cách. "Tôi chăm chỉ" là câu trả lời tệ.',
        targets: ['timebox', 'narrow it down', 'ask', 'ruled out'],
        alts: [
          {
            text: "I give it a strict hour, then I ask for help with a clear summary of what I tried.",
            note: 'Cùng ý, câu ngắn hơn.',
          },
          {
            text: "Honestly? I ask early. I used to burn days on pride, and I learned that's expensive.",
            note: 'Rất người thật việc thật — dễ gây thiện cảm.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Good answer. Do you have any questions for me?",
        vi: 'Câu trả lời tốt. Bạn có câu hỏi gì cho tôi không?',
      },
      {
        speaker: 'you',
        text: "Yes — what does a good first three months look like in this role? I'd like to know what you'd consider a win.",
        vi: 'Có — ba tháng đầu tốt đẹp ở vị trí này trông như thế nào? Tôi muốn biết anh coi điều gì là thành công.',
        task: 'LUÔN hỏi lại. Câu hỏi tốt nhất: hỏi về kỳ vọng cụ thể.',
        targets: ['what does', 'look like', 'first three months', 'success'],
        alts: [
          {
            text: "What's the biggest technical headache the team has right now?",
            note: 'Cho thấy bạn muốn giải quyết vấn đề thật.',
          },
          {
            text: "How does the team handle disagreement on technical decisions?",
            note: 'Câu hỏi về văn hoá, rất đáng hỏi.',
          },
        ],
      },
    ],
  },

  /* ====================== 5. SPRINT PLANNING ====================== */
  {
    id: 's05',
    title: 'Pushing back on a deadline',
    titleVi: 'Từ chối deadline phi thực tế',
    emoji: '⏳',
    domain: 'work',
    level: 'B2',
    minutes: 6,
    context:
      "Sprint planning. The PM, Elena, wants three features in two weeks. You know it's not possible — but 'no' alone will make you look difficult.",
    contextVi:
      'Họp sprint planning. PM Elena muốn ba tính năng trong hai tuần. Bạn biết là không nổi — nhưng nói "không" suông sẽ khiến bạn bị coi là khó chịu.',
    image: '/images/scenarios/planning.jpg',
    chunkIds: ['c031', 'c112', 'c113', 'c114', 'c115', 'c116'],
    turns: [
      {
        speaker: 'them',
        text: "So for this sprint I'd like all three: the new onboarding, push notifications, and the analytics dashboard.",
        vi: 'Sprint này tôi muốn cả ba: onboarding mới, push notification, và dashboard analytics.',
      },
      {
        speaker: 'you',
        text: "I'm not so sure we can fit all three. Realistically, onboarding alone is about a week and a half.",
        vi: 'Tôi không chắc mình nhét được cả ba. Thực tế, riêng onboarding đã tốn khoảng một tuần rưỡi.',
        task: 'Phản đối bằng CON SỐ, không bằng cảm giác. "It\'s too much" là câu yếu.',
        targets: ['not so sure', 'realistically', 'week', 'alone'],
        alts: [
          {
            text: "That's going to be tight. Onboarding is a week and a half on its own.",
            note: '"tight" nhẹ nhàng hơn "impossible" mà vẫn rõ nghĩa.',
          },
          {
            text: "Honestly, I don't think all three fit. Can I walk you through the numbers?",
            note: 'Xin phép giải thích — người nghe sẽ cởi mở hơn.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Hmm. The client is expecting all three though. Can we cut some corners?",
        vi: 'Hừm. Nhưng khách mong đợi cả ba. Mình làm tắt bớt được không?',
      },
      {
        speaker: 'you',
        text: "We could, but I'd want to be clear about the cost. Skipping tests on push notifications means we'll probably be firefighting during the demo week.",
        vi: 'Có thể, nhưng tôi muốn nói rõ cái giá phải trả. Bỏ test cho push notification nghĩa là tuần demo mình sẽ đi chữa cháy.',
        task: 'Không nói "không". Nói "được, nhưng đây là hậu quả". Chuyển quyết định về phía họ.',
        targets: ['we could', 'but', 'cost', 'means', 'risk'],
        alts: [
          {
            text: "We can, but then we're trading quality for speed. I'd rather you make that call knowingly.",
            note: '"make that call" = ra quyết định. Đẩy trách nhiệm về đúng người.',
          },
          {
            text: "Sure — but the risk lands in demo week. Is that a trade you're happy with?",
            note: 'Kết bằng câu hỏi buộc họ phải trả lời.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Okay… so what do you suggest?",
        vi: 'Được rồi… vậy bạn đề xuất gì?',
      },
      {
        speaker: 'you',
        text: "What's the priority for the client — is it onboarding or the dashboard? If we ship two properly, we can descope the third to next sprint and still demo something solid.",
        vi: 'Ưu tiên của khách là gì — onboarding hay dashboard? Nếu làm chỉn chu hai cái, mình đẩy cái thứ ba sang sprint sau mà vẫn demo được thứ chắc chắn.',
        task: 'Hỏi ưu tiên + đưa ra phương án thay thế CỤ THỂ. Đây là điểm ăn tiền.',
        targets: ["what's the priority", 'if we', 'descope', 'next sprint'],
        alts: [
          {
            text: "Let's pick two. Which two matter most for the demo?",
            note: 'Cực ngắn và hiệu quả.',
          },
          {
            text: "How about we commit to two and treat the third as a stretch goal?",
            note: '"stretch goal" = mục tiêu cố gắng, không cam kết. Từ khoá vàng trong planning.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Alright, onboarding and push. We'll move the dashboard. But I need it in the next sprint, no slipping.",
        vi: 'Thôi được, onboarding và push. Dashboard dời lại. Nhưng sprint sau phải có, không được trễ nữa.',
      },
      {
        speaker: 'you',
        text: "Understood. Just so we're all on the same page — two features this sprint, dashboard first thing next sprint. I'll update the board after this.",
        vi: 'Rõ. Cho thống nhất luôn — hai tính năng sprint này, dashboard ưu tiên đầu sprint sau. Tôi sẽ cập nhật bảng sau buổi này.',
        task: 'TÓM TẮT LẠI thoả thuận bằng lời của bạn. Tránh hiểu nhầm sau này.',
        targets: ['same page', 'two features', 'next sprint', "I'll update"],
        alts: [
          {
            text: "Got it. Two this sprint, dashboard is top of the next one. I'll write it up.",
            note: '"I\'ll write it up" = tôi sẽ ghi lại thành văn bản.',
          },
          {
            text: "Deal. Let me repeat it back so there's no confusion later…",
            note: '"repeat it back" — kỹ thuật xác nhận rất chuyên nghiệp.',
          },
        ],
      },
    ],
  },

  /* ====================== 6. SỰ CỐ PRODUCTION ====================== */
  {
    id: 's06',
    title: 'Explaining an outage',
    titleVi: 'Giải thích sự cố cho người không rành kỹ thuật',
    emoji: '🚨',
    domain: 'tech',
    level: 'B2',
    minutes: 6,
    context:
      'The app was down for 40 minutes. Your PM has no technical background and the client is asking questions. Explain — without jargon.',
    contextVi:
      'App sập 40 phút. PM không rành kỹ thuật và khách đang hỏi. Hãy giải thích — không dùng thuật ngữ.',
    image: '/images/scenarios/incident.jpg',
    chunkIds: ['c008', 'c122', 'c124', 'c126', 'c127'],
    turns: [
      {
        speaker: 'them',
        text: "The client is asking what happened this morning. Can you explain it in plain English? I have to send an email in ten minutes.",
        vi: 'Khách đang hỏi sáng nay có chuyện gì. Bạn giải thích bằng ngôn ngữ đơn giản được không? Mười phút nữa tôi phải gửi mail.',
      },
      {
        speaker: 'you',
        text: "Sure. Long story short — a routine update to the database took much longer than expected, and while it ran, the app couldn't read any data.",
        vi: 'Được. Nói ngắn gọn — một bản cập nhật thường lệ cho cơ sở dữ liệu chạy lâu hơn dự kiến, và trong lúc đó app không đọc được dữ liệu.',
        task: 'Một câu tóm tắt, KHÔNG thuật ngữ. Cấm dùng "migration", "lock", "timeout".',
        targets: ['long story short', 'update', 'took longer', "couldn't"],
        alts: [
          {
            text: "In short: a scheduled maintenance job ran long, and the app couldn't reach its data while it did.",
            note: '"ran long" = chạy quá giờ dự kiến.',
          },
          {
            text: "Basically the database was busy with an update, so the app had nothing to read from.",
            note: '"Basically" mở đầu rất tự nhiên cho lời giải thích đơn giản hoá.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Okay. Was any customer data lost?",
        vi: 'Rồi. Có mất dữ liệu khách hàng không?',
      },
      {
        speaker: 'you',
        text: "No, nothing was lost. Everything people did before the outage is safe. The only impact was that they couldn't use the app for about forty minutes.",
        vi: 'Không, không mất gì. Mọi thứ người dùng làm trước sự cố đều an toàn. Ảnh hưởng duy nhất là họ không dùng được app khoảng 40 phút.',
        task: 'Trả lời câu hỏi ĐÚNG TRỌNG TÂM trước, chi tiết sau. Bắt đầu bằng "No" hoặc "Yes".',
        targets: ['no', 'nothing was lost', 'safe', 'forty minutes'],
        alts: [
          {
            text: "No data loss at all. People just couldn't log in for forty minutes.",
            note: 'Ngắn nhất có thể — đúng thứ PM cần để copy vào email.',
          },
          {
            text: "None. It was a read outage, not a data problem — everything saved is intact.",
            note: '"intact" = nguyên vẹn. Từ hay dùng trong báo cáo sự cố.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "The client will definitely ask: how do we stop this happening again?",
        vi: 'Khách chắc chắn sẽ hỏi: làm sao để chuyện này không lặp lại?',
      },
      {
        speaker: 'you',
        text: "Three things. We're running these updates in smaller pieces, we've added an alert so we know within a minute, and from now on we do them outside business hours.",
        vi: 'Ba việc. Tụi tôi chia nhỏ các bản cập nhật, thêm cảnh báo để biết trong vòng một phút, và từ giờ chỉ chạy ngoài giờ làm việc.',
        task: 'Đưa đúng 3 hành động cụ thể. Đếm ra "Three things" giúp người nghe nhớ.',
        targets: ['three things', 'smaller', 'alert', 'outside business hours'],
        alts: [
          {
            text: "We've already changed three things: smaller batches, faster alerts, and off-hours only.",
            note: 'Dùng thì hiện tại hoàn thành cho thấy đã LÀM chứ không phải sẽ làm.',
          },
          {
            text: "Short answer: smaller updates, better monitoring, and never during the day again.",
            note: '"Short answer:" rất hữu ích khi người nghe đang gấp.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "That's helpful. Anything I should NOT put in the email?",
        vi: 'Hữu ích đấy. Có gì tôi KHÔNG nên đưa vào email không?',
      },
      {
        speaker: 'you',
        text: "I'd leave out the technical detail about the database — it raises more questions than it answers. Just say scheduled maintenance ran longer than planned.",
        vi: 'Tôi sẽ bỏ phần chi tiết kỹ thuật về cơ sở dữ liệu — nó gây thêm câu hỏi chứ không giải quyết. Chỉ nói bảo trì định kỳ chạy lâu hơn dự kiến.',
        task: 'Tư vấn chủ động. Đây là lúc bạn thể hiện tầm nhìn ngoài code.',
        targets: ["I'd leave out", 'just say', 'raises more questions'],
        alts: [
          {
            text: "Skip the internal details. Keep it to impact, duration, and the fix.",
            note: 'Công thức viết báo cáo sự cố: impact / duration / fix.',
          },
          {
            text: "I wouldn't mention the specific system. Focus on what it meant for users.",
            note: 'Luôn quy về góc nhìn người dùng.',
          },
        ],
      },
    ],
  },

  /* ====================== 7. QUÁN CÀ PHÊ ====================== */
  {
    id: 's07',
    title: 'Coffee shop + small talk',
    titleVi: 'Gọi cà phê và bắt chuyện',
    emoji: '☕',
    domain: 'daily',
    level: 'A2',
    minutes: 4,
    context:
      "A busy café. The barista is friendly and chatty. Order, handle a small problem, and survive the small talk.",
    contextVi:
      'Quán cà phê đông. Nhân viên thân thiện và hay bắt chuyện. Gọi món, xử lý sự cố nhỏ, và sống sót qua màn small talk.',
    image: '/images/scenarios/cafe.jpg',
    chunkIds: ['c140', 'c141', 'c143', 'c145', 'c070', 'c148'],
    turns: [
      {
        speaker: 'them',
        text: "Hi there! What can I get you?",
        vi: 'Chào bạn! Bạn dùng gì ạ?',
      },
      {
        speaker: 'you',
        text: "Hi — I'll have a large iced latte, please. With oat milk if you have it.",
        vi: 'Chào — cho tôi một ly latte đá lớn. Sữa yến mạch nếu có.',
        task: 'Gọi món bằng mẫu "I\'ll have…, please" + một yêu cầu thêm.',
        targets: ["I'll have", 'please', 'large', 'latte'],
        alts: [
          { text: "Can I get a large iced latte, please?", note: 'Giọng Mỹ, cực thông dụng.' },
          { text: "Could I have a large iced latte with oat milk?", note: 'Lịch sự hơn một chút.' },
        ],
      },
      {
        speaker: 'them',
        text: "We do have oat. For here or to go?",
        vi: 'Có sữa yến mạch ạ. Dùng tại chỗ hay mang đi?',
      },
      {
        speaker: 'you',
        text: "To go, please. Oh — do you take card?",
        vi: 'Mang đi ạ. À — ở đây nhận thẻ chứ?',
        task: 'Trả lời gọn + hỏi thêm một câu. "To go" / "For here" — thuộc luôn.',
        targets: ['to go', 'take card', 'please'],
        alts: [
          { text: "To go. And do you take card?", note: 'Ngắn nhất.' },
          { text: "To go, thanks. Is card okay?", note: 'Rất tự nhiên khi nói nhanh.' },
        ],
      },
      {
        speaker: 'them',
        text: "Card's fine. So, are you working around here? I see a lot of laptops today.",
        vi: 'Thẻ ok ạ. Bạn làm việc quanh đây à? Hôm nay tôi thấy nhiều laptop quá.',
      },
      {
        speaker: 'you',
        text: "Yeah, kind of — I work from home mostly, but I come here when I need to actually get things done.",
        vi: 'Ừ, đại loại vậy — tôi chủ yếu làm ở nhà, nhưng ra đây khi cần thật sự làm được việc.',
        task: 'Trả lời + THÊM một chi tiết. Trả lời cụt "yes" là hội thoại chết.',
        targets: ['yeah', 'work from home', 'come here', 'because'],
        alts: [
          {
            text: "Sort of. I'm a developer, so I can work anywhere — home just has too many distractions.",
            note: 'Tiết lộ nghề nghiệp để mở chủ đề tiếp.',
          },
          {
            text: "Not around here exactly, I work remotely. This place has better coffee than my kitchen.",
            note: 'Đùa nhẹ — cách bắt chuyện rất hiệu quả.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Ha, fair enough. Here you go — one large iced latte. Oh wait, sorry, I made it with regular milk.",
        vi: 'Haha, cũng đúng. Của bạn đây — latte đá lớn. Ồ khoan, xin lỗi, tôi làm nhầm sữa thường.',
      },
      {
        speaker: 'you',
        text: "No worries at all. Would you mind remaking it? I can't drink dairy, unfortunately.",
        vi: 'Không sao đâu. Bạn làm lại giúp tôi được không? Tiếc là tôi không uống được sữa bò.',
        task: 'Phàn nàn NHẸ NHÀNG. Trấn an trước, yêu cầu sau, giải thích lý do.',
        targets: ['no worries', 'would you mind', 'remaking', "can't"],
        alts: [
          {
            text: "That's okay! Could I get it with oat instead? I'm lactose intolerant.",
            note: '"lactose intolerant" = không dung nạp lactose, dùng chính xác ở quán.',
          },
          {
            text: "No problem — any chance you could swap it for oat?",
            note: '"any chance you could…" cực kỳ lịch sự và tự nhiên.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Of course, so sorry about that! Give me two minutes.",
        vi: 'Tất nhiên rồi, xin lỗi bạn nhé! Cho tôi hai phút.',
      },
      {
        speaker: 'you',
        text: "No rush, honestly. Thanks a lot.",
        vi: 'Không gấp đâu thật đó. Cảm ơn nhiều.',
        task: 'Kết thúc bằng sự tử tế. Một câu là đủ.',
        targets: ['no rush', 'thanks', 'appreciate'],
        alts: [
          { text: "Take your time, thank you!", note: 'Ấm áp và rất tự nhiên.' },
          { text: "All good, cheers.", note: 'Giọng Anh/Úc, siêu ngắn.' },
        ],
      },
    ],
  },

  /* ====================== 8. BÁC SĨ ====================== */
  {
    id: 's08',
    title: 'At the doctor',
    titleVi: 'Đi khám bệnh',
    emoji: '🩺',
    domain: 'daily',
    level: 'B1',
    minutes: 5,
    context:
      "You've had a bad cough for a week. Describe symptoms clearly, ask about medication, and understand the instructions.",
    contextVi:
      'Bạn ho nặng cả tuần. Mô tả triệu chứng rõ ràng, hỏi về thuốc, và hiểu đúng chỉ dẫn.',
    image: '/images/scenarios/doctor.jpg',
    chunkIds: ['c160', 'c161', 'c162', 'c163', 'c042', 'c044'],
    turns: [
      {
        speaker: 'them',
        text: "Come on in, have a seat. So, what brings you in today?",
        vi: 'Mời vào, ngồi đi. Vậy hôm nay bạn tới khám vì chuyện gì?',
      },
      {
        speaker: 'you',
        text: "I've had a cough for about a week now, and it's got worse over the last two days.",
        vi: 'Tôi ho khoảng một tuần nay, và hai ngày qua nặng hơn.',
        task: 'Nêu triệu chứng + THỜI GIAN + xu hướng. Bác sĩ cần đúng ba thông tin này.',
        targets: ["I've had", 'for about', 'week', 'worse'],
        alts: [
          {
            text: "A cough that won't go away. It started last Monday and it's getting worse.",
            note: '"won\'t go away" = mãi không hết. Rất tự nhiên.',
          },
          {
            text: "I've been coughing for a week. It's worse at night.",
            note: 'Thêm chi tiết "worse at night" giúp chẩn đoán.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Any fever? Shortness of breath?",
        vi: 'Có sốt không? Có khó thở không?',
      },
      {
        speaker: 'you',
        text: "No fever. But I do get a bit out of breath when I climb the stairs, which is new for me.",
        vi: 'Không sốt. Nhưng leo cầu thang thì hơi hụt hơi, cái này mới bị.',
        task: 'Trả lời từng ý một + nói rõ điều gì BẤT THƯỜNG so với bình thường.',
        targets: ['no fever', 'out of breath', 'stairs', 'new'],
        alts: [
          {
            text: "No fever, but I get winded going up stairs. That's not normal for me.",
            note: '"get winded" = hụt hơi, thân mật hơn.',
          },
          {
            text: "No temperature. A little breathless on the stairs, though.",
            note: '"breathless" ngắn gọn, dùng đúng ngữ cảnh y tế.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Right. I'll listen to your chest. Take a deep breath for me… and again. Okay, it sounds like a chest infection.",
        vi: 'Được. Tôi nghe phổi nhé. Hít sâu… lần nữa. Rồi, nghe có vẻ là nhiễm trùng đường hô hấp.',
      },
      {
        speaker: 'you',
        text: "Sorry, what do you mean by a chest infection? Is that the same as bronchitis?",
        vi: 'Xin lỗi, "chest infection" là sao ạ? Có phải giống viêm phế quản không?',
        task: 'KHÔNG gật bừa. Hỏi lại khi chưa hiểu — sức khoẻ của bạn mà.',
        targets: ['what do you mean', 'is that', 'same as', 'sorry'],
        alts: [
          {
            text: "Sorry, could you explain what that means exactly?",
            note: 'Câu vạn năng khi chưa hiểu thuật ngữ.',
          },
          {
            text: "I'm not familiar with that term — is it serious?",
            note: 'Hỏi thẳng mức độ nghiêm trọng.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "It's similar, yes. I'll prescribe an antibiotic — one tablet twice a day for seven days, and finish the whole course even if you feel better.",
        vi: 'Tương tự, đúng vậy. Tôi kê kháng sinh — một viên hai lần một ngày trong bảy ngày, và phải uống hết liệu trình dù thấy đỡ.',
      },
      {
        speaker: 'you',
        text: "Just to make sure I've got this right — one tablet in the morning and one at night, for a full week, even if the cough stops?",
        vi: 'Cho chắc là tôi hiểu đúng — một viên sáng một viên tối, đủ một tuần, dù có hết ho?',
        task: 'NHẮC LẠI chỉ dẫn bằng lời của bạn. Đây là kỹ năng quan trọng nhất bài này.',
        targets: ['just to make sure', 'got this right', 'one tablet', 'even if'],
        alts: [
          {
            text: "So that's twice a day for seven days, and I don't stop early. Correct?",
            note: 'Kết thúc bằng "Correct?" để buộc xác nhận.',
          },
          {
            text: "Let me repeat that back — two a day, seven days, finish the course.",
            note: '"repeat that back" — dùng được cả trong công việc.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Exactly right. Come back if you're not improving in five days.",
        vi: 'Chính xác. Nếu năm ngày không đỡ thì quay lại.',
      },
      {
        speaker: 'you',
        text: "Will do. One last thing — can I take this with my usual painkillers?",
        vi: 'Vâng ạ. Một điều cuối — tôi uống chung với thuốc giảm đau thường dùng được không?',
        task: 'Hỏi nốt câu quan trọng trước khi ra về. "One last thing" mở đường rất mượt.',
        targets: ['one last thing', 'can I take', 'with'],
        alts: [
          {
            text: "Thanks. Is there anything I should avoid while taking it?",
            note: 'Câu hỏi an toàn và luôn hữu ích.',
          },
          {
            text: "Got it. Any side effects I should watch out for?",
            note: '"watch out for" = để ý, cảnh giác.',
          },
        ],
      },
    ],
  },

  /* ====================== 9. SÂN BAY ====================== */
  {
    id: 's09',
    title: 'Flight delayed at the airport',
    titleVi: 'Chuyến bay bị hoãn ở sân bay',
    emoji: '✈️',
    domain: 'daily',
    level: 'B1',
    minutes: 5,
    context:
      "Your connecting flight is delayed and you'll miss the next one. Talk to the desk agent — stay calm and get what you need.",
    contextVi:
      'Chuyến nối chuyến bị hoãn và bạn sẽ lỡ chuyến kế. Nói chuyện với nhân viên quầy — bình tĩnh và đạt được điều bạn cần.',
    image: '/images/scenarios/airport.jpg',
    chunkIds: ['c152', 'c154', 'c150', 'c045', 'c184'],
    turns: [
      {
        speaker: 'them',
        text: "Next, please. How can I help you?",
        vi: 'Người tiếp theo. Tôi giúp gì được ạ?',
      },
      {
        speaker: 'you',
        text: "Hi. My flight to Singapore has been delayed by three hours, and I've got a connection to Ho Chi Minh City. I don't think I'll make it.",
        vi: 'Chào. Chuyến của tôi đi Singapore hoãn ba tiếng, mà tôi có chuyến nối đi TP.HCM. Tôi nghĩ tôi không kịp.',
        task: 'Nêu VẤN ĐỀ + HẬU QUẢ trong một hơi. Đừng bắt người ta đoán.',
        targets: ['delayed', 'connection', "won't make it", 'flight'],
        alts: [
          {
            text: "My flight's delayed and I'm going to miss my connection to Ho Chi Minh.",
            note: 'Ngắn gọn nhất, đủ ý.',
          },
          {
            text: "I've got a problem — three-hour delay, and my connecting flight leaves in two.",
            note: 'Nêu con số cho thấy tình huống rõ ràng.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Let me check… yes, you'll miss it. I can put you on tomorrow morning's flight at 7 a.m.",
        vi: 'Để tôi kiểm tra… đúng, bạn sẽ lỡ. Tôi có thể xếp bạn vào chuyến 7 giờ sáng mai.',
      },
      {
        speaker: 'you',
        text: "Is there anything earlier? And if I have to stay overnight, does the airline cover the hotel?",
        vi: 'Có chuyến nào sớm hơn không? Và nếu phải ở lại qua đêm, hãng có lo khách sạn không?',
        task: 'Hỏi HAI điều: phương án tốt hơn + quyền lợi của bạn. Không ai tự đề nghị đâu.',
        targets: ['anything earlier', 'cover', 'hotel', 'overnight'],
        alts: [
          {
            text: "Nothing sooner? And what about accommodation for tonight?",
            note: '"accommodation" là từ chuẩn ở sân bay.',
          },
          {
            text: "Is that the earliest option? Also, am I entitled to a hotel voucher?",
            note: '"am I entitled to…" = tôi có được hưởng… không. Rất mạnh khi đòi quyền lợi.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "There's a 5 a.m. but it's fully booked. And yes, since the delay is ours, you get a hotel and meal voucher.",
        vi: 'Có chuyến 5 giờ sáng nhưng hết chỗ. Và có, vì lỗi hoãn thuộc về chúng tôi nên bạn được phiếu khách sạn và ăn uống.',
      },
      {
        speaker: 'you',
        text: "Okay, I'll take the 7 a.m. then. Sorry, could you just confirm — my bag goes through automatically, or do I need to collect it?",
        vi: 'Được, vậy tôi lấy chuyến 7 giờ. Xin lỗi, xác nhận giúp tôi — hành lý tự chuyển tiếp hay tôi phải lấy ra?',
        task: 'Chốt lựa chọn + hỏi chi tiết dễ bị bỏ sót. Hành lý là bẫy kinh điển.',
        targets: ['confirm', 'my bag', 'collect', 'automatically'],
        alts: [
          {
            text: "That works. Quick question — is my luggage checked through?",
            note: '"checked through" = chuyển thẳng tới đích. Thuật ngữ chuẩn.',
          },
          {
            text: "Fine by me. Do I need to pick up my suitcase tonight?",
            note: 'Cách hỏi đơn giản, ai cũng hiểu.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "You'll need to collect it tonight and check it in again in the morning. Here are your vouchers and the new boarding pass.",
        vi: 'Tối nay bạn phải lấy ra và sáng mai ký gửi lại. Đây là phiếu và thẻ lên máy bay mới.',
      },
      {
        speaker: 'you',
        text: "Got it — collect tonight, check in again at 5. Thank you, I really appreciate you sorting this out.",
        vi: 'Rõ rồi — tối lấy ra, 5 giờ ký gửi lại. Cảm ơn, tôi rất trân trọng việc bạn xử lý giúp.',
        task: 'Nhắc lại để không nhầm + cảm ơn thật lòng. Nhân viên sẽ nhớ bạn theo hướng tốt.',
        targets: ['got it', 'thank you', 'appreciate', 'sorting'],
        alts: [
          {
            text: "Perfect, thanks so much for your help.",
            note: 'An toàn và luôn đúng.',
          },
          {
            text: "That's clear. Thanks — I know it's been a long day for you too.",
            note: 'Đồng cảm với nhân viên. Cực kỳ hiệu quả.',
          },
        ],
      },
    ],
  },

  /* ====================== 10. THUÊ NHÀ ====================== */
  {
    id: 's10',
    title: 'Viewing an apartment',
    titleVi: 'Đi xem nhà thuê',
    emoji: '🏠',
    domain: 'daily',
    level: 'B1',
    minutes: 5,
    context:
      "You're viewing a flat. The agent is smooth and quick. Ask the questions that actually matter before you sign anything.",
    contextVi:
      'Bạn đi xem một căn hộ. Môi giới nói trơn tru và nhanh. Hãy hỏi những câu thật sự quan trọng trước khi ký.',
    image: '/images/scenarios/apartment.jpg',
    chunkIds: ['c044', 'c042', 'c145', 'c062', 'c007'],
    turns: [
      {
        speaker: 'them',
        text: "So this is the living room — lovely light, isn't it? And the kitchen was renovated last year.",
        vi: 'Đây là phòng khách — sáng đẹp đúng không? Còn bếp thì mới sửa năm ngoái.',
      },
      {
        speaker: 'you',
        text: "It's nice, yeah. Can I ask what the monthly rent covers? Is electricity included, or is that separate?",
        vi: 'Đẹp thật. Cho tôi hỏi tiền thuê hàng tháng gồm những gì? Điện có bao gồm không hay tính riêng?',
        task: 'Khen một câu rồi hỏi thẳng vào TIỀN. Đừng ngại.',
        targets: ['what does', 'cover', 'included', 'separate', 'rent'],
        alts: [
          {
            text: "Looks good. What's included in the rent — bills, internet?",
            note: '"bills" ở Anh nghĩa là tiền điện nước ga.',
          },
          {
            text: "I like it. Is the rent all-inclusive or do utilities come on top?",
            note: '"on top" = tính thêm ngoài. "utilities" = điện nước.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Rent is water and building maintenance. Electricity and internet are on you. It's usually not much.",
        vi: 'Tiền thuê gồm nước và phí quản lý. Điện và internet bạn tự trả. Thường không nhiều đâu.',
      },
      {
        speaker: 'you',
        text: "What do you mean by 'not much'? Do you have an idea of what the last tenant paid in summer?",
        vi: 'Ý bạn "không nhiều" là bao nhiêu? Bạn có biết người thuê trước trả bao nhiêu vào mùa hè không?',
        task: 'Không chấp nhận câu mơ hồ. Ép ra con số cụ thể.',
        targets: ['what do you mean', 'how much', 'last tenant', 'roughly'],
        alts: [
          {
            text: "Roughly how much though? I'd like a number if you have one.",
            note: '"if you have one" làm câu hỏi bớt gay gắt.',
          },
          {
            text: "Can you give me a ballpark figure for a summer month?",
            note: '"ballpark figure" = con số ước chừng. Rất tự nhiên.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Honestly, I'd guess around eighty a month with air conditioning. Now — there's a lot of interest in this one, so I'd move fast if I were you.",
        vi: 'Thật lòng tôi đoán khoảng tám mươi một tháng nếu dùng máy lạnh. À — căn này nhiều người quan tâm lắm, nếu là bạn tôi sẽ quyết nhanh.',
      },
      {
        speaker: 'you',
        text: "I hear you, but I'd rather not decide today. Would it be possible to see the contract first? I want to check the notice period.",
        vi: 'Tôi hiểu, nhưng tôi không muốn quyết hôm nay. Tôi xem hợp đồng trước được không? Tôi muốn kiểm tra điều khoản báo trước.',
        task: 'Chống lại áp lực. Lịch sự nhưng KHÔNG nhượng bộ.',
        targets: ['I hear you', 'rather not', 'contract', 'notice period'],
        alts: [
          {
            text: "I understand, but I don't sign the same day I view. Could you send the contract over?",
            note: 'Nêu nguyên tắc cá nhân — rất khó bị ép.',
          },
          {
            text: "That's fine, but I'll need to read the terms first. When can you send them?",
            note: 'Chuyển từ "có / không" sang "khi nào" — kỹ thuật đàm phán.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Of course, I can email it this afternoon. Standard is two months' deposit, one month's notice.",
        vi: 'Tất nhiên, chiều nay tôi email. Tiêu chuẩn là cọc hai tháng, báo trước một tháng.',
      },
      {
        speaker: 'you',
        text: "So if I've got this right — two months up front as a deposit, and I can leave with thirty days' notice. Is the deposit refundable in full?",
        vi: 'Vậy nếu tôi hiểu đúng — cọc hai tháng trả trước, và tôi có thể rời đi khi báo trước 30 ngày. Tiền cọc được hoàn đủ chứ?',
        task: 'Tóm tắt lại + hỏi câu quan trọng nhất: có lấy lại được tiền không.',
        targets: ['if I', 'got this right', 'deposit', 'refundable'],
        alts: [
          {
            text: "Let me confirm — two months deposit, 30 days notice. Do I get the full deposit back?",
            note: 'Cấu trúc xác nhận rồi hỏi tiếp, rất mạch lạc.',
          },
          {
            text: "Got it. And under what conditions would you keep part of the deposit?",
            note: 'Hỏi ngược về rủi ro — người có kinh nghiệm mới hỏi vậy.',
          },
        ],
      },
    ],
  },

  /* ====================== 11. NETWORKING ====================== */
  {
    id: 's11',
    title: 'Small talk at a tech meetup',
    titleVi: 'Bắt chuyện ở một buổi meetup công nghệ',
    emoji: '🍻',
    domain: 'social',
    level: 'B1',
    minutes: 5,
    context:
      "You're at a dev meetup and you don't know anyone. Someone is standing alone near the snacks. Go.",
    contextVi:
      'Bạn ở một buổi meetup dev và không quen ai. Có người đang đứng một mình gần bàn đồ ăn. Tiến tới.',
    image: '/images/scenarios/meetup.jpg',
    chunkIds: ['c070', 'c076', 'c077', 'c087', 'c180', 'c181'],
    turns: [
      {
        speaker: 'you',
        text: "Hey, is this your first time at one of these?",
        vi: 'Chào, đây là lần đầu bạn tới mấy buổi này à?',
        task: 'MỞ LỜI trước. Câu hỏi mở đầu an toàn nhất trên đời.',
        targets: ['first time', 'hey', 'hi'],
        alts: [
          { text: "Hi — have you been to one of these before?", note: 'Cùng ý, hơi trang trọng hơn.' },
          {
            text: "Hey. Any good talks so far? I just got here.",
            note: 'Hỏi về sự kiện — luôn có đáp án.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Second time, actually. I came for the talk on WebAssembly. You?",
        vi: 'Lần thứ hai đó. Tôi tới vì bài nói về WebAssembly. Còn bạn?',
      },
      {
        speaker: 'you',
        text: "Same, honestly — although half of it went over my head. I do mostly mobile, so it's a bit outside my world.",
        vi: 'Cũng vậy — dù nửa bài tôi nghe không kịp. Tôi làm mobile là chính nên hơi ngoài vùng của tôi.',
        task: 'Thành thật + tiết lộ về mình để họ có cái mà hỏi tiếp.',
        targets: ['same', 'over my head', 'mobile', 'outside'],
        alts: [
          {
            text: "Me too. Bit over my head though — I'm a mobile dev, Flutter mostly.",
            note: '"over my head" = quá tầm hiểu của tôi. Câu này rất được lòng người.',
          },
          {
            text: "Same here. I build mobile apps, so WebAssembly is new territory for me.",
            note: '"new territory" = lĩnh vực mới.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Oh nice, Flutter? I've been meaning to try it. Is it as good as people say?",
        vi: 'Ồ hay, Flutter à? Tôi định thử lâu rồi. Nó có tốt như lời đồn không?',
      },
      {
        speaker: 'you',
        text: "It's genuinely good for shipping fast. The trade-off is you fight the platform when you need something very native. But hot reload alone saved me hours.",
        vi: 'Nó thật sự tốt để ship nhanh. Đánh đổi là bạn phải vật lộn khi cần thứ gì đó rất native. Nhưng riêng hot reload đã cứu tôi hàng giờ.',
        task: 'Trả lời CÂN BẰNG: ưu + nhược + ví dụ. Đây là dấu hiệu của người có kinh nghiệm thật.',
        targets: ['good for', 'trade-off', 'but', 'saved me'],
        alts: [
          {
            text: "Yeah, mostly. Great for speed, less great when you need deep platform stuff.",
            note: 'Câu trả lời gọn mà vẫn cân bằng.',
          },
          {
            text: "Depends what you're building. For CRUD-style apps it's fantastic. For heavy graphics, less so.",
            note: '"Depends what you\'re building" — mở đầu thông minh cho mọi câu hỏi so sánh.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "That's useful, thanks. I'm Priya, by the way.",
        vi: 'Hữu ích đấy, cảm ơn. À mà tôi là Priya.',
      },
      {
        speaker: 'you',
        text: "Thinh, nice to meet you. What are you working on at the moment?",
        vi: 'Tôi là Thịnh, rất vui được gặp. Bạn đang làm gì vậy?',
        task: 'Giới thiệu tên rồi HỎI NGƯỢC ngay. Không để hội thoại rơi.',
        targets: ['nice to meet you', 'what are you working on', "I'm"],
        alts: [
          {
            text: "I'm Thinh. Good to meet you. So what's your day job?",
            note: '"day job" = công việc chính. Thân mật.',
          },
          {
            text: "Thinh — nice to meet you, Priya. What brought you into WebAssembly?",
            note: 'Nhắc lại TÊN họ. Cực kỳ hiệu quả để tạo thiện cảm.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Backend, mostly Go. We're looking at Wasm for plugins. Anyway, I should probably grab a seat before the next talk.",
        vi: 'Backend, chủ yếu Go. Tụi tôi đang xem Wasm cho phần plugin. Thôi chắc tôi nên đi kiếm chỗ ngồi trước bài kế.',
      },
      {
        speaker: 'you',
        text: "Of course. It was great chatting — are you on LinkedIn? I'd love to hear how the Wasm thing goes.",
        vi: 'Tất nhiên rồi. Nói chuyện vui lắm — bạn có LinkedIn không? Tôi muốn biết vụ Wasm đó đi tới đâu.',
        task: 'ĐÓNG hội thoại có mục đích: xin kết nối. Đây là cả điểm của buổi networking.',
        targets: ['great chatting', 'LinkedIn', 'love to', 'keep in touch'],
        alts: [
          {
            text: "No worries. Nice talking to you — shall we connect on LinkedIn?",
            note: 'Ngắn và trực tiếp.',
          },
          {
            text: "Go for it. Great to meet you — let's keep in touch.",
            note: '"keep in touch" = giữ liên lạc. An toàn tuyệt đối.',
          },
        ],
      },
    ],
  },

  /* ====================== 12. GỌI ĐIỆN KHIẾU NẠI ====================== */
  {
    id: 's12',
    title: 'Disputing a bill on the phone',
    titleVi: 'Gọi điện khiếu nại hoá đơn sai',
    emoji: '📞',
    domain: 'daily',
    level: 'B2',
    minutes: 6,
    context:
      "Your internet bill is double. You're on the phone with support — no faces, no gestures, just your voice. The hardest mode.",
    contextVi:
      'Hoá đơn internet bị tính gấp đôi. Bạn gọi tổng đài — không thấy mặt, không cử chỉ, chỉ có giọng nói. Chế độ khó nhất.',
    image: '/images/scenarios/phone-call.jpg',
    chunkIds: ['c146', 'c147', 'c040', 'c048', 'c171', 'c045'],
    turns: [
      {
        speaker: 'them',
        text: "Thank you for calling. My name is Josh, how can I help you today?",
        vi: 'Cảm ơn bạn đã gọi. Tôi là Josh, tôi giúp gì được cho bạn hôm nay?',
      },
      {
        speaker: 'you',
        text: "Hi Josh. I'm calling about my last bill — it's about double what it normally is, and I don't think that's right.",
        vi: 'Chào Josh. Tôi gọi về hoá đơn tháng rồi — nó gấp đôi bình thường, tôi nghĩ có gì đó không đúng.',
        task: 'Nói LÝ DO GỌI trong câu đầu tiên. Dùng tên họ vừa xưng — tạo thiện cảm ngay.',
        targets: ["I'm calling about", 'bill', 'double', 'not right'],
        alts: [
          {
            text: "Hi. There seems to be a problem with my bill — it's twice the usual amount.",
            note: '"There seems to be a problem" — mở đầu khiếu nại lịch sự chuẩn mực.',
          },
          {
            text: "Hey Josh. I've been charged twice what I normally pay and I'd like to understand why.",
            note: '"I\'d like to understand why" — không buộc tội, nhưng đòi giải thích.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Sorry to hear that. Can I take your account number and the last four digits of your postcode?",
        vi: 'Rất tiếc về việc đó. Cho tôi xin số tài khoản và bốn ký tự cuối mã bưu điện?',
      },
      {
        speaker: 'you',
        text: "Sure — the account number is 4-4-2-9-0-1. Sorry, did you say postcode? I'm not sure I have that on the bill.",
        vi: 'Được — số tài khoản là 4-4-2-9-0-1. Xin lỗi, bạn nói mã bưu điện à? Tôi không chắc hoá đơn có ghi.',
        task: 'Đọc số RÕ TỪNG CHỮ. Và hỏi lại ngay nếu chưa nghe rõ — trên điện thoại đừng đoán.',
        targets: ['account number', 'did you say', 'sorry', 'not sure'],
        alts: [
          {
            text: "Yes — four four two nine zero one. Sorry, could you repeat the second part?",
            note: 'Đọc số theo từng chữ là cách chuẩn qua điện thoại.',
          },
          {
            text: "Of course. 442901. Sorry, you cut out — what was the second thing?",
            note: '"you cut out" = tiếng bạn bị ngắt. Cái cớ hoàn hảo để hỏi lại.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "No problem, just the account is fine. Right… I can see a one-off installation charge of ninety on there.",
        vi: 'Không sao, chỉ cần số tài khoản. Rồi… tôi thấy có một khoản phí lắp đặt một lần là chín mươi.',
      },
      {
        speaker: 'you',
        text: "That's the issue — I was told on the phone in March that installation was free with a twelve-month contract. Can you check the notes on my account?",
        vi: 'Đó chính là vấn đề — hồi tháng Ba qua điện thoại tôi được cho biết lắp đặt miễn phí khi ký hợp đồng 12 tháng. Bạn kiểm tra ghi chú trong tài khoản giúp tôi được không?',
        task: 'Đưa ra BẰNG CHỨNG cụ thể (khi nào, ai nói, nội dung gì) rồi yêu cầu hành động.',
        targets: ['I was told', 'free', 'contract', 'check the notes'],
        alts: [
          {
            text: "That shouldn't be there. Your colleague told me in March it was waived on a 12-month plan.",
            note: '"waived" = được miễn. Từ chuẩn khi nói về phí.',
          },
          {
            text: "Right, but I was promised that would be waived. Could you look at the call notes from March?",
            note: '"I was promised" mạnh hơn "I was told" — dùng khi bạn chắc chắn.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Let me have a look… hmm, I can see a note but it doesn't specifically say the fee was waived. I'm afraid I can't remove it without that.",
        vi: 'Để tôi xem… hừm, tôi thấy có ghi chú nhưng không nói rõ là được miễn phí. Tôi e là không bỏ được nếu không có ghi chú đó.',
      },
      {
        speaker: 'you',
        text: "I understand it's not in your notes, but I did have that conversation. Is there someone else who can authorise it, or can you request a review? I'd rather sort this out today than cancel the contract.",
        vi: 'Tôi hiểu là ghi chú không có, nhưng cuộc trao đổi đó có thật. Có ai khác duyệt được không, hoặc bạn mở yêu cầu xem xét lại được không? Tôi muốn giải quyết hôm nay hơn là huỷ hợp đồng.',
        task: 'Không cãi nhau với người không có quyền. Xin ESCALATE + nhắc nhẹ hậu quả.',
        targets: ['I understand', 'someone else', 'authorise', 'review', 'rather'],
        alts: [
          {
            text: "I get that it's not your call. Could you escalate it to a supervisor for me?",
            note: '"it\'s not your call" = không phải quyền của bạn. Rất cảm thông, rất hiệu quả.',
          },
          {
            text: "That's frustrating, but I know it's not your fault. What are my options from here?",
            note: '"What are my options?" — câu thần chú buộc tổng đài phải đưa phương án.',
          },
        ],
      },
      {
        speaker: 'them',
        text: "Let me put you on hold for a moment and speak to my supervisor. … Okay, good news — we can credit the ninety back to your next bill.",
        vi: 'Cho tôi giữ máy một lát để hỏi cấp trên. … Rồi, tin tốt — tụi tôi hoàn chín mươi vào hoá đơn tháng sau.',
      },
      {
        speaker: 'you',
        text: "That's great, thank you. Just to confirm — the ninety comes off next month's bill, and I don't need to do anything else? Could I get a reference number for this call?",
        vi: 'Tuyệt, cảm ơn bạn. Xác nhận lại — chín mươi sẽ trừ vào hoá đơn tháng sau, và tôi không cần làm gì thêm? Cho tôi xin mã tham chiếu cuộc gọi này được không?',
        task: 'Xác nhận + XIN MÃ THAM CHIẾU. Người có kinh nghiệm luôn xin mã.',
        targets: ['just to confirm', 'reference number', "don't need to", 'next month'],
        alts: [
          {
            text: "Perfect. Can I get a reference number, just in case?",
            note: '"just in case" = phòng khi. Rất tự nhiên.',
          },
          {
            text: "Thanks Josh. Could you email me confirmation of that?",
            note: 'Xin xác nhận bằng email — bằng chứng mạnh nhất.',
          },
        ],
      },
    ],
  },
];

export const SCENARIO_BY_ID = new Map(SCENARIOS.map((s) => [s.id, s]));
