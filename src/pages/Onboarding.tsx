import { useEffect, useState } from 'react';
import { ArrowRight, Check, Volume2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { DOMAIN_LABEL, type Domain, type Level } from '@/types';
import { getEnglishVoices, onVoicesReady, pickDefaultVoice, speak } from '@/lib/speech';
import { asset, cn } from '@/lib/utils';

/* Màn hình chào — chỉ hỏi 4 điều, đủ để cá nhân hoá mà không làm phiền */

const LEVELS: { value: Level; label: string; desc: string }[] = [
  { value: 'A2', label: 'Mới bắt đầu', desc: 'Nghe hiểu câu ngắn, nói còn ngập ngừng nhiều' },
  { value: 'B1', label: 'Trung bình', desc: 'Nói được nhưng phải dịch trong đầu trước' },
  { value: 'B2', label: 'Khá', desc: 'Nói khá trôi, kẹt khi bị hỏi bất ngờ' },
  { value: 'C1', label: 'Tốt', desc: 'Trôi chảy, muốn mài tốc độ và độ tự nhiên' },
];

const DOMAINS: Domain[] = ['work', 'tech', 'daily', 'social'];

export function Onboarding() {
  const setSettings = useStore((s) => s.setSettings);
  const complete = useStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level>('B1');
  const [domains, setDomains] = useState<Domain[]>(['work', 'tech', 'daily', 'social']);
  const [goal, setGoal] = useState(15);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);

  useEffect(() => {
    const off = onVoicesReady(() => {
      const list = getEnglishVoices();
      setVoices(list);
      setVoiceURI((cur) => cur ?? pickDefaultVoice()?.voiceURI ?? null);
    });
    return off;
  }, []);

  const finish = () => {
    setSettings({
      name: name.trim(),
      level,
      focusDomains: domains.length ? domains : DOMAINS,
      dailyGoalMin: goal,
      voiceURI,
    });
    complete();
  };

  return (
    <div
      className="grain relative min-h-screen overflow-hidden bg-bg"
      style={{ backgroundImage: `url(${asset('/images/hero.jpg')})`, backgroundSize: 'cover' }}
    >
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ background: 'rgb(var(--c-mint) / .16)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-32 h-[380px] w-[380px] rounded-full blur-[120px]"
        style={{ background: 'rgb(var(--c-violet) / .18)' }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-2xl text-[#04120c]">
            🗣️
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">EchoFluent</h1>
            <p className="text-sm text-muted">
              Luyện <span className="text-mint">phản xạ</span> tiếng Anh — không phải luyện thi
            </p>
          </div>
        </div>

        <div className="card animate-fade-up p-6">
          {step === 0 && (
            <>
              <StepTitle
                n={1}
                title="Gọi bạn là gì?"
                desc="Chỉ để lời chào bớt khô. Bỏ trống cũng không sao."
              />
              <input
                className="input mt-4"
                placeholder="Thịnh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setStep(1)}
                autoFocus
              />
              <div className="mt-5 rounded-xl border border-line/70 bg-raised/40 p-4 text-sm leading-relaxed text-muted">
                App này chạy hoàn toàn trên máy bạn. Không tài khoản, không gửi dữ liệu đi đâu cả —
                tiến độ nằm trong trình duyệt.
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <StepTitle
                n={2}
                title="Bạn đang ở đâu?"
                desc="Chọn thật lòng — app sẽ chọn độ khó và tốc độ nói theo mức này."
              />
              <div className="mt-4 space-y-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLevel(l.value)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition',
                      level === l.value
                        ? 'border-mint/50 bg-mint/10'
                        : 'border-line bg-raised/30 hover:border-line',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                        level === l.value ? 'border-mint bg-mint text-[#04120c]' : 'border-line',
                      )}
                    >
                      {level === l.value && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">
                        {l.label}{' '}
                        <span className="font-mono text-xs font-normal text-faint">{l.value}</span>
                      </span>
                      <span className="block text-xs text-muted">{l.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <StepTitle
                n={3}
                title="Bạn cần tiếng Anh ở đâu nhất?"
                desc="Chọn nhiều cũng được. Nội dung sẽ nghiêng về những mảng bạn chọn."
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {DOMAINS.map((d) => {
                  const on = domains.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setDomains((cur) =>
                          cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d],
                        )
                      }
                      className={cn(
                        'rounded-xl border p-3.5 text-left text-sm font-semibold transition',
                        on
                          ? 'border-mint/50 bg-mint/10 text-mint'
                          : 'border-line bg-raised/30 text-muted hover:text-ink',
                      )}
                    >
                      {DOMAIN_LABEL[d]}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="label">Mục tiêu mỗi ngày</label>
                <div className="flex gap-2">
                  {[10, 15, 25, 40].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={cn(
                        'flex-1 rounded-xl border py-2.5 text-sm font-bold transition',
                        goal === g
                          ? 'border-mint/50 bg-mint/10 text-mint'
                          : 'border-line bg-raised/30 text-muted hover:text-ink',
                      )}
                    >
                      {g}′
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-faint">
                  15 phút mỗi ngày ăn đứt 2 tiếng mỗi Chủ nhật. Phản xạ cần tần suất, không cần thời
                  lượng.
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <StepTitle
                n={4}
                title="Chọn giọng đọc"
                desc="Đây là giọng bạn sẽ nghe suốt. Bấm thử vài giọng và chọn cái nghe dễ chịu nhất."
              />
              {voices.length === 0 ? (
                <p className="mt-4 rounded-xl border border-amber/30 bg-amber/10 p-4 text-sm text-amber">
                  Chưa thấy giọng tiếng Anh nào trên máy. App vẫn chạy được, nhưng để có tiếng đọc
                  bạn nên dùng Chrome, hoặc cài thêm giọng tiếng Anh trong cài đặt hệ điều hành.
                </p>
              ) : (
                <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {voices.slice(0, 14).map((v) => (
                    <div
                      key={v.voiceURI}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border p-2.5 transition',
                        voiceURI === v.voiceURI
                          ? 'border-mint/50 bg-mint/10'
                          : 'border-line bg-raised/30',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setVoiceURI(v.voiceURI)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-sm font-semibold text-ink">
                          {v.name}
                        </span>
                        <span className="block text-[11px] text-faint">{v.lang}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Nghe thử ${v.name}`}
                        onClick={() =>
                          speak("Hey, how's it going? Let's get you talking.", {
                            voiceURI: v.voiceURI,
                          })
                        }
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-raised text-muted transition hover:text-mint"
                      >
                        <Volume2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs leading-relaxed text-faint">
                Khi vào bài nói, trình duyệt sẽ xin quyền micro. Cho phép để app tự chấm câu bạn
                nói. Nếu từ chối, bạn vẫn luyện được — chỉ là phải tự đánh giá.
              </p>
            </>
          )}

          <div className="mt-7 flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === step ? 'w-6 bg-mint' : 'w-1.5 bg-line',
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <button type="button" className="btn-quiet" onClick={() => setStep(step - 1)}>
                  Quay lại
                </button>
              )}
              {step < 3 ? (
                <button type="button" className="btn-primary" onClick={() => setStep(step + 1)}>
                  Tiếp <ArrowRight size={15} />
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={finish}>
                  Bắt đầu học <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div>
      <span className="text-[11px] font-bold uppercase tracking-[.16em] text-mint">
        Bước {n} / 4
      </span>
      <h2 className="mt-1.5 text-xl font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
    </div>
  );
}
