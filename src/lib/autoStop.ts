export interface AutoStopOptions {
  threshold?: number;
  silenceMs?: number;
  maxMs?: number;
}

export interface AutoStopController {
  start: () => void;
  update: (level: number) => void;
  stop: () => void;
}

/** Timer-based voice activity controller; it does not depend on React rerenders. */
export function createAutoStopController(
  onDone: () => void,
  options: AutoStopOptions = {},
): AutoStopController {
  const { threshold = 0.07, silenceMs = 1_600, maxMs = 25_000 } = options;
  let active = false;
  let spoke = false;
  let fired = false;
  let silenceTimer: ReturnType<typeof setTimeout> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;

  const clearSilence = () => {
    if (silenceTimer !== null) clearTimeout(silenceTimer);
    silenceTimer = null;
  };

  const finish = () => {
    if (!active || fired) return;
    fired = true;
    clearSilence();
    if (maxTimer !== null) clearTimeout(maxTimer);
    maxTimer = null;
    onDone();
  };

  const stop = () => {
    active = false;
    spoke = false;
    fired = false;
    clearSilence();
    if (maxTimer !== null) clearTimeout(maxTimer);
    maxTimer = null;
  };

  return {
    start() {
      stop();
      active = true;
      maxTimer = setTimeout(finish, maxMs);
    },
    update(level) {
      if (!active || fired) return;
      if (level > threshold) {
        spoke = true;
        clearSilence();
        return;
      }
      if (spoke && silenceTimer === null) silenceTimer = setTimeout(finish, silenceMs);
    },
    stop,
  };
}
