/* ============================================================================
 *  MẸO NHỚ — thứ biến "hiểu" thành "nhớ"
 *
 *  Bạn quên một cụm không phải vì nó khó, mà vì trong đầu bạn nó không móc vào
 *  cái gì cả. Mỗi mục ở đây cho cụm từ một cái móc:
 *
 *    hook     — móc để nhớ: bẻ nghĩa đen, liên tưởng, hoặc "khi thấy X thì nói Y"
 *    pitfall  — lỗi người Việt hay mắc đúng ở cụm này
 *    contrast — phân biệt với cụm gần giống, thứ hay bị dùng lẫn nhất
 *
 *  Nguyên tắc viết: mỗi dòng phải TRẢ LỜI ĐƯỢC một câu hỏi thật của người học.
 *  Không viết cho có.
 * ========================================================================== */

export interface MemoryHook {
  hook?: string;
  pitfall?: string;
  contrast?: string;
}

export const MEMORY_HOOKS: Record<string, MemoryHook> = {
  /* ---------------- câu giờ khi nghĩ ---------------- */
  c001: {
    hook: 'Nghĩa đen: "từ trên đỉnh đầu tôi" — thứ nổi lên đầu tiên, chưa qua kiểm chứng.',
    pitfall: 'Đừng dùng khi bạn CÓ số liệu chính xác — nó tự hạ thấp câu trả lời của bạn.',
    contrast: '"Off the top of my head" = đoán nhanh. "As far as I know" = theo hiểu biết của tôi, chắc hơn.',
  },
  c002: {
    hook: 'Câu giờ ngắn nhất và an toàn nhất. Học thuộc nó trước mọi cụm khác.',
    pitfall: 'Người Việt hay im lặng để nghĩ. Im lặng 3 giây trong tiếng Anh bị hiểu là bạn không hiểu câu hỏi.',
  },
  c003: {
    hook: 'Khen câu hỏi = mua 2 giây, mà người hỏi lại thấy vui. Lời hai đường.',
    pitfall: 'Đừng dùng quá 1 lần trong một cuộc trò chuyện, nghe sẽ giả.',
  },
  c004: {
    hook: 'Nghĩa đen: "tôi diễn đạt chuyện này thế nào đây" — báo hiệu bạn sắp nói điều tế nhị.',
    contrast: 'Khác "How can I say this" ở chỗ "put" nghe tự nhiên hơn hẳn với người bản xứ.',
  },
  c005: {
    hook: '"entirely" là tấm đệm: bạn vẫn trả lời, chỉ là không cam kết 100%.',
    pitfall: 'Bỏ "entirely" thành "I\'m not sure" nghe như bạn từ chối trả lời. Giữ nó lại.',
  },
  c006: {
    hook: 'Hình dung ý tưởng bạn đang nằm rải rác, bạn cần "gom" (gather) chúng lại.',
    contrast: 'Dùng khi vấn đề phức tạp. Chuyện đơn giản thì dùng c002 cho gọn.',
  },
  c007: {
    hook: 'Hai chữ cứu mạng cho MỌI câu hỏi khó. Nói xong là bạn có quyền hỏi ngược lại "tuỳ cái gì".',
    pitfall: 'Phải nói tiếp "depends on…" ngay, đừng dừng ở đó — dừng lại nghe như né tránh.',
  },
  c008: {
    hook: 'Nghĩa đen: "chuyện dài, rút ngắn lại" — báo trước bạn sắp tóm tắt.',
    pitfall: 'Nói xong phải tóm tắt THẬT ngắn. Nói "long story short" rồi kể 2 phút là mâu thuẫn.',
  },

  /* ---------------- nêu ý kiến ---------------- */
  c010: {
    hook: '"The way I see it" = "theo cách tôi nhìn" — nhấn rằng đây là góc nhìn, không phải chân lý.',
    contrast: 'Nhẹ hơn "I think", vì nó thừa nhận sẵn rằng người khác có thể nhìn khác.',
  },
  c011: {
    hook: 'Thân mật hơn c010. Dùng với đồng nghiệp ngang hàng, đừng dùng với khách hàng.',
    pitfall: 'Không dùng khi người ta ĐÃ hỏi ý bạn — nghe thừa. Chỉ dùng khi bạn tự xen ý vào.',
  },
  c012: {
    hook: 'Mẫu nêu vấn đề thông dụng nhất: “I think” làm nhận định bớt tuyệt đối và dễ nghe hơn.',
    pitfall: 'Nêu đúng vấn đề cụ thể ngay sau “is”; tránh dừng ở “I think the problem is…” quá lâu.',
  },
  c013: {
    hook: 'Vũ khí mạnh nhất của dev có kinh nghiệm: kinh nghiệm không cãi được.',
    contrast: '"From my experience" (đã trải qua) mạnh hơn "In my opinion" (chỉ nghĩ vậy).',
  },
  c014: {
    hook: '"lean towards" = nghiêng người về phía đó — chưa quyết hẳn, mới nghiêng thôi.',
    contrast: 'Nhẹ hơn "I prefer". Dùng khi bạn muốn để ngỏ khả năng đổi ý.',
  },
  c015: {
    hook: '"gut" là ruột — trực giác. Người bản xứ tin trực giác và nói ra thoải mái.',
    pitfall: 'Chỉ dùng trong nội bộ team. Với khách hàng thì cần số liệu, không cần ruột bạn.',
  },
  c016: {
    hook: '"It seems to me" đẩy nhận định thành quan sát cá nhân — rất khó bị phản bác.',
    contrast: 'Nhẹ hơn "I think" một bậc nữa, hợp khi bạn sắp chỉ ra vấn đề của người khác.',
  },
  c017: {
    hook: '"Honestly" báo hiệu: câu sau đây có thể hơi thẳng, chuẩn bị tinh thần.',
    pitfall: 'Lạm dụng sẽ khiến người nghe nghĩ những lúc khác bạn không thật lòng.',
  },
  c018: {
    hook: 'Nghĩa: "xét trong phạm vi liên quan đến tôi" — tôi ổn, người khác thì tôi không biết.',
    contrast: 'Trang trọng hơn c011, hợp trong email và họp có khách hàng.',
  },

  /* ---------------- đồng ý ---------------- */
  c020: {
    hook: 'Câu đồng ý an toàn nhất tiếng Anh. Khi bí, cứ dùng nó.',
    pitfall: 'Người Việt hay gật đầu im lặng. Trên video call không ai thấy bạn gật — phải NÓI ra.',
  },
  c021: {
    hook: 'Không chỉ đồng ý mà còn cho thấy bạn đã suy nghĩ độc lập cùng hướng. Ghi điểm.',
    pitfall: 'Nói dối chỗ này rất dễ lộ, vì người ta sẽ hỏi tiếp "so what were you thinking?".',
  },
  c022: {
    hook: '"Fair enough" = "thôi cũng được, tôi không cãi nữa" — chấp nhận chứ không hẳn tán thành.',
    contrast: 'Khác "I agree" hoàn toàn: "fair enough" là bỏ cuộc tranh luận trong hoà khí.',
  },
  c023: {
    hook: 'Hình ảnh: cùng lên một con thuyền. Bạn cam kết chứ không chỉ gật.',
    contrast: 'Mạnh hơn "That makes sense" — nó hàm ý bạn sẽ tham gia làm.',
  },
  c024: {
    hook: '"a point" là một luận điểm. Bạn công nhận MỘT điểm, không phải cả lập luận.',
    pitfall: 'Đây là cách nhượng bộ một phần rất hay — dùng trước khi phản biện phần còn lại.',
  },
  c025: {
    hook: 'Nghĩa đen: "không thể đồng ý hơn nữa" = đồng ý tối đa. Đừng dịch nhầm thành phủ định.',
    pitfall: 'Cấu trúc phủ định nhưng nghĩa khẳng định — người Việt rất hay hiểu ngược.',
  },
  c026: {
    hook: 'Hai chữ để chốt lịch. Ngắn nhất có thể mà vẫn lịch sự.',
    contrast: '"Works for me" (tôi ổn) khác "It works" (nó chạy được). Đừng lẫn.',
  },

  /* ---------------- phản đối lịch sự ---------------- */
  c030: {
    hook: '"where you\'re coming from" = xuất phát điểm của bạn. Tôi hiểu vì sao bạn nghĩ vậy.',
    pitfall: 'Bắt buộc phải có "but" theo sau, nếu không câu bị treo lơ lửng.',
    contrast: 'Đây là câu mở đầu phản đối chuẩn mực nhất trong môi trường công sở phương Tây.',
  },
  c031: {
    hook: '"not so sure" chứ không phải "you\'re wrong". Nghi ngờ chứ không kết luận.',
    pitfall: 'Người Việt hay nói thẳng "No, that\'s wrong" — trong tiếng Anh nghe rất thô.',
  },
  c032: {
    hook: 'Công nhận góc nhìn của họ là MỘT trong nhiều góc — không phủ nhận, chỉ hạ cấp.',
    contrast: 'Lịch sự hơn c033, hợp khi nói với người cấp cao hơn.',
  },
  c033: {
    hook: '"push back" là đẩy ngược lại. "a little" làm cú đẩy đó nhẹ đi.',
    pitfall: 'Bỏ "a little" đi thì nghe khá gay gắt. Giữ nó lại trong hầu hết tình huống.',
  },
  c034: {
    hook: 'Không chê cách của họ, chỉ nói cách của mình. Rất an toàn về mặt quan hệ.',
    contrast: 'Nhẹ nhất trong nhóm phản đối — dùng khi bạn không muốn tranh luận dài.',
  },
  c035: {
    hook: 'Mở đầu bằng cách tự đặt mình vào thế có thể sai → người nghe hạ phòng thủ ngay.',
    pitfall: 'Dùng khi bạn khá chắc mình ĐÚNG. Đây là chiến thuật, không phải sự thiếu tự tin.',
  },
  c036: {
    hook: '"I hear you" = tôi nghe rồi, tôi ghi nhận. Rồi mới nêu điều bạn lo.',
    contrast: '"I hear you" không có nghĩa là đồng ý — nhiều người Việt hiểu nhầm chỗ này.',
  },
  c037: {
    hook: 'Tạm hoãn cuộc bàn bạc mà không bác ý ai; “come back to” nghĩa là quay lại xử lý sau.',
    pitfall: 'Nếu việc quan trọng, nên kèm một mốc cụ thể như “after lunch” hoặc “tomorrow morning”.',
  },

  /* ---------------- làm rõ ---------------- */
  c040: {
    hook: 'Câu quan trọng nhất trong cả app. Không hiểu mà gật là hỏng việc thật.',
    pitfall: 'Người Việt sợ mất mặt khi hỏi lại. Người bản xứ hỏi lại suốt — đó là chuyện bình thường.',
  },
  c041: {
    hook: '"you lost me" = bạn làm tôi lạc mất. Chỉ đúng CHỖ bạn lạc, khỏi nghe lại từ đầu.',
    contrast: 'Hiệu quả hơn c040 nhiều: người nói chỉ cần giải thích lại một đoạn.',
  },
  c042: {
    hook: 'Nhắc lại bằng lời của mình = vừa kiểm tra hiểu đúng, vừa cho thấy bạn có nghe.',
    pitfall: 'Kỹ năng bị bỏ quên nhiều nhất. Dùng nó sau mọi chỉ dẫn quan trọng.',
  },
  c043: {
    hook: '"walk me through" = dắt tôi đi qua từng bước, như dắt đi bộ.',
    contrast: 'Yêu cầu chi tiết hơn "explain" — hàm ý bạn muốn nghe theo trình tự.',
  },
  c044: {
    hook: 'Ép người nói phải cụ thể hoá từ mơ hồ. Đặc biệt hữu ích với "soon", "quickly", "a bit".',
    pitfall: 'Nhấn giọng vào từ bạn không hiểu, nếu không câu nghe như đang chất vấn.',
  },
  c045: {
    hook: '"got this right" = nắm đúng chưa. Kết thúc bằng "correct?" để ép xác nhận.',
    contrast: 'Trang trọng hơn c042 một chút, hợp trong họp và gọi điện.',
  },
  c046: {
    hook: 'Xin nói chậm là quyền của bạn, không phải sự yếu kém.',
    pitfall: 'Thêm lý do ("tôi muốn ghi lại") làm câu nghe chủ động thay vì bị động.',
  },
  c047: {
    hook: 'Khi ngôn ngữ bí, chuyển sang hình ảnh. Chia màn hình giải quyết được 80% hiểu nhầm kỹ thuật.',
  },
  c048: {
    hook: '"catch" = bắt được. Bạn không bắt kịp âm thanh, không phải không hiểu nghĩa.',
    pitfall: 'Khi nói nhanh, "didn\'t" nghe gần như biến mất: "I dinn catch that".',
    contrast: 'Dùng cho vấn đề nghe. Nếu không hiểu Ý thì dùng c044.',
  },

  /* ---------------- giành/nhường lượt ---------------- */
  c050: {
    hook: '"jump in" = nhảy vào. Xin phép trước rồi mới nhảy — đó là điểm khác với cắt lời.',
    pitfall: 'Người Việt hay đợi tới lượt và không bao giờ được gọi tới. Phải chủ động xin.',
  },
  c051: {
    hook: '"one quick thing" hứa hẹn sẽ ngắn → người ta sẵn sàng cho bạn nói.',
    pitfall: 'Đã hứa "quick" thì phải nhanh thật, nếu không lần sau không ai nhường nữa.',
  },
  c052: {
    hook: 'Ba chữ giải quyết tình huống nói chồng nhau trên video call. Cực kỳ hay dùng.',
  },
  c053: {
    hook: '"talk over each other" = nói đè lên nhau. Gọi tên tình huống ra là hết ngượng.',
    contrast: 'Sau câu này nên hỏi "What were you saying?" để nhường lại lượt.',
  },
  c054: {
    hook: '"finish that thought" = nói nốt ý. Bảo vệ lượt nói của bạn mà vẫn lịch sự.',
    pitfall: 'Nói với giọng bình tĩnh. Cùng câu này mà gắt lên thì thành đối đầu.',
  },
  c055: {
    hook: '"coming back to" = quay lại. Cho thấy bạn có lắng nghe từ nãy giờ — điểm cộng lớn.',
    contrast: 'Cách hay nhất để kéo cuộc họp về vấn đề bị bỏ quên.',
  },

  /* ---------------- nói giảm nói tránh ---------------- */
  c060: {
    hook: '"worth" = đáng. Đề xuất nhẹ tới mức người nghe không thấy bị bảo phải làm.',
    contrast: 'Nhẹ hơn "We should" rất nhiều. Dùng khi góp ý cho người ngang hoặc trên bạn.',
  },
  c061: {
    hook: 'Tự nhận mình có thể thiếu sót TRƯỚC khi chỉ ra lỗi người khác. Không ai mất mặt.',
    pitfall: 'Đây là kỹ thuật, không phải sự tự ti. Người bản xứ dùng nó ngay cả khi rất chắc.',
  },
  c062: {
    hook: 'Biến đề xuất thành câu hỏi → người nghe cảm thấy họ là người quyết.',
    contrast: 'Mềm hơn "We should…" và mềm hơn cả "Why don\'t we…".',
  },
  c063: {
    hook: '"A small thing" hạ trước mức độ nghiêm trọng → góp ý không thành lời chê.',
    pitfall: 'Nếu chuyện thật sự lớn thì đừng dùng — nói nhỏ đi rồi người ta bỏ qua thật.',
  },
  c064: {
    hook: 'Nói rõ là không gấp giúp người nhận không thấy áp lực, và thường làm nhanh hơn.',
  },
  c065: {
    hook: 'Thả sau một nhận định mạnh để chừa đường lui cho cả hai bên.',
    contrast: 'Đặt ở CUỐI câu (khác c035 đặt ở đầu) — đầu là xin phép, cuối là chừa đường lui.',
  },
  c066: {
    hook: 'Ba chữ đóng lại một đề xuất, hạ nó xuống thành ý tưởng ngẫu nhiên.',
    pitfall: 'Đừng dùng cho ý tưởng bạn thật sự muốn bảo vệ — nó tự làm nhẹ ý của bạn.',
  },
  c067: {
    hook: '"blocker" là thứ chặn tiến độ. Nói "không phải blocker" = tôi không đòi sửa ngay.',
    contrast: 'Từ khoá vàng trong code review: phân biệt rõ "phải sửa" và "nên sửa".',
  },

  /* ---------------- bắt chuyện ---------------- */
  c070: {
    hook: 'Đây là lời CHÀO, không phải câu hỏi thật. Trả lời ngắn rồi hỏi ngược lại.',
    pitfall: 'Đừng kể thật tình hình của bạn. "Pretty good, you?" là đủ và đúng.',
  },
  c071: {
    hook: 'Dùng khi lâu ngày gặp lại. "up to" = đang bận với chuyện gì.',
    contrast: 'Khác c070 ở chỗ đây là câu hỏi THẬT, người ta mong bạn kể một chút.',
  },
  c072: {
    hook: 'Câu mở đầu thứ Hai kinh điển của mọi văn phòng nói tiếng Anh.',
    pitfall: 'Phải hỏi ngược lại "How about yours?" — không hỏi lại là hội thoại chết.',
  },
  c073: {
    hook: 'Câu mở đầu thứ Sáu, đối xứng với c072 của thứ Hai.',
  },
  c074: {
    hook: '"been meaning to" = định làm từ lâu mà chưa làm. Cho thấy bạn đã để ý tới họ.',
    contrast: 'Cách mở đầu ấm áp hơn hẳn việc hỏi thẳng một câu hỏi cá nhân.',
  },
  c075: {
    hook: 'Chuyển từ chuyện công việc sang chuyện cá nhân một cách tự nhiên nhất.',
    pitfall: 'Trả lời phải cụ thể. "I watch movies" là câu trả lời làm chết hội thoại.',
  },
  c076: {
    hook: 'Hai chữ để phản ứng khi phát hiện điểm chung bất ngờ. Rất dễ tạo thiện cảm.',
  },
  c077: {
    hook: 'Câu hỏi an toàn tuyệt đối với đồng nghiệp mới — ai cũng trả lời được.',
  },
  c078: {
    hook: '"based" = đóng đô ở đâu. Chuẩn mực trong team remote, thay cho "where do you live".',
    pitfall: '"Where are you from" hỏi quê quán, "where are you based" hỏi nơi làm việc. Khác nhau.',
  },

  /* ---------------- phản ứng ---------------- */
  c080: {
    hook: 'Phản ứng mặc định khi không biết nói gì. Luôn đúng, luôn dùng được.',
    pitfall: 'Im lặng khi nghe người khác kể chuyện bị hiểu là bạn không quan tâm hoặc không hiểu.',
  },
  c081: {
    hook: 'Nghĩa đen "không đời nào" nhưng thực tế chỉ là "trời ơi thật á". Không phải phủ nhận.',
    pitfall: 'Người Việt hay dịch thành "không thể" rồi tưởng là đang cãi. Không phải.',
  },
  c082: {
    hook: '"must have been" = chắc hẳn đã. Đặt mình vào hoàn cảnh của họ.',
    contrast: 'Đây là câu đồng cảm chuẩn mực nhất. Học thuộc nó.',
  },
  c083: {
    hook: 'Ba chữ chúc mừng nhanh gọn cho tin vui nhỏ và vừa.',
    pitfall: 'Với tin vui LỚN thì "Congratulations!" phù hợp hơn.',
  },
  c084: {
    hook: 'Cho thấy bạn không chỉ nghe mà còn TỪNG TRẢI qua chuyện tương tự.',
    contrast: 'Mạnh hơn "I understand" vì nó hàm ý cùng cảnh ngộ.',
  },
  c085: {
    hook: '"Wait" ở đây không phải bảo người ta dừng — nó là dấu hiệu bạn đang bất ngờ.',
  },
  c086: {
    hook: '"relief" là sự nhẹ nhõm. Dùng khi chuyện xấu hoá ra không xấu.',
  },
  c087: {
    hook: 'Câu kéo dài hội thoại mà không cần nghĩ gì. Vũ khí khi bạn hết ý.',
    pitfall: 'Phải thật sự nghe câu trả lời. Hỏi rồi lơ đãng là phản tác dụng.',
  },
  c088: {
    hook: '"gotcha" rút từ "I\'ve got you" = tôi nắm được ý bạn rồi.',
    contrast: 'Thân mật. Trong họp trang trọng thì dùng "I see" hoặc "Understood".',
  },
  c089: {
    hook: 'Đồng cảm kiểu thân mật. Ngắn, thật, và rất hay dùng giữa đồng nghiệp.',
    pitfall: 'Không dùng với sếp lớn hay khách hàng — hơi suồng sã.',
  },

  /* ---------------- báo cáo tiến độ ---------------- */
  c090: {
    hook: '"wrap up" = gói lại, hoàn tất. Hình dung gói quà xong xuôi.',
    pitfall: 'Standup phải dùng thì QUÁ KHỨ cho hôm qua. "I finish" là lỗi kinh điển của người Việt.',
  },
  c091: {
    hook: '"pick up" = nhặt lên, nhận việc. Hình dung nhặt một ticket từ bảng.',
    contrast: 'Dùng thì hiện tại tiếp diễn cho hôm nay: "I\'m picking up", không phải "I pick up".',
  },
  c092: {
    hook: 'Hình dung một tảng đá chặn đường. Bạn không lười — bạn bị chặn.',
    pitfall: 'Phải nói rõ AI hoặc CÁI GÌ chặn bạn, nếu không không ai gỡ được.',
  },
  c093: {
    hook: '"on my end" = ở phía tôi. Giới hạn phát biểu trong phạm vi của bạn.',
    contrast: 'Nói "No blockers" trống không nghe cụt; thêm "on my end" là vừa đủ.',
  },
  c094: {
    hook: 'Con số cụ thể luôn tốt hơn "gần xong". "Almost done" là câu vô nghĩa trong standup.',
    pitfall: 'Nói kèm phần CÒN LẠI là gì, nếu không 80% có thể kéo dài cả tuần.',
  },
  c095: {
    hook: '"or so" làm ước lượng mềm đi, chừa chỗ cho sai số.',
    contrast: 'Xin thêm thời gian sớm luôn tốt hơn trễ hạn im lặng.',
  },
  c096: {
    hook: '"take it offline" = đưa ra ngoài cuộc họp. Không liên quan gì tới mạng internet.',
    pitfall: 'Người Việt hay hiểu nhầm là "làm khi offline". Nó nghĩa là "bàn riêng sau".',
  },
  c097: {
    hook: '"Heads up" = ngẩng đầu lên, coi chừng. Báo trước để người ta khỏi bất ngờ.',
  },
  c098: {
    hook: '"running behind" = đang chạy phía sau lịch. Hình ảnh rất trực quan.',
    pitfall: 'Báo trễ SỚM thì được thông cảm. Báo vào ngày deadline thì không.',
  },

  /* ---------------- code review ---------------- */
  c100: {
    hook: 'Khen trước, góp ý sau. Công thức bắt buộc trong văn hoá review phương Tây.',
    pitfall: 'Người Việt hay vào thẳng vấn đề. Trong review tiếng Anh, thiếu câu khen nghe rất lạnh.',
  },
  c101: {
    hook: 'Biến mệnh lệnh thành câu hỏi → người viết code không thấy bị dạy đời.',
    contrast: 'Mềm hơn "You should…" rất nhiều mà vẫn truyền đạt đúng ý.',
  },
  c102: {
    hook: 'Hỏi lý do trước khi kết luận sai. Rất nhiều lần lý do đó hợp lý và bạn mới là người thiếu thông tin.',
    pitfall: 'Thêm "Just curious" để câu hỏi không nghe như chất vấn.',
  },
  c103: {
    hook: '"bite us" = cắn lại chúng ta. Hình ảnh: con chó bạn nuôi hôm nay, mai nó cắn.',
    contrast: 'Dùng "us" chứ không phải "you" — chia sẻ trách nhiệm, không đổ lỗi.',
  },
  c104: {
    hook: 'Trao quyền từ chối ngay từ đầu → người nhận thoải mái và thường lại làm theo.',
  },
  c105: {
    hook: 'Hai chữ khen người phát hiện lỗi. Nói ra thì mất một giây, nhưng nhớ rất lâu.',
    pitfall: 'Khi ai đó tìm ra lỗi của BẠN, đây là câu nên nói. Đừng im lặng sửa.',
  },
  c106: {
    hook: 'Nhận lỗi và hành động ngay trong một câu. Không giải thích dài dòng.',
  },
  c107: {
    hook: '"scope" là phạm vi. Câu này bảo vệ bạn khỏi việc PR phình ra vô tận.',
    pitfall: 'Phải kèm cam kết "I\'ll open a ticket", nếu không nghe như đang trốn việc.',
  },
  c108: {
    hook: '"I\'d rather not" = tôi không muốn, nhẹ hơn "I won\'t" rất nhiều.',
    contrast: 'Kèm lý do ("it\'s fragile") thì lời từ chối trở nên hợp lý thay vì bướng.',
  },

  /* ---------------- họp & kế hoạch ---------------- */
  c110: {
    hook: '"circle back" = đi vòng rồi quay lại. Hoãn mà không bỏ.',
    pitfall: 'Phải nêu MỐC THỜI GIAN cụ thể, nếu không "circle back" đồng nghĩa với "quên luôn".',
  },
  c111: {
    hook: 'Câu ngắn để phá vỡ sự im lặng khi không ai muốn nhận việc.',
    contrast: 'Xung phong ngay sau đó ("I can if nobody else can") ghi điểm rất lớn.',
  },
  c112: {
    hook: '"Realistically" là từ khoá: bạn không bi quan, bạn đang thực tế.',
    pitfall: 'Phải kèm CON SỐ. Nói "that\'s too much" không có sức thuyết phục.',
  },
  c113: {
    hook: '"descope" = bỏ bớt khỏi phạm vi. Thuật ngữ chuẩn trong quản lý dự án.',
    contrast: 'Chuyên nghiệp hơn hẳn "can we skip that" — nó hàm ý có kế hoạch làm sau.',
  },
  c114: {
    hook: 'Câu hỏi cứu mạng khi bị giao quá nhiều việc: buộc người giao phải xếp thứ tự.',
    pitfall: 'Đưa hai lựa chọn ("speed or correctness") sẽ nhận được câu trả lời rõ hơn.',
  },
  c115: {
    hook: '"park" = đỗ xe lại. Chuyện vẫn còn đó, chỉ là để sang bên.',
    contrast: 'Ngắn hơn c110 và hợp để cắt một cuộc thảo luận đang lan man.',
  },
  c116: {
    hook: '"on the same page" = cùng một trang sách. Ai cũng đọc cùng nội dung.',
    pitfall: 'Dùng để TÓM TẮT lại thoả thuận cuối họp — đây là lúc nhiều hiểu nhầm bị phát hiện.',
  },
  c117: {
    hook: 'Câu kết thúc mọi cuộc họp. Không có bước tiếp theo thì buổi họp đó vô nghĩa.',
    contrast: 'Hỏi thêm "who owns them" là điểm khác biệt giữa người tham dự và người dẫn dắt.',
  },

  /* ---------------- sự cố, bug ---------------- */
  c120: {
    hook: 'Câu đùa kinh điển của giới lập trình. Nói ra là ai cũng cười và hiểu ngay.',
    pitfall: 'Đừng dừng ở đó — phải nói tiếp bạn định làm gì để tìm ra khác biệt môi trường.',
  },
  c121: {
    hook: '"reproduce" = tái tạo lại lỗi. Không tái hiện được thì không sửa được.',
    contrast: 'Kèm ngay yêu cầu "can you send the exact steps?" để cuộc trao đổi tiến lên.',
  },
  c122: {
    hook: '"intermittent" = lúc có lúc không, đứt quãng. Từ chuyên môn, dùng đúng gây ấn tượng.',
    pitfall: 'Nêu tần suất ("one in twenty") thì thông tin mới có giá trị.',
  },
  c123: {
    hook: '"narrow down" = thu hẹp lại. Hình dung phễu lọc dần dần.',
  },
  c124: {
    hook: '"roll back" = lăn ngược lại phiên bản cũ. Động từ chuẩn khi nói về triển khai.',
    pitfall: 'Quá khứ là "rolled back", không phải "rollbacked".',
  },
  c125: {
    hook: '"known issue" = lỗi đã biết. Ba chữ này giúp bạn khỏi bị trách.',
    contrast: 'Phải kèm "there\'s a ticket already", nếu không nghe như biết mà không làm gì.',
  },
  c126: {
    hook: '"root cause" = nguyên nhân gốc, không phải triệu chứng. Thuật ngữ vàng khi báo cáo sự cố.',
    pitfall: 'Đừng gọi triệu chứng là root cause — người có kinh nghiệm sẽ nhận ra ngay.',
  },
  c127: {
    hook: '"workaround" = cách đi vòng qua vấn đề, chưa giải quyết nó.',
    contrast: 'Phân biệt rõ workaround với fix là dấu hiệu của người làm việc trung thực.',
  },

  /* ---------------- nhờ vả ---------------- */
  c130: {
    hook: 'Câu xin phép ngắn nhất. Hỏi trước khi ngắt việc người khác là phép lịch sự cơ bản.',
    pitfall: 'Nhắn thẳng vấn đề mà không hỏi trước bị coi là thiếu tinh tế trong nhiều team.',
  },
  c131: {
    hook: '"give me a hand" = cho tôi mượn một bàn tay. Hình ảnh rất dễ nhớ.',
    contrast: 'Thân mật hơn "Could you help me" — dùng với đồng nghiệp ngang hàng.',
  },
  c132: {
    hook: '"Would you mind" nghĩa đen là "bạn có phiền không".',
    pitfall: 'BẪY LỚN: trả lời "Not at all" nghĩa là ĐỒNG Ý. Trả lời "Yes" là TỪ CHỐI. Ngược với trực giác.',
  },
  c133: {
    hook: 'Xin lỗi trước khi làm phiền — công thức an toàn với người bạn chưa thân.',
  },
  c134: {
    hook: '"a second pair of eyes" = đôi mắt thứ hai. Cách nhờ review mà không tỏ ra bí.',
    contrast: 'Nghe chủ động hơn "I\'m stuck" — bạn đang cẩn thận chứ không phải bất lực.',
  },
  c135: {
    hook: '"Any chance" = có cơ hội nào không. Cho người ta đường từ chối dễ dàng.',
    contrast: 'Lịch sự hơn "Can you…?" khi bạn nhờ việc gấp hoặc ngoài trách nhiệm của họ.',
  },

  /* ---------------- mua bán, dịch vụ ---------------- */
  c140: {
    hook: 'Mẫu gọi món chuẩn nhất. "I\'ll have" chứ không phải "I want".',
    pitfall: '"I want the coffee" nghe như ra lệnh. Người Việt dịch thẳng từ "tôi muốn" nên hay mắc.',
  },
  c141: {
    hook: 'Câu nhân viên hỏi, không phải câu bạn nói. Học để NGHE ra, và trả lời hai chữ.',
    contrast: 'Giọng Anh hay nói "Eat in or takeaway?" — cùng nghĩa, khác chữ.',
  },
  c142: {
    hook: 'Mẫu yêu cầu bỏ nguyên liệu. "without" là chìa khoá.',
    pitfall: 'Nếu do dị ứng thì phải nói rõ "I have an allergy" — nhà bếp sẽ xử lý nghiêm túc hơn hẳn.',
  },
  c143: {
    hook: 'Câu hỏi ngắn cứu bạn khỏi cảnh đứng ở quầy mà không có tiền mặt.',
    contrast: 'Giọng Mỹ hay nói "Do you take cards?" (số nhiều). Cả hai đều đúng.',
  },
  c144: {
    hook: 'Câu từ chối nhân viên bán hàng mà không mất lòng. Kèm nụ cười là đủ.',
    pitfall: 'Im lặng bỏ đi bị coi là bất lịch sự ở nhiều nước phương Tây.',
  },
  c145: {
    hook: 'Mẫu hỏi đổi cỡ. Thay "smaller" bằng "bigger/another colour" là dùng được khắp nơi.',
  },
  c146: {
    hook: '“I think” làm lời báo nhầm đơn nhẹ và lịch sự hơn việc quy lỗi thẳng cho nhân viên.',
    contrast: 'Nhẹ hơn “You got my order wrong” — nói vấn đề trước rồi nêu món bạn đã gọi.',
  },
  c147: {
    hook: 'Đưa ra HAI lựa chọn (hoàn tiền hoặc đổi) làm người ta dễ đồng ý hơn là đòi một thứ.',
    pitfall: 'Nêu lý do cụ thể và mốc thời gian trước khi đòi — yêu cầu sẽ mạnh hơn.',
  },
  c148: {
    hook: '"change" ở đây là tiền thừa, không phải sự thay đổi.',
    pitfall: 'Ở nhiều nước tiền tip là bắt buộc về mặt văn hoá — câu này thay cho việc tip riêng.',
  },

  /* ---------------- đi lại ---------------- */
  c150: {
    hook: 'Mẫu hỏi đường vạn năng. Ghép được với mọi địa điểm.',
    contrast: '"How do I get to X" hỏi cách đi. "Where is X" chỉ hỏi vị trí — thường ít hữu ích hơn.',
  },
  c151: {
    hook: '"platform" là sân ga. Hỏi trước khi lên tàu rẻ hơn nhiều so với đi nhầm.',
  },
  c152: {
    hook: '"check in" dùng chung cho cả khách sạn lẫn sân bay. Một cụm, hai tình huống.',
    pitfall: 'Viết liền "checkin" là danh từ, tách rời "check in" là động từ.',
  },
  c153: {
    hook: 'Câu hỏi ngắn nhất để xin chỗ ngồi. Dùng được ở tàu, quán, phòng chờ.',
  },
  c154: {
    hook: '"got delayed" ở thể bị động — chuyến bay bị hoãn, không phải bạn làm nó hoãn.',
    pitfall: 'Nói "My flight delayed" là sai ngữ pháp. Phải có "got" hoặc "was".',
  },
  c155: {
    hook: '"drop off" = thả xuống. Từ chuẩn khi đi taxi hay xe công nghệ.',
    contrast: '"Drop me off" (thả tôi xuống) khác "pick me up" (đón tôi). Cặp đôi cần thuộc.',
  },
  c156: {
    hook: 'Mẫu hỏi thời gian di chuyển. Thêm "by bus/by train" là ra phương tiện.',
  },

  /* ---------------- sức khoẻ ---------------- */
  c160: {
    hook: 'Thì hiện tại hoàn thành + "since" = bắt đầu từ lúc đó và vẫn còn tới giờ.',
    pitfall: 'Bác sĩ cần biết TỪ KHI NÀO. Nói "I have a headache" thiếu mất thông tin quan trọng nhất.',
  },
  c161: {
    hook: 'Cách nói khó ở nhẹ nhàng, dùng được cả trong công việc lẫn đời sống.',
    contrast: 'Nhẹ hơn "I\'m sick" — hợp khi bạn chỉ hơi mệt và vẫn làm việc được.',
  },
  c162: {
    hook: '"over the counter" = bán ngay trên quầy, không cần đơn.',
    pitfall: 'Cặp từ "prescription / over the counter" quyết định bạn mua được thuốc hay không.',
  },
  c163: {
    hook: 'Mẫu mô tả cơn đau theo HÀNH ĐỘNG gây ra nó — đúng thứ bác sĩ cần.',
    contrast: 'Cụ thể hơn hẳn "It hurts" trống không.',
  },
  c164: {
    hook: '"book an appointment" là cụm cố định. Không dùng "make a meeting" cho bác sĩ.',
  },

  /* ---------------- điện thoại, họp online ---------------- */
  c170: {
    hook: 'Câu mở đầu mọi cuộc gọi online. Kiểm tra âm thanh trước khi vào việc.',
  },
  c171: {
    hook: '"breaking up" = tiếng bị vỡ ra từng mảnh. Hình ảnh rất khớp với cảm giác thật.',
    contrast: 'Đây cũng là cái cớ hoàn hảo để xin nhắc lại khi bạn nghe không kịp.',
  },
  c172: {
    hook: 'Câu bạn sẽ nghe và nói hàng trăm lần trong đời làm remote.',
    pitfall: 'Nói "You are muted" cũng đúng, nhưng "I think you\'re on mute" nhẹ nhàng hơn.',
  },
  c173: {
    hook: 'Khi giải thích kỹ thuật bị bí từ, chia sẻ màn hình giải quyết được gần hết.',
  },
  c174: {
    hook: '"push by 15 minutes" = đẩy lùi 15 phút. Giới từ "by" chỉ độ dời.',
    pitfall: '"Push to 3pm" (dời tới 3 giờ) khác "push by 3 hours" (dời thêm 3 tiếng). Đừng lẫn.',
  },
  c175: {
    hook: '"drop the link" = thả cái link vào. Rất tự nhiên, dùng khắp nơi trong tech.',
  },

  /* ---------------- kết thúc ---------------- */
  c180: {
    hook: '"Anyway" báo hiệu chuyển sang kết thúc. Người bản xứ nghe là hiểu ngay.',
    pitfall: 'Người Việt hay im lặng rồi bỏ đi. Phải có câu báo hiệu, nếu không bị coi là bất lịch sự.',
  },
  c181: {
    hook: '"catch up" = bắt kịp tin tức của nhau. Dùng khi gặp lại người quen.',
    contrast: 'Với người mới quen thì dùng "It was nice meeting you" thay vì "catching up".',
  },
  c182: {
    hook: '"touch base" mượn từ bóng chày: chạm vào chốt rồi đi tiếp. Liên lạc ngắn, không phải họp dài.',
  },
  c183: {
    hook: '"let you go" = thả bạn đi. Cách kết thúc cuộc gọi mà đặt sự bận rộn về phía họ, rất tinh tế.',
    contrast: 'Lịch sự hơn c180 vì nó quan tâm tới thời gian của người kia.',
  },
  c184: {
    hook: 'Cảm ơn hai tầng: "thanks" + "I appreciate it". Tầng hai mới là tầng thật lòng.',
    pitfall: 'Nói cụ thể họ đã giúp gì ("you saved me hours") làm lời cảm ơn có sức nặng gấp đôi.',
  },
  c185: {
    hook: 'Lời tạm biệt ngắn nhất mà vẫn ấm. Hai chữ, dùng được mọi lúc.',
  },

  /* ---------------- nói bựa: xả bực ---------------- */
  c186: {
    hook: 'Nghĩa đen: "vì lợi ích của sự giao hợp" — vô nghĩa hoàn toàn. Đó chính là điểm: nó là tiếng kêu, không phải câu có nghĩa.',
    pitfall: 'Đừng cố dịch từng chữ rồi ghép lại. Học nguyên khối như học một tiếng thở dài.',
    contrast: 'Bản sạch cùng nhịp: "oh for goodness\' sake", "oh for crying out loud". Nhịp y hệt, độ nóng bằng không.',
  },
  c187: {
    hook: 'Cái gì làm bạn phải cúi xuống nhặt đi nhặt lại thì nó đau chỗ đó. Hình ảnh rất dễ nhớ.',
    contrast: 'Thang giảm dần: pain in the ass (2) → pain in the backside (1) → pain in the neck (0, họp nói được).',
  },
  c188: {
    hook: '"a load of" = cả một xe tải. Người Anh đo sự nhảm nhí bằng đơn vị chuyên chở.',
    contrast: 'Cùng khuôn, tăng dần: a load of crap → a load of rubbish (Anh, sạch) → a load of bullshit → a load of bollocks.',
  },
  c189: {
    hook: '"done with X" = xong với X, không còn dính dáng nữa. Thêm "so fucking" là đẩy nó thành lời tuyên bố.',
    pitfall: 'Khác hẳn "I\'m done" (= tôi làm xong rồi). Có "with" là bỏ cuộc, không có "with" là hoàn thành.',
  },
  c190: {
    hook: 'Nghĩa đen là phân bò. Người bản xứ dùng nó cho MỌI thứ vô lý, không riêng lời nói dối.',
    pitfall: 'Người Việt hay nói "you are bullshit" — sai. Phải là "that\'s bullshit" (việc) hoặc "you\'re full of shit" (người).',
  },
  c191: {
    hook: 'Cụm bựa an toàn nhất để tập đầu tiên. Nói được ở gần như mọi chỗ mà vẫn ra đúng cảm xúc.',
    contrast: '"Damn it" là bực. "Damn" đứng một mình trước tính từ lại là khen: "damn good".',
  },
  c192: {
    hook: 'Nói về đồ vật thì "piece of shit" = rác rưởi. Đây là câu chửi đồ vật phổ biến nhất tiếng Anh.',
    pitfall: 'Tuyệt đối không dùng cho người. Với đồ vật là bực bội; với người là xúc phạm nhân phẩm.',
  },
  c193: {
    hook: 'Sạch hoàn toàn mà cảm xúc không kém gì câu bậy. Đây là cụm để dành cho lúc có mặt sếp.',
    contrast: 'Cùng nghĩa: "I\'m at my wit\'s end", "I\'m about to lose it".',
  },
  c194: {
    hook: 'Chữ "right now" mới là chỗ mang cảm xúc — nó nói "ngay lúc này, trong tình huống này, mà ông đùa được à".',
    pitfall: 'Bỏ "right now" đi thì câu thành ngạc nhiên bình thường, mất hết sức nặng.',
  },
  c195: {
    hook: '"nuts" = hạt, cũng có nghĩa điên. "Drive someone nuts" = lái ai đó tới chỗ điên.',
    contrast: 'Cùng khuôn: drive me crazy / drive me up the wall / drive me round the bend (Anh).',
  },
  c196: {
    hook: 'Hai từ bậy đứng cạnh nhau. Đây gần như là mức trần của bực bội thường ngày.',
    pitfall: 'Nói ra là kết thúc cuộc trò chuyện, không phải mở đầu. Người nghe hiểu bạn đang bỏ đi.',
  },
  c197: {
    hook: 'Khuôn "what the ___ is going on" là bộ khung, còn chỗ trống là nơi bạn chọn độ nóng: heck (0) → hell (1) → fuck (3).',
    pitfall: 'Người Việt hay chỉ học một mức rồi dùng ở mọi chỗ. Học cả cái khung mới là học đúng.',
  },
  c198: {
    hook: '"arsed" = buồn động vào. Câu này thú nhận sự lười một cách rất thẳng thắn.',
    contrast: 'Bản Mỹ "I can\'t be bothered" sạch hơn hẳn và dùng được toàn cầu.',
  },

  /* ---------------- nói bựa: cà khịa ---------------- */
  c199: {
    hook: '"Legend" ở đây không phải huyền thoại lịch sử — nó là người vừa làm một chuyện tử tế cho bạn.',
    pitfall: 'Người Việt hay tưởng đây là khen quá lời nên ngại nói. Thực tế nó rất thường ngày, gần như "cảm ơn ông nhiều".',
  },
  c200: {
    hook: 'Toàn bộ nghĩa nằm ở giọng, không nằm ở chữ. Cười = thân; mặt lạnh = gây sự.',
    pitfall: 'Đây là câu người Việt dễ dùng sai nhất trong cả nhóm. Nghe người bản xứ nói với NHAU vài chục lần trước khi tự nói.',
  },
  c201: {
    hook: '"Shut up" ở đây không phải bắt im — nó là "thôi đi ông", giống hệt tiếng Việt.',
    contrast: '"Shut up!" nói giọng cao và vui còn có nghĩa "thật á?!" — ngạc nhiên thích thú, không hề đuổi ai.',
  },
  c202: {
    hook: 'Ghen tị mà phục. Câu này nói khi bạn của bạn vừa làm được điều bạn ước mình làm được.',
    pitfall: 'Đừng mang sang Mỹ. Ở Anh/Úc là đùa, ở Mỹ nó gần với lời chửi thật.',
  },
  c203: {
    hook: 'Nghĩa đen "đái đi" — hình ảnh vô lý, nên nhớ rất nhanh.',
    contrast: 'Cùng thang: "get lost" (0) → "piss off" (2) → "fuck off" (3). Ba mức của cùng một ý.',
  },
  c204: {
    hook: 'Đây là cách nói "ông xạo" mà nhắm vào NGƯỜI, khác với "that\'s bullshit" nhắm vào việc.',
    contrast: 'Bản sạch: "you\'re making that up", "you\'re having me on" (Anh).',
  },
  c205: {
    hook: 'Nói về người đó bằng ngôi thứ ba dù họ đang đứng trước mặt — chính sự cố ý đó tạo ra tiếng cười.',
    pitfall: 'Cần có người thứ ba nghe cùng thì mới trọn. Nói khi chỉ có hai người nghe sẽ hơi lạc.',
  },
  c206: {
    hook: 'Khuôn "don\'t be a ___" gắn được nhiều từ: don\'t be a jerk / an ass / a prick. Cùng một ý trách móc.',
    pitfall: 'Dù giọng nhẹ đây vẫn là lời trách thật, không phải trêu. Đừng nhầm nó với nhóm đùa.',
  },
  c207: {
    hook: 'Muppet là con rối trong chương trình thiếu nhi — gọi ai đó là con rối vụng về, thương nhiều hơn giận.',
    contrast: 'Cùng họ Anh, tăng dần: muppet (1) → plonker → wally → pillock.',
  },
  c208: {
    hook: 'Khen ngược. Càng dùng từ cao ("genius", "champ", "Einstein") thì mỉa càng đau.',
    pitfall: 'Ngữ điệu quyết định tất cả: "genius" phải hạ giọng và kéo dài. Nói giọng phẳng là thành khen thật.',
  },
  c209: {
    hook: '"Nice try" = cố gắng ghê, nhưng tôi bắt bài rồi. Luôn nói sau khi ai đó vừa thất bại trong việc lừa bạn.',
  },
  c210: {
    hook: 'Viết sai chính tả cố ý là cả nửa cái duyên của từ này — nó báo hiệu "tôi đang đùa kiểu internet".',
    pitfall: 'Chỉ sống trong game và chat. Nói ngoài đời với người không chơi game sẽ không ai hiểu.',
  },
  c211: {
    hook: '"Destroyed" trong thể thao và game = thua đậm tới mức không có gì để bàn.',
    contrast: 'Cùng họ và cùng nghĩa: got cooked, got smoked, got bodied, got clapped.',
  },

  /* ---------------- nói bựa: nhấn mạnh ---------------- */
  c212: {
    hook: 'Đây là bài học quan trọng nhất cả nhóm: "fucking" KHÔNG mang nghĩa xấu. Nó chỉ là chữ "rất" bật to hết cỡ.',
    pitfall: 'Nghe câu này đừng tưởng người ta đang chê. Nghĩa của cả câu do tính từ quyết định, không do từ bậy.',
    contrast: 'So sánh: "it\'s fucking brilliant" (khen hết lời) vs "it\'s fucking broken" (chê). Cùng một từ, hai hướng.',
  },
  c213: {
    hook: 'Tiếng Anh cho phép chèn nguyên một từ vào GIỮA từ khác. Tiếng Việt không có chuyện đó — nên nó đáng học.',
    pitfall: 'Chỗ chèn không tuỳ ý: luôn ngay trước âm tiết mang trọng âm. abso-fucking-LUTELY đúng, ab-fucking-solutely sai và nghe rất giả.',
    contrast: 'Cùng khuôn: un-fucking-believable, in-fucking-credible, guaran-damn-tee.',
  },
  c214: {
    hook: 'Khuôn "từ để hỏi + the fuck" áp được cho cả họ: what/who/where/when/why/how the fuck.',
    pitfall: 'Chỉ có ở câu hỏi. Không ai nói "I the fuck went home".',
    contrast: 'Thang độ nóng của cùng khuôn: what on earth (0) → what the heck (0) → what the hell (1) → what the fuck (3).',
  },
  c215: {
    hook: '"Damn" đứng trước tính từ là bộ khuếch đại nhẹ nhất, và là chỗ an toàn nhất để bắt đầu tập nhóm này.',
    contrast: 'Thang khuếch đại: very (0) → really (0) → damn (1) → bloody (1, Anh) → fucking (3).',
  },
  c216: {
    hook: 'Khuôn "tính từ + as hell" gắn được vào bất cứ tính từ nào. Học một khuôn, dùng được trăm câu.',
    contrast: 'Bản sạch cùng khuôn: "as anything", "as can be". Bản mạnh: "as fuck" (viết tắt AF trong chat).',
  },
  c217: {
    hook: '"a hell of a" là bộ khuếch đại đứng trước DANH TỪ, khác với "as hell" đứng sau tính từ.',
    pitfall: 'Nó khen hay chê là do danh từ: "a hell of a developer" (khen) vs "a hell of a mess" (chê).',
  },
  c218: {
    hook: 'Có chữ "ass" nhưng đã đi vào ngôn ngữ quảng cáo — độ nóng gần như bằng không dù nhìn chữ thì tưởng nặng.',
    pitfall: 'Bài học rộng hơn: nhìn mặt chữ đoán độ nóng là sai. Phải xem thói quen dùng thật.',
  },
  c219: {
    hook: 'Lóng thế hệ trẻ, gắn với nhạc và game. Nó khen cường độ, không khen sự tinh tế.',
    contrast: 'Cùng lứa: "that\'s fire", "it slaps", "no cap" (= không nói điêu).',
  },
  c220: {
    hook: '"Dead" = hoàn toàn, tuyệt đối. Chẳng liên quan gì tới cái chết.',
    contrast: 'Cùng khuôn: dead easy, dead wrong, dead tired, dead ahead.',
  },
  c221: {
    hook: 'Cách khuếch đại mạnh nhất mà vẫn sạch — nói được cả trong họp có khách hàng.',
    contrast: 'Cùng họ sạch: ridiculously good, absurdly fast, stupidly cheap.',
  },

  /* ---------------- nói bựa: dẹp đi ---------------- */
  c222: {
    hook: '"Screw" là bản đã hạ nhiệt của "fuck", dùng được ở chỗ làm mà vẫn giữ nguyên chất buông xuôi.',
    contrast: 'Cả họ đều có cặp song sinh: screw it / fuck it, screw you / fuck you, screwed / fucked.',
  },
  c223: {
    hook: 'Không phải giận — là "thôi không nghĩ nữa". Đây là câu của 2 giờ sáng, không phải câu của cuộc cãi vã.',
    pitfall: 'Người Việt hay tưởng mọi câu có f-word đều là giận dữ. Câu này thật ra khá thoải mái.',
  },
  c224: {
    hook: 'Câu hỏi tu từ, không chờ trả lời. Nó tuyên bố "chuyện này không đáng bàn".',
    pitfall: 'Nếu chuyện đó là của chính người đang nghe, câu này phủ nhận luôn cảm xúc của họ. Rất dễ làm tổn thương.',
  },
  c225: {
    hook: 'Nghĩa đen: tôi không thể cho đi ít hơn được nữa — vì tôi đang cho đi con số không.',
    pitfall: 'Người Mỹ nói "I could care less", sai logic hoàn toàn mà vẫn cùng nghĩa. Nghe thấy thì đừng sửa lưng họ, đó là thói quen đã đóng băng.',
    contrast: 'Thang: I don\'t care (0) → I couldn\'t care less (0) → I don\'t give a damn (1) → a shit (2) → a fuck (3).',
  },
  c226: {
    hook: 'Sạch tuyệt đối mà lại là câu dễ mất lòng nhất nhóm — vì nó nói "tôi không buồn tranh luận với ông nữa".',
    pitfall: 'Đừng tưởng không có từ bậy thì an toàn. Độ sát thương nằm ở thái độ, không ở từ ngữ.',
  },
  c227: {
    hook: 'Khuôn lạ nhưng cực dễ dùng: lặp lại chính chữ của người kia rồi gắn "my ass" vào sau.',
    pitfall: 'Phải lặp lại chữ của họ thì mới ra. Nói trống không "my ass" thì người nghe không hiểu bạn bác bỏ cái gì.',
  },
  c228: {
    hook: 'Hai chữ này chứa cả hai nghĩa trái ngược. Ngữ điệu là thứ duy nhất phân biệt.',
    pitfall: 'Người Việt nghe ra "ừ đúng rồi" trong khi người ta đang nói "tin ông mới lạ". Nghe kỹ chỗ hạ giọng ở "right".',
  },
  c229: {
    hook: 'Nghĩa đen: thả nó xuống. Đây là lời yêu cầu dừng thật sự, không phải gợi ý.',
    pitfall: 'Nói tiếp sau câu này là leo thang. Nhận ra nó là biết lúc nào nên dừng.',
  },
  c230: {
    hook: 'Bản lịch sự nhất của cả nhóm — bỏ qua mà không coi thường ai.',
    contrast: 'Thang: forget it (0) → never mind (0) → whatever (0 nhưng lạnh) → screw it (2) → fuck it (3).',
  },

  /* ---------------- nói bựa: sốc ---------------- */
  c231: {
    hook: '"Holy + từ bậy" là khuôn kinh ngạc phổ biến nhất tiếng Anh. Trung tính — vui hay sợ đều dùng được.',
    contrast: 'Cả họ, từ sạch tới nóng: holy cow / holy moly / holy smokes (0) → holy crap (1) → holy shit (2).',
  },
  c232: {
    hook: 'Chèn "fucking" vào giữa cụm "no way" có sẵn. Bỏ nó ra là được câu sạch dùng mọi nơi.',
    pitfall: 'Đây là mẫu chung: rất nhiều câu bậy chỉ là câu sạch bị chèn thêm một từ. Học câu sạch trước, chèn sau.',
  },
  c233: {
    hook: 'Chèn "actual" để nâng WTF lên một nấc: không chỉ ngạc nhiên mà là hoàn toàn không hiểu nổi.',
    pitfall: 'Đứng ở gần đỉnh thang. Dùng bừa vài lần là mất hết sức nặng.',
  },
  c234: {
    hook: '"Minced oath" — câu bậy bị bẻ cho sạch, giữ nguyên nhịp và độ bất ngờ. Người ta cố tình nói trước mặt trẻ con.',
    contrast: 'Cả họ: sugar (thay shit), shoot, fudge, frick, darn, gosh, "what the fudge".',
  },
  c235: {
    hook: 'Phản ứng chuẩn với tin xấu bất ngờ. Sạch hoàn toàn, dùng được cả trong họp.',
    pitfall: 'Dạng nói thật nuốt gần hết: "you gotta be kiddin\' me". Nghe không ra là vì bạn đang chờ dạng viết.',
  },
  c236: {
    hook: 'Không tục nhưng báng bổ. Đây là loại "nặng" thứ hai mà thang độ tục không đo được.',
    pitfall: 'Với người sùng đạo, câu này nặng hơn cả "shit". Ở Mỹ nhiều vùng đây là ranh giới thật — đừng đoán bừa.',
    contrast: 'Bản đã bẻ cho nhẹ: "jeez", "gee", "cripes", "jeepers".',
  },
  c237: {
    hook: 'Bản mức 1 của "holy shit". Cùng nhịp, cùng cảm xúc, đi đâu cũng nói được.',
  },

  /* ---------------- nói bựa: phản đối, đồng tình ---------------- */
  c238: {
    hook: 'Từ Anh đặc trưng nhất trong nhóm. Nghe thấy nó là biết ngay người nói không phải người Mỹ.',
    pitfall: 'Cái bẫy: "bollocks" = nhảm nhí, nhưng "the dog\'s bollocks" lại là khen hết cỡ. Thêm hai chữ, đảo ngược nghĩa.',
  },
  c239: {
    hook: '"Give me that ___" = đừng đem thứ đó tới đây. Khuôn dùng được với nhiều danh từ: that excuse, that attitude.',
    pitfall: 'Đây là đối đầu thật, không phải trêu. Chỉ dùng khi bạn đã quyết định gây sự.',
  },
  c240: {
    hook: 'Bỏ đúng một chữ "fucking" là câu này thành lời phản biện dùng được trong họp. Cả nhóm này hoạt động như vậy.',
  },
  c241: {
    hook: 'Chữ CUỐI quyết định nghĩa. "Yeah no" = không. "No yeah" = có. Chữ đầu chỉ là ghi nhận rằng đã nghe.',
    pitfall: 'Ngược hoàn toàn với trực giác tiếng Việt. Người Việt nghe "yeah" là tưởng đồng ý rồi bỏ qua chữ sau.',
    contrast: 'Còn có "yeah no for sure" = đồng ý mạnh. Đếm chữ cuối, đừng đếm chữ đầu.',
  },
  c242: {
    hook: 'Hai chữ, thách thức nguồn tin thay vì thách thức người nói. Nhẹ hơn hẳn việc cãi thẳng.',
  },
  c243: {
    hook: 'Khuôn "like hell + mệnh đề" = phủ định mạnh. Nghĩa ngược hẳn với vẻ ngoài khẳng định của nó.',
    pitfall: 'Nghe "like hell you did" đừng hiểu là "ông làm giống địa ngục". Nó có nghĩa "làm gì có chuyện đó".',
  },
  c244: {
    hook: 'Đồng tình pha tự hào. Hay dùng để tự nhận về mình: "Damn right I did."',
    contrast: 'Thang đồng tình: absolutely (0) → damn right (1) → hell yes (1) → fuck yeah (3).',
  },
  c245: {
    hook: 'Vui sướng thuần tuý, không có chút ý xấu nào. Đây là bằng chứng rõ nhất rằng f-word không đồng nghĩa với giận dữ.',
  },
  c246: {
    hook: '"Count me in" = tính tôi một suất. Ghép với "hell yes" thành lời nhận lời nhiệt tình nhất mà vẫn nhẹ.',
    contrast: '"Hell no" là bản phủ định, cũng chỉ mức 1.',
  },
  c247: {
    hook: '"Too right" là cụm Anh/Úc nghĩa "quá đúng". Chèn "fucking" vào giữa để đẩy lên đỉnh.',
    pitfall: 'Nói giọng Mỹ nghe như đang diễn. Cụm này gắn chặt với vùng miền hơn hầu hết cụm khác.',
  },

  /* ---------------- nói bựa: hỏng việc ---------------- */
  c248: {
    hook: '"Fucked" (tính từ) = hỏng tới mức không cứu được. Khác hẳn động từ "to fuck".',
    pitfall: 'Trong chat dev thì bình thường tới mức không ai để ý. Trong email hoặc họp có khách thì tuyệt đối không — email tồn tại mãi mãi.',
    contrast: 'Bản sạch cùng nghĩa: broken, borked, toast, hosed, busted.',
  },
  c249: {
    hook: 'Thành ngữ, đừng dịch từng chữ. Nó nhấn vào chuyện hỏng ĐÚNG LÚC tệ nhất, không chỉ là hỏng.',
    contrast: 'Cùng ý: "it went belly up", "it fell over", "it died on us".',
  },
  c250: {
    hook: 'Câu hỏi tu từ của mọi lập trình viên. Không ai thật sự chờ câu trả lời.',
    pitfall: 'Hai cái bẫy: rất hay là chính bạn viết ba tháng trước, và nếu tác giả đang ngồi cùng phòng thì nó thành xúc phạm.',
  },
  c251: {
    hook: 'Hình ảnh: thùng rác đang cháy. Không một từ bậy nào mà chê rất nặng — dùng được trong họp nội bộ.',
    contrast: 'Cùng họ sạch: "a hot mess", "spaghetti code", "held together with duct tape".',
  },
  c252: {
    hook: 'Hai chữ, nhận lỗi xong, đi tiếp. Người Việt hay xin lỗi dài dòng ở đúng chỗ người bản xứ chỉ nói "my bad".',
    pitfall: 'Chỉ dùng cho lỗi NHỎ. Lỗi lớn mà nói "my bad" thì nghe như không coi trọng hậu quả.',
  },
  c253: {
    hook: 'Nghịch lý đáng nhớ: tự nhận lỗi bằng từ nặng lại được đánh giá là thẳng thắn và có trách nhiệm.',
    contrast: 'Chọn theo người nghe: "my bad" (lỗi nhỏ) → "I screwed up" (với sếp) → "I fucked up" (trong nhóm thân).',
  },
  c254: {
    hook: '"Big time" = ở quy mô lớn. Nó là bộ khuếch đại đứng sau động từ, và hoàn toàn sạch.',
    contrast: 'Cùng khuôn: "I owe you big time", "he messed up big time".',
  },
  c255: {
    hook: 'Từ lóng của dân máy tính, sạch tuyệt đối — nói trong họp cũng không ai nhíu mày.',
  },

  /* ---------------- nói bựa: nhậu, mệt ---------------- */
  c256: {
    hook: 'Rất Anh, hoàn toàn sạch, và mạnh hơn "tired" nhiều. Đây là mức "rã rời", không phải "hơi mệt".',
    contrast: 'Bản Mỹ: "I\'m beat", "I\'m wiped", "I\'m running on fumes".',
  },
  c257: {
    hook: '"Wasted" = bị phá huỷ. Người bản xứ mô tả cơn say bằng những từ chỉ sự đổ vỡ.',
    pitfall: 'Cái bẫy Anh–Mỹ nguy hiểm nhất: "pissed" ở Anh là SAY, ở Mỹ là CÁU. Nghe sai là hiểu ngược hoàn toàn.',
    contrast: 'Cùng họ: hammered, smashed, plastered, trashed, off my face (Úc).',
  },
  c258: {
    hook: 'Rủ rê chứ không phải mô tả. Nói câu này là đang đề nghị một buổi tối mất kiểm soát.',
    contrast: 'Bản sạch để rủ: "let\'s get a few drinks in", "fancy a couple of pints?".',
  },
  c259: {
    hook: 'Khuôn "dying for + danh từ" dùng cho mọi cơn thèm. Không liên quan gì tới cái chết.',
    contrast: 'Cùng nghĩa: "I could murder a beer" (rất Anh, nghe dữ mà hoàn toàn vô hại).',
  },
  c260: {
    hook: '"Pint" là đơn vị đo bia của Anh, và cũng là lời mời đi chơi. Rủ pint = rủ ngồi nói chuyện.',
    pitfall: '"Grab" là động từ vạn năng cho mọi lời rủ: grab lunch, grab a coffee, grab a seat, grab a bite.',
  },
  c261: {
    hook: '"Dead" tả nơi chốn = vắng, không có không khí. Chẳng liên quan gì tới cái chết.',
    contrast: 'Ngược lại: "this place is buzzing / packed / heaving" (Anh).',
  },
};
