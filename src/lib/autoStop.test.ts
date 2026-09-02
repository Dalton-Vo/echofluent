import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAutoStopController } from './autoStop';

describe('createAutoStopController', () => {
  afterEach(() => vi.useRealTimers());

  it('starts the maximum duration from listening, not from page mount', () => {
    vi.useFakeTimers();
    const done = vi.fn();
    const controller = createAutoStopController(done, { maxMs: 25_000 });

    vi.advanceTimersByTime(30_000);
    controller.start();
    vi.advanceTimersByTime(24_999);
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(done).toHaveBeenCalledOnce();
  });

  it('stops after stable silence even when the level value does not change again', () => {
    vi.useFakeTimers();
    const done = vi.fn();
    const controller = createAutoStopController(done, { silenceMs: 1_600 });

    controller.start();
    controller.update(0.2);
    controller.update(0);
    vi.advanceTimersByTime(1_599);
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(done).toHaveBeenCalledOnce();
  });

  it('cancels pending timers when listening stops', () => {
    vi.useFakeTimers();
    const done = vi.fn();
    const controller = createAutoStopController(done, { silenceMs: 100, maxMs: 200 });

    controller.start();
    controller.update(0.2);
    controller.update(0);
    controller.stop();
    vi.advanceTimersByTime(1_000);
    expect(done).not.toHaveBeenCalled();
  });
});
