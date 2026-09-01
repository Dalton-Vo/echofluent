import type { ShadowPack } from '@/types';

/* ============================================================================
 *  SHADOWING — nói ĐÈ lên giọng mẫu, chậm hơn nửa giây
 *
 *  Đây là bài tập hiệu quả nhất để đổi "nhịp" tiếng Anh của bạn. Bạn không
 *  học từ mới — bạn dạy miệng và tai mình chạy theo tốc độ thật.
 *
 *  Quy ước ký hiệu trong `text`:
 *    /       → ngắt nhóm nghĩa (thought group). Hít hơi ở đây, KHÔNG ngắt giữa nhóm.
 *    *word*  → từ mang trọng âm câu. Nhấn mạnh, kéo dài hơn các từ khác.
 * ========================================================================== */

export const SHADOW_PACKS: ShadowPack[] = [
  {
    id: 'sh01',
    title: 'Standup in 30 seconds',
    titleVi: 'Báo cáo standup trong 30 giây',
    emoji: '☀️',
    domain: 'work',
    level: 'B1',
    baseRate: 0.95,
    lines: [
      {
        text: "*Morning* everyone. / *Quick* update from me.",
        vi: 'Chào mọi người. Cập nhật nhanh từ tôi.',
      },
      {
        text: "*Yesterday* / I finished the *login* flow / and pushed it for *review*.",
        vi: 'Hôm qua tôi làm xong luồng đăng nhập và đẩy lên review.',
      },
      {
        text: "*Today* / I'm picking up the *caching* ticket. / Should have something by *tomorrow*.",
        vi: 'Hôm nay tôi nhận ticket caching. Chắc mai có kết quả.',
      },
      {
        text: "*One* thing though / — I'm still *waiting* on the staging key.",
        vi: 'Có một chuyện — tôi vẫn đang chờ key staging.',
      },
      {
        text: "It's not *blocking* me yet, / but it *will* be by Thursday.",
        vi: 'Chưa chặn tôi, nhưng thứ Năm thì sẽ chặn.',
      },
      {
        text: "Other than *that*, / all *good* on my end.",
        vi: 'Ngoài chuyện đó ra thì phía tôi ổn cả.',
      },
    ],
  },

  {
    id: 'sh02',
    title: 'Introducing yourself',
    titleVi: 'Giới thiệu bản thân (60 giây)',
    emoji: '👋',
    domain: 'work',
    level: 'B1',
    baseRate: 0.95,
    lines: [
      {
        text: "Hi, / I'm *Thinh*. / I'm a *software developer* based in *Ho Chi Minh City*.",
        vi: 'Chào, tôi là Thịnh. Tôi là lập trình viên ở TP.HCM.',
      },
      {
        text: "I mostly build *mobile apps* / — *Flutter* these days, / and a fair bit of *Unity* before that.",
        vi: 'Tôi chủ yếu làm app mobile — dạo này là Flutter, trước đó khá nhiều Unity.',
      },
      {
        text: "What I *enjoy* most / is taking something *messy* / and making it feel *simple* to use.",
        vi: 'Điều tôi thích nhất là biến một thứ lộn xộn thành thứ dùng thấy đơn giản.',
      },
      {
        text: "Right now I'm working on an *offline-first* app / for warehouse *staff*.",
        vi: 'Hiện tại tôi làm một app offline-first cho nhân viên kho.',
      },
      {
        text: "Outside of *work* / I'm usually building something *small* / just to see if it *works*.",
        vi: 'Ngoài giờ làm tôi hay xây thứ gì đó nhỏ nhỏ chỉ để xem nó có chạy không.',
      },
      {
        text: "That's *me* / — what about *you*?",
        vi: 'Về tôi là vậy — còn bạn thì sao?',
      },
    ],
  },

  {
    id: 'sh03',
    title: 'Explaining a bug to a PM',
    titleVi: 'Giải thích bug cho người không rành kỹ thuật',
    emoji: '🐞',
    domain: 'tech',
    level: 'B2',
    baseRate: 1.0,
    lines: [
      {
        text: "*Long* story short / — the app couldn't *read* its data for about *forty* minutes.",
        vi: 'Nói ngắn gọn — app không đọc được dữ liệu khoảng 40 phút.',
      },
      {
        text: "A routine *update* / took much *longer* than we expected.",
        vi: 'Một bản cập nhật thường lệ chạy lâu hơn dự kiến rất nhiều.',
      },
      {
        text: "*Nothing* was lost. / Everything people did *before* that / is completely *safe*.",
        vi: 'Không mất gì cả. Mọi thứ người dùng làm trước đó đều an toàn.',
      },
      {
        text: "We've already changed *three* things / so it doesn't happen *again*.",
        vi: 'Tụi tôi đã thay đổi ba thứ để chuyện đó không lặp lại.',
      },
      {
        text: "Smaller *updates*, / faster *alerts*, / and never during *business hours*.",
        vi: 'Cập nhật nhỏ hơn, cảnh báo nhanh hơn, và không bao giờ chạy trong giờ làm việc.',
      },
      {
        text: "If the client asks for *detail*, / send them to *me* / — I'll walk them through it.",
        vi: 'Nếu khách hỏi chi tiết, cứ chuyển cho tôi — tôi sẽ giải thích cho họ.',
      },
    ],
  },

  {
    id: 'sh04',
    title: 'Disagreeing without a fight',
    titleVi: 'Phản đối mà không gây căng thẳng',
    emoji: '🤝',
    domain: 'work',
    level: 'B2',
    baseRate: 1.0,
    lines: [
      {
        text: "I *see* where you're coming from, / but I'd *push back* a little.",
        vi: 'Tôi hiểu ý bạn, nhưng tôi xin phản biện một chút.',
      },
      {
        text: "My *concern* is / that it adds a *lot* of complexity / for a case that might never *happen*.",
        vi: 'Điều tôi lo là nó thêm rất nhiều phức tạp cho một trường hợp có thể không xảy ra.',
      },
      {
        text: "*Correct* me if I'm wrong, / but we've only seen that *once*, / right?",
        vi: 'Sửa giúp nếu tôi sai, nhưng mình mới thấy nó một lần thôi, đúng không?',
      },
      {
        text: "How *about* this / — we do the *simple* version now, / and revisit it if it *bites* us.",
        vi: 'Hay thế này — mình làm bản đơn giản trước, khi nào có vấn đề thì xem lại.',
      },
      {
        text: "I'm *happy* to be wrong here. / What am I *missing*?",
        vi: 'Tôi sẵn sàng nhận mình sai. Tôi đang bỏ sót điều gì?',
      },
    ],
  },

  {
    id: 'sh05',
    title: 'Ordering and small talk',
    titleVi: 'Gọi món và bắt chuyện',
    emoji: '☕',
    domain: 'daily',
    level: 'A2',
    baseRate: 0.9,
    lines: [
      {
        text: "Hi — / I'll have a *large* iced latte, / please.",
        vi: 'Chào — cho tôi một ly latte đá lớn.',
      },
      {
        text: "*To go*, / thanks. / Oh, / do you take *card*?",
        vi: 'Mang đi nhé. À, ở đây nhận thẻ chứ?',
      },
      {
        text: "*Busy* today, / isn't it?",
        vi: 'Hôm nay đông nhỉ?',
      },
      {
        text: "Yeah, / I work from *home* mostly, / but I come here / when I actually need to get things *done*.",
        vi: 'Ừ, tôi chủ yếu làm ở nhà, nhưng ra đây khi cần thật sự làm được việc.',
      },
      {
        text: "No *rush*, honestly. / Take your *time*.",
        vi: 'Không gấp đâu thật đó. Bạn cứ từ từ.',
      },
      {
        text: "*Thanks* a lot / — have a good *one*!",
        vi: 'Cảm ơn nhiều — chúc một ngày tốt lành!',
      },
    ],
  },

  {
    id: 'sh06',
    title: 'Buying time gracefully',
    titleVi: 'Câu giờ mà vẫn tự tin',
    emoji: '⏱️',
    domain: 'work',
    level: 'B1',
    baseRate: 0.95,
    lines: [
      {
        text: "That's a *good* question, actually.",
        vi: 'Câu hỏi hay đấy.',
      },
      {
        text: "*Off* the top of my head, / I'd say about *two* days.",
        vi: 'Nghĩ nhanh thì tôi nói khoảng hai ngày.',
      },
      {
        text: "*Let* me think for a second… / okay, / here's how I'd *approach* it.",
        vi: 'Cho tôi nghĩ một giây… rồi, đây là cách tôi sẽ tiếp cận.',
      },
      {
        text: "I'm not *entirely* sure, / but my *guess* is / it's a caching issue.",
        vi: 'Tôi không chắc lắm, nhưng tôi đoán là vấn đề cache.',
      },
      {
        text: "Let me *double-check* / and I'll get *back* to you.",
        vi: 'Để tôi kiểm tra lại rồi báo lại bạn.',
      },
      {
        text: "*How* can I put this… / it *works*, / but it's *fragile*.",
        vi: 'Diễn đạt sao nhỉ… nó chạy được, nhưng mong manh.',
      },
    ],
  },

  {
    id: 'sh07',
    title: 'Telling a short story',
    titleVi: 'Kể một câu chuyện ngắn',
    emoji: '📖',
    domain: 'social',
    level: 'B2',
    baseRate: 1.0,
    lines: [
      {
        text: "So the *funniest* thing happened / on my first day at that *job*.",
        vi: 'Chuyện buồn cười nhất xảy ra vào ngày đầu tiên tôi đi làm chỗ đó.',
      },
      {
        text: "I got there *early*, / really *nervous*, / dressed way too *formally*.",
        vi: 'Tôi tới sớm, cực kỳ hồi hộp, ăn mặc trang trọng quá mức.',
      },
      {
        text: "And *everyone* else / was in *shorts* and *flip-flops*.",
        vi: 'Còn mọi người thì mặc quần đùi với dép lê.',
      },
      {
        text: "The *worst* part / was that my manager thought / I was there for a *client* meeting.",
        vi: 'Tệ nhất là sếp tôi tưởng tôi tới để họp với khách.',
      },
      {
        text: "*Anyway*, / long story short, / I never wore a *shirt* there again.",
        vi: 'Nói chung, tóm lại là tôi không bao giờ mặc sơ mi ở đó nữa.',
      },
      {
        text: "*Honestly*, / it's still the *best* team I've worked with.",
        vi: 'Thật lòng, đó vẫn là team tuyệt nhất tôi từng làm cùng.',
      },
    ],
  },

  {
    id: 'sh08',
    title: 'Handling a phone problem',
    titleVi: 'Xử lý sự cố qua điện thoại',
    emoji: '📞',
    domain: 'daily',
    level: 'B2',
    baseRate: 1.0,
    lines: [
      {
        text: "Hi, / I'm *calling* about my last *bill*.",
        vi: 'Chào, tôi gọi về hoá đơn tháng rồi.',
      },
      {
        text: "It's about *double* what it normally is, / and I don't think that's *right*.",
        vi: 'Nó gấp đôi bình thường, và tôi nghĩ có gì đó không đúng.',
      },
      {
        text: "*Sorry*, / you're breaking *up* / — could you say that *again*?",
        vi: 'Xin lỗi, tiếng bạn bị ngắt — nói lại giúp tôi được không?',
      },
      {
        text: "The account number is / *four* *four* *two* *nine* *zero* *one*.",
        vi: 'Số tài khoản là bốn bốn hai chín không một.',
      },
      {
        text: "I *understand* it's not in your notes, / but I *did* have that conversation.",
        vi: 'Tôi hiểu là ghi chú không có, nhưng cuộc trao đổi đó có thật.',
      },
      {
        text: "*Just* to confirm / — that comes *off* next month's bill? / Could I get a *reference* number?",
        vi: 'Xác nhận lại — cái đó sẽ trừ vào hoá đơn tháng sau? Cho tôi xin mã tham chiếu được không?',
      },
    ],
  },

  {
    id: 'sh09',
    title: 'Reacting like a native',
    titleVi: 'Phản ứng như người bản xứ',
    emoji: '😮',
    domain: 'social',
    level: 'A2',
    baseRate: 1.0,
    lines: [
      {
        text: "Oh *really*? / That's *interesting*.",
        vi: 'Thật hả? Hay đó.',
      },
      { text: "Wait, / *seriously*?", vi: 'Khoan, thật á?' },
      { text: "That must have been *tough*.", vi: 'Chắc lúc đó khó khăn lắm.' },
      { text: "*No* way! / Good for *you*!", vi: 'Không thể nào! Mừng cho bạn!' },
      { text: "Ah, / *gotcha*. / That makes *sense*.", vi: 'À hiểu rồi. Nghe hợp lý.' },
      { text: "*Tell* me more about that.", vi: 'Kể thêm đi.' },
      { text: "I know *exactly* what you mean.", vi: 'Tôi hiểu chính xác ý bạn.' },
      { text: "Ugh, / that *sucks*. / What did you *do*?", vi: 'Haizz, chán thật. Rồi bạn làm gì?' },
    ],
  },

  {
    id: 'sh10',
    title: 'Closing a conversation',
    titleVi: 'Kết thúc hội thoại tự nhiên',
    emoji: '👋',
    domain: 'social',
    level: 'B1',
    baseRate: 0.95,
    lines: [
      {
        text: "*Anyway*, / I should probably get *going*.",
        vi: 'Thôi, chắc tôi phải đi rồi.',
      },
      {
        text: "It was *great* catching up / — we should do this *again*.",
        vi: 'Gặp lại nói chuyện vui lắm — hôm nào mình lại nhé.',
      },
      {
        text: "I know you're *busy*, / so I'll *let* you go.",
        vi: 'Biết bạn bận nên tôi không giữ nữa.',
      },
      {
        text: "*Thanks* again, / I really *appreciate* it.",
        vi: 'Cảm ơn lần nữa, tôi rất trân trọng.',
      },
      {
        text: "Let's *touch base* next week / once the numbers come *in*.",
        vi: 'Tuần sau có số liệu mình trao đổi lại nhé.',
      },
      { text: "Alright, / *talk* soon!", vi: 'Rồi, nói chuyện sau nhé!' },
    ],
  },
];

export const SHADOW_BY_ID = new Map(SHADOW_PACKS.map((p) => [p.id, p]));

/** Tách một dòng shadowing thành các nhóm nghĩa + đánh dấu trọng âm */
export function parseShadowLine(text: string): { words: { w: string; stress: boolean }[] }[] {
  return text
    .split('/')
    .map((g) => g.trim())
    .filter(Boolean)
    .map((group) => ({
      words: group
        .split(/\s+/)
        .filter(Boolean)
        .map((raw) => {
          const stress = raw.startsWith('*') || raw.includes('*');
          return { w: raw.replace(/\*/g, ''), stress };
        }),
    }));
}

/** Bỏ hết ký hiệu để đưa vào bộ đọc */
export function plainShadowText(text: string): string {
  return text.replace(/\*/g, '').replace(/\s*\/\s*/g, ' ').replace(/\s+/g, ' ').trim();
}
