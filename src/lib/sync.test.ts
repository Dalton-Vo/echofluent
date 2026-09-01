import { describe, expect, it } from 'vitest';
import { buildSetupLink, readSetupLink } from './sync';

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
