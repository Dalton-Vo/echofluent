import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  /**
   * GitHub Pages phục vụ trang ở thư mục con (/echofluent/), nên toàn bộ đường
   * dẫn tài nguyên phải có tiền tố đó. Khi chạy `npm run dev` ở máy thì biến
   * VITE_BASE không được đặt và base quay về '/' như bình thường.
   * Mọi ảnh trong code phải đi qua helper `asset()` trong src/lib/utils.ts.
   */
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5180,
    open: true,
  },
});
