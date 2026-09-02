import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildSetupLink, readSetupLink, buildSyncCode, readSyncCode, randomSecret, syncNow } from './sync';
import { useStore } from '@/store/useStore';

afterEach(() => vi.unstubAllGlobals());

/* Link cài đặt là thứ người dùng mở trên điện thoại — hỏng cái này thì phải gõ
 * tay cả địa chỉ lẫn mật khẩu trên màn hình nhỏ. */

describe('link cài đặt đồng bộ', () => {
  const url = 'https://echofluent-sync.thinh.workers.dev';
  const secret = 'mật-khẩu-có-dấu-tiếng-việt-123';

  it('đi vòng qua link rồi đọc lại vẫn nguyên vẹn', () => {
    const link = buildSetupLink('https://dalton-vo.github.io/echofluent/', url, secret);
    expect(readSetupLink(link.slice(link.indexOf('#')))).toEqual({ url, secret });
  });

  it('giữ nguyên ký tự tiếng Việt và ký tự đặc biệt trong mật khẩu', () => {
    const tricky = 'a/b+c=d&e?f#g "nháy" đấy';
    const link = buildSetupLink('https://x.dev/', url, tricky);
    expect(readSetupLink(link.slice(link.indexOf('#')))?.secret).toBe(tricky);
  });

  it('bỏ phần hash cũ của trang khi tạo link', () => {
    const link = buildSetupLink('https://x.dev/#/progress', url, secret);
    expect(link.startsWith('https://x.dev/#/settings?sync=')).toBe(true);
    expect(link).not.toContain('/progress');
  });

  it('trả null khi link không chứa cấu hình', () => {
    expect(readSetupLink('#/settings')).toBeNull();
    expect(readSetupLink('')).toBeNull();
  });

  it('trả null khi dữ liệu trong link bị hỏng, không làm app nổ', () => {
    expect(readSetupLink('#/settings?sync=khong-phai-base64!!!')).toBeNull();
    // mã hoá đúng cách nhưng thiếu mật khẩu → vẫn phải trả null
    const thieuMatKhau = btoa(encodeURIComponent('{"u":"https://x.workers.dev"}'));
    expect(readSetupLink(`#/settings?sync=${thieuMatKhau}`)).toBeNull();
  });
});

describe('mã đồng bộ — thứ đóng vai "đăng nhập"', () => {
  const url = 'https://echofluent-sync.dalton.workers.dev';
  const secret = 'mat-khau-rat-dai-va-ngau-nhien';

  it('gói rồi mở lại ra đúng thứ ban đầu', () => {
    const code = buildSyncCode(url, secret);
    expect(code.startsWith('EF1.')).toBe(true);
    expect(readSyncCode(code)).toEqual({ url, secret });
  });

  it('mã không chứa ký tự khó gõ hay dễ nhầm khi chép tay', () => {
    expect(buildSyncCode(url, secret)).toMatch(/^EF1\.[A-Za-z0-9_-]+$/);
  });

  it('bỏ qua khoảng trắng và xuống dòng dính vào khi gửi qua chat', () => {
    const code = buildSyncCode(url, secret);
    expect(readSyncCode(`  ${code}\n`)).toEqual({ url, secret });
    expect(readSyncCode(code.slice(0, 10) + '\n' + code.slice(10))).toEqual({ url, secret });
  });

  it('từ chối mã rác thay vì ném lỗi', () => {
    expect(readSyncCode('')).toBeNull();
    expect(readSyncCode('linh tinh')).toBeNull();
    expect(readSyncCode('EF1.khong-phai-base64-!!!')).toBeNull();
  });

  it('từ chối địa chỉ http — mã này mang theo mật khẩu', () => {
    const bad = 'EF1.' + btoa(encodeURIComponent(JSON.stringify({ u: 'http://x.dev', s: 'a' })))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(readSyncCode(bad)).toBeNull();
  });

  it('không sinh mã khi còn thiếu địa chỉ hoặc mật khẩu', () => {
    expect(buildSyncCode('', secret)).toBe('');
    expect(buildSyncCode(url, '  ')).toBe('');
  });

  it('không sinh mã chứa mật khẩu cho địa chỉ http', () => {
    expect(buildSyncCode('http://x.dev', secret)).toBe('');
  });

  it('không gửi mật khẩu qua mạng khi cấu hình cũ còn địa chỉ http', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    useStore.setState({ sync: { url: 'http://x.dev', secret } });

    const result = await syncNow();
    expect(result.status).toBe('error');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('mật khẩu sinh ra đủ dài và mỗi lần một khác', () => {
    const a = randomSecret();
    const b = randomSecret();
    expect(a.length).toBeGreaterThanOrEqual(30);
    expect(a).not.toBe(b);
  });
});
