// Các hàm tiện ích dùng chung cho toàn bộ test

export const ADMIN = { email: 'admin@chungcu.vn', password: 'admin123' }

/**
 * Đăng nhập qua giao diện và chờ vào trang chủ.
 * @param {import('@playwright/test').Page} page
 */
export async function login(page, { email, password } = ADMIN) {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  // Chờ chuyển hướng vào trang chủ (sidebar xuất hiện)
  await page.getByRole('link', { name: 'Tổng quan' }).waitFor()
}

/** Sinh chuỗi ngẫu nhiên để tạo dữ liệu không trùng lặp giữa các lần chạy. */
export function unique(prefix = '') {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`
}
