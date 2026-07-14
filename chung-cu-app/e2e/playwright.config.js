import { defineConfig, devices } from '@playwright/test'

/**
 * Cấu hình Playwright cho app quản lý chung cư.
 * Tài liệu: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  // Chạy tuần tự trong 1 file (vì các test phụ thuộc dữ liệu đăng nhập chung),
  // nhưng các file khác nhau vẫn chạy song song.
  fullyParallel: false,
  workers: 1,

  // Thử lại tối đa 1 lần khi test lỗi trên CI (giảm flaky)
  retries: process.env.CI ? 1 : 0,

  // Thời gian tối đa cho mỗi test
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Định dạng báo cáo đầu ra
  reporter: [
    ['list'],                                   // in ra terminal
    ['html', { open: 'never' }],                // báo cáo HTML trong playwright-report/
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    // URL gốc của ứng dụng — đổi qua biến môi trường BASE_URL khi cần
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Thu thập dữ liệu gỡ lỗi
    trace: 'on-first-retry',       // ghi trace khi test thất bại và chạy lại
    screenshot: 'only-on-failure', // chụp màn hình khi lỗi
    video: 'retain-on-failure',    // quay video khi lỗi

    // Ngôn ngữ trình duyệt
    locale: 'vi-VN',
  },

  // Chạy test trên nhiều trình duyệt
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
