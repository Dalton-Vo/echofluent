import { useCallback, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { blobToBase64, toWav, type Recording } from '@/lib/audio';
import {
  AiFailure,
  aiErrorText,
  isAiReady,
  reviewPronunciation,
  transcribeAudio,
  type PronunciationReport,
} from '@/lib/gemini';

/* ============================================================================
 *  Cầu nối giữa bản ghi âm và phần chấm phát âm bằng AI.
 *
 *  Gói trọn ba việc lặt vặt mà mọi màn hình đều cần: đổi bản ghi sang WAV,
 *  gọi Gemini, và giữ trạng thái đang-chạy / lỗi để giao diện khỏi tự lo.
 * ========================================================================== */

export function useAiCoach() {
  const ai = useStore((s) => s.ai);
  const [report, setReport] = useState<PronunciationReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Tăng mỗi lần gọi — kết quả của lần gọi cũ về muộn sẽ bị bỏ qua */
  const runId = useRef(0);

  const ready = ai.enabled && isAiReady(ai);

  const reset = useCallback(() => {
    runId.current += 1;
    setReport(null);
    setError(null);
    setBusy(false);
  }, []);

  /** Chấm một bản ghi âm. `target` là câu mẫu; để trống thì chấm tự do. */
  const review = useCallback(
    async (recording: Recording | null, target: string): Promise<PronunciationReport | null> => {
      if (!ready) {
        setError(aiErrorText('chua_cau_hinh'));
        return null;
      }
      if (!recording) {
        setError(aiErrorText('khong_co_audio'));
        return null;
      }

      const id = ++runId.current;
      setBusy(true);
      setError(null);
      setReport(null);

      try {
        const wav = await toWav(recording.blob);
        const b64 = await blobToBase64(wav);
        const r = await reviewPronunciation(ai, b64, 'audio/wav', target);
        // Người dùng đã bấm sang câu khác thì kết quả này không còn nghĩa lý gì.
        if (id !== runId.current) return null;
        setReport(r);
        return r;
      } catch (e) {
        if (id !== runId.current) return null;
        setError(e instanceof AiFailure ? aiErrorText(e.code) : aiErrorText('mang_loi'));
        return null;
      } finally {
        if (id === runId.current) setBusy(false);
      }
    },
    [ai, ready],
  );

  /**
   * Nhờ AI chép lời thành chữ.
   * Dùng khi trình duyệt không có sẵn nhận diện giọng nói (Firefox chẳng hạn).
   */
  const transcribe = useCallback(
    async (recording: Recording | null): Promise<string> => {
      if (!ready || !recording) return '';
      try {
        const wav = await toWav(recording.blob);
        return await transcribeAudio(ai, await blobToBase64(wav), 'audio/wav');
      } catch {
        return '';
      }
    },
    [ai, ready],
  );

  return { ready, report, busy, error, review, transcribe, reset };
}
