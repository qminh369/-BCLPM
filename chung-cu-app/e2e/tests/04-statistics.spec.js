import { test, expect } from '@playwright/test'
import { login } from './helpers'

/**
 * Kiểm thử chức năng THỐNG KÊ các khoản đóng góp.
 *
 * INPUT : không có (chỉ đọc dữ liệu tổng hợp).
 * OUTPUT: các thẻ số liệu và biểu đồ hiển thị đúng cấu trúc.
 */
test.describe('Thống kê đóng góp', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.getByRole('link', { name: 'Thống kê' }).click()
  })

  test('TC10 - Trang thống kê hiển thị đầy đủ các thẻ số liệu', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Thống kê các khoản đóng góp' })).toBeVisible()

    // OUTPUT (expected): 4 thẻ số liệu chính đều xuất hiện
    await expect(page.getByText('Tổng đã thu')).toBeVisible()
    await expect(page.getByText('Khoản bắt buộc')).toBeVisible()
    await expect(page.getByText('Khoản tự nguyện')).toBeVisible()
    await expect(page.getByText('Tổng lượt nộp')).toBeVisible()
  })

  test('TC11 - Có phần chi tiết theo từng khoản thu', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Chi tiết theo khoản thu' })).toBeVisible()

    // OUTPUT (expected): tổng tiền hiển thị dưới dạng tiền tệ VNĐ (có ký hiệu ₫)
    const tongDaThu = page.locator('.stat-card', { hasText: 'Tổng đã thu' })
    await expect(tongDaThu).toContainText('₫')
  })

  test('TC12 - Kiểm tra qua API (không qua UI)', async ({ request, page }) => {
    // Lấy token từ localStorage sau khi đăng nhập
    const token = await page.evaluate(() => localStorage.getItem('token'))

    const res = await request.get('/api/statistics', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // OUTPUT (expected): API trả 200 và JSON có các trường thống kê
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('total_collected')
    expect(body).toHaveProperty('mandatory_collected')
    expect(body).toHaveProperty('by_fee')
    expect(Array.isArray(body.by_fee)).toBeTruthy()
  })
})
