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
    hook: '"argue" ở đây không phải cãi nhau — nó là "lập luận rằng". Dấu hiệu bạn có lý lẽ đằng sau.',
    pitfall: 'Phải có lý do theo sau. Nói "I\'d argue that…" rồi không giải thích là mất uy tín.',
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
    hook: 'Câu thoát hiểm khi tranh luận đã đi vòng tròn. Giữ được quan hệ, kết thúc được cuộc cãi.',
    pitfall: 'Đừng dùng quá sớm — nói ra là coi như đóng cửa thảo luận.',
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
    hook: '"mix-up" = sự lẫn lộn. Danh từ này đổ lỗi cho tình huống, không cho người.',
    contrast: 'Nhẹ hơn "You made a mistake" rất nhiều — nhân viên sẽ hợp tác hơn hẳn.',
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
};
