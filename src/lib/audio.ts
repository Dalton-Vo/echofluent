/* ============================================================================
 *  Micro — xin quyền, đo mức âm, ghi âm
 * ============================================================================
 *
 *  Vì sao cần file này: `SpeechRecognition` của trình duyệt tự xin quyền micro
 *  ngầm bên trong nó. Khi quyền bị chặn, nó chỉ ném ra một sự kiện lỗi khô khan
 *  và người dùng không hề biết chuyện gì vừa xảy ra — nút bấm im lìm, tưởng app
 *  hỏng. Ở đây ta chủ động mở micro bằng `getUserMedia` trước, nên:
 *
 *    1. Hộp thoại xin quyền hiện ra đúng lúc người dùng bấm nút (cử chỉ thật).
 *    2. Phân biệt được rõ "bị chặn" / "không có micro" / "chưa hỏi".
 *    3. Đo được mức âm thanh vào → vẽ vòng sáng để người dùng THẤY là micro
 *       đang ăn tiếng mình. Đây là thứ duy nhất trả lời được câu hỏi
 *       "sao bấm micro mà không thu được?".
 *    4. Ghi lại được audio thật để gửi cho AI chấm phát âm.
 * ========================================================================== */

export type MicPermission = 'granted' | 'denied' | 'prompt' | 'unavailable';

export function isMicApiSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

export function isRecorderSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined';
}

/**
 * Hỏi trạng thái quyền micro mà KHÔNG bật micro lên.
 * Dùng để quyết định có được phép tự bật micro hay không: chỉ khi quyền đã
 * 'granted' từ trước thì tự bật mới không làm trình duyệt chặn.
 */
export async function queryMicPermission(): Promise<MicPermission> {
  if (!isMicApiSupported()) return 'unavailable';
  // Safari cũ chưa có Permissions API cho microphone → coi như chưa hỏi.
  if (!navigator.permissions?.query) return 'prompt';
  try {
    const st = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return st.state as MicPermission;
  } catch {
    return 'prompt';
  }
}

/* ------------------------------ luồng micro ------------------------------ */

let sharedStream: MediaStream | null = null;
let openPromise: Promise<MediaStream> | null = null;
let openedDevice: string | undefined;

export interface MicDevice {
  id: string;
  label: string;
}

/**
 * Liệt kê các thiết bị thu có trên máy.
 *
 * Nhãn thiết bị chỉ hiện ra SAU khi quyền micro đã được cấp — trước đó trình
 * duyệt trả về chuỗi rỗng để tránh lộ danh tính máy. Nên hàm này chỉ dùng được
 * sau khi đã gọi openMic() ít nhất một lần.
 */
export async function listMicrophones(): Promise<MicDevice[]> {
  if (!isMicApiSupported() || !navigator.mediaDevices.enumerateDevices) return [];
  try {
    const all = await navigator.mediaDevices.enumerateDevices();
    return all
      .filter((d) => d.kind === 'audioinput')
      .map((d, i) => ({ id: d.deviceId, label: d.label || `Micro ${i + 1}` }));
  } catch {
    return [];
  }
}

/**
 * Mở micro và giữ lại dùng chung. Giữ luồng thay vì mở/đóng liên tục vì mỗi
 * lần `getUserMedia` mất 100–300ms — đủ để nuốt mất mấy chữ đầu của câu, mà
 * đúng mấy chữ đầu mới là thứ bài luyện phản xạ cần đo.
 */
export async function openMic(deviceId?: string): Promise<MediaStream> {
  const live = sharedStream?.getAudioTracks().some((t) => t.readyState === 'live');
  // Đổi thiết bị thì phải mở lại — luồng cũ vẫn gắn với micro cũ.
  if (live && openedDevice === deviceId) return sharedStream as MediaStream;
  if (live && openedDevice !== deviceId) closeMic();
  if (openPromise) return openPromise;

  openPromise = navigator.mediaDevices
    .getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // `exact` chứ không phải giá trị gợi ý: chọn nhầm thiết bị mà trình
        // duyệt lặng lẽ dùng cái khác thì người dùng chỉnh mãi không thấy đổi.
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      },
    })
    .then((s) => {
      sharedStream = s;
      openedDevice = deviceId;
      openPromise = null;
      return s;
    })
    .catch((e) => {
      openPromise = null;
      throw e;
    });

  return openPromise;
}

/** Tên thiết bị đang thu — hiện lên để người dùng biết mình đang nói vào đâu */
export function activeMicLabel(): string {
  return sharedStream?.getAudioTracks()[0]?.label ?? '';
}

/** Tắt micro, trả đèn báo thu âm của trình duyệt về trạng thái tắt */
export function closeMic(): void {
  sharedStream?.getTracks().forEach((t) => t.stop());
  sharedStream = null;
  openedDevice = undefined;
}

/** Dịch lỗi của getUserMedia sang trạng thái app hiểu được */
export function readMicError(err: unknown): MicPermission {
  const name = (err as { name?: string } | null)?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'unavailable';
  return 'denied';
}

/* --------------------------- đo mức âm thanh vào --------------------------- */

export interface LevelMeter {
  /** 0 → 1, đã làm mượt để không giật */
  level(): number;
  stop(): void;
}

/**
 * Vẽ mức âm thanh theo RMS. Trả về hàm đọc chứ không phải callback để phía
 * React tự chọn nhịp đọc (requestAnimationFrame), khỏi ép re-render 60 lần/giây.
 */
export function createLevelMeter(stream: MediaStream): LevelMeter {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();

  /* AudioContext sinh ra ở trạng thái 'suspended' khi không được tạo ngay
   * trong một cú bấm của người dùng — và khi bị treo như vậy thì
   * getFloatTimeDomainData trả về TOÀN SỐ 0, mãi mãi, không hề báo lỗi.
   * Kết quả: vạch mức âm chết cứng đúng lúc micro vẫn đang thu bình thường,
   * app lại còn hiện "chưa nghe thấy gì" khiến người dùng tưởng micro hỏng.
   * Không có dòng resume() này thì cả phần đo âm lượng vô dụng ở đường tự
   * bật micro (lúc đó chắc chắn không có cú bấm nào đi kèm). */
  void ctx.resume().catch(() => {});

  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.7;
  src.connect(analyser);

  /* Safari không bơm dữ liệu qua MediaStreamAudioSourceNode nếu đồ thị âm
   * thanh không dẫn tới đầu ra. Nhánh treo lơ lửng bị coi là vô dụng và
   * WebKit ngừng xử lý — analyser vẫn trả về mảng 0 y như lúc context bị
   * treo, lại cũng không báo lỗi gì. Nên phải nối tiếp tới loa, nhưng qua
   * một nút khuếch đại đặt bằng 0 để không ai nghe thấy gì: đồ thị "sống"
   * mà tai người thì im lặng. Thiếu đoạn này thì trên Safari vạch mức âm
   * chết cứng dù micro vẫn thu tốt. */
  const mute = ctx.createGain();
  mute.gain.value = 0;
  analyser.connect(mute);
  mute.connect(ctx.destination);

  const buf = new Float32Array(analyser.fftSize);
  let smooth = 0;
  let stopped = false;

  return {
    level() {
      if (stopped) return 0;
      // Trình duyệt có thể treo lại context khi cửa sổ mất tiêu điểm.
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 1) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      // Giọng nói thường nằm quanh RMS 0.02–0.2 → kéo giãn cho dễ nhìn.
      const scaled = Math.min(1, rms * 6);
      smooth = smooth * 0.75 + scaled * 0.25;
      return smooth;
    },
    stop() {
      if (stopped) return;
      stopped = true;
      try {
        src.disconnect();
        analyser.disconnect();
        mute.disconnect();
      } catch {
        /* đã ngắt rồi */
      }
      void ctx.close().catch(() => {});
    },
  };
}

/* ------------------------------- ghi âm ------------------------------- */

/** Chọn định dạng ghi mà trình duyệt hiện tại thật sự hỗ trợ */
function pickMime(): string {
  const prefer = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const m of prefer) {
    if (window.MediaRecorder?.isTypeSupported?.(m)) return m;
  }
  return '';
}

export interface Recording {
  blob: Blob;
  mime: string;
  ms: number;
}

export interface RecorderHandle {
  stop(): Promise<Recording | null>;
  cancel(): void;
}

/** Bắt đầu ghi âm từ luồng đang mở. Trả về handle để dừng và lấy audio. */
export function startRecording(stream: MediaStream): RecorderHandle | null {
  if (!isRecorderSupported()) return null;

  const mime = pickMime();
  let rec: MediaRecorder;
  try {
    rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  } catch {
    return null;
  }

  const chunks: Blob[] = [];
  const startedAt = performance.now();
  let settled = false;

  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  rec.start();

  return {
    stop() {
      return new Promise<Recording | null>((resolve) => {
        if (settled || rec.state === 'inactive') {
          resolve(null);
          return;
        }
        settled = true;
        rec.onstop = () => {
          const type = rec.mimeType || mime || 'audio/webm';
          const blob = new Blob(chunks, { type });
          resolve(blob.size > 0 ? { blob, mime: type, ms: performance.now() - startedAt } : null);
        };
        try {
          rec.stop();
        } catch {
          resolve(null);
        }
      });
    },
    cancel() {
      settled = true;
      try {
        if (rec.state !== 'inactive') rec.stop();
      } catch {
        /* bỏ qua */
      }
      chunks.length = 0;
    },
  };
}

/* --------------------- đổi bản ghi sang WAV cho AI --------------------- */

/**
 * Gemini chỉ nhận WAV / MP3 / FLAC / AAC / OGG. Trình duyệt lại ghi ra WebM
 * (Chrome) hoặc MP4 (Safari) — hai thứ đều KHÔNG nằm trong danh sách đó. Nên
 * phải giải mã rồi đóng gói lại thành WAV.
 *
 * Nhân tiện hạ xuống 16kHz mono: giọng nói không mất gì ở tần số đó, mà dung
 * lượng giảm khoảng 6 lần — gửi lên nhanh hơn hẳn khi dùng 4G.
 */
export async function toWav(blob: Blob, targetRate = 16000): Promise<Blob> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const mono = downmix(decoded);
    const pcm = decoded.sampleRate === targetRate ? mono : resample(mono, decoded.sampleRate, targetRate);
    return encodeWav(pcm, targetRate);
  } finally {
    void ctx.close().catch(() => {});
  }
}

function downmix(buf: AudioBuffer): Float32Array {
  if (buf.numberOfChannels === 1) return buf.getChannelData(0).slice();
  const out = new Float32Array(buf.length);
  for (let c = 0; c < buf.numberOfChannels; c += 1) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < buf.length; i += 1) out[i] += ch[i] / buf.numberOfChannels;
  }
  return out;
}

/** Nội suy tuyến tính — đủ tốt cho giọng nói ở 16kHz */
function resample(input: Float32Array, from: number, to: number): Float32Array {
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i += 1) {
    const pos = i * ratio;
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, input.length - 1);
    out[i] = input[lo] + (input[hi] - input[lo]) * (pos - lo);
  }
  return out;
}

function encodeWav(pcm: Float32Array, rate: number): Blob {
  const bytes = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(bytes);
  const ascii = (off: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) view.setUint8(off + i, s.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + pcm.length * 2, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true); // độ dài khối fmt
  view.setUint16(20, 1, true); // PCM không nén
  view.setUint16(22, 1, true); // 1 kênh
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true); // byte/giây
  view.setUint16(32, 2, true); // byte cho mỗi mẫu
  view.setUint16(34, 16, true); // bit cho mỗi mẫu
  ascii(36, 'data');
  view.setUint32(40, pcm.length * 2, true);

  let off = 44;
  for (let i = 0; i < pcm.length; i += 1, off += 2) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([bytes], { type: 'audio/wav' });
}

/** Đổi blob sang base64 thuần (không có tiền tố data:) để nhét vào JSON */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('doc_file_that_bai'));
    fr.onload = () => {
      const s = String(fr.result);
      resolve(s.slice(s.indexOf(',') + 1));
    };
    fr.readAsDataURL(blob);
  });
}


/* ------------------------- nhận diện trình duyệt ------------------------- */

export interface BrowserQuirks {
  isBrave: boolean;
  /** Nhận diện giọng nói của trình duyệt gần như chắc chắn không chạy */
  sttLikelyBlocked: boolean;
  name: string;
}

/**
 * Dò những trình duyệt có `webkitSpeechRecognition` nhưng dùng không được.
 *
 * Brave là ca đáng nói nhất: nó gỡ bỏ khoá API của Google mà Web Speech dựa
 * vào, nên đối tượng đó vẫn tồn tại, `start()` vẫn chạy, không ném lỗi gì —
 * chỉ là chẳng bao giờ trả về chữ, rồi tự kết thúc. Kiểm tra kiểu
 * `'webkitSpeechRecognition' in window` sẽ báo "có hỗ trợ" và app đi tiếp một
 * cách vui vẻ vào ngõ cụt. Phải dò riêng mới biết đường chuyển sang cho AI
 * chép chữ từ bản ghi âm.
 */
export function detectQuirks(): BrowserQuirks {
  const nav = navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } };
  const ua = navigator.userAgent;

  // Brave có `navigator.brave`, nhưng hàm kiểm tra lại bất đồng bộ nên ở đây
  // chỉ xét sự tồn tại của đối tượng — thế là đủ và không phải chờ.
  const isBrave = typeof nav.brave === 'object' && nav.brave !== null;

  const isFirefox = ua.includes('Firefox');
  const name = isBrave ? 'Brave' : isFirefox ? 'Firefox' : ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'trình duyệt này';

  return { isBrave, sttLikelyBlocked: isBrave || isFirefox, name };
}
