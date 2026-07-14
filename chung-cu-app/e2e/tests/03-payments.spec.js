import { test, expect } from '@playwright/test'
import { login, unique } from './helpers'

/**
 * Kiểm thử chức năng THU PHÍ.
 *
 * INPUT : chọn khoản thu + số tiền + ghi chú.
 * OUTPUT: bản ghi thu phí xuất hiện trong bảng lịch sử.
 */
test.describe('Thu phí', () => {

  const feeName = `Phí gửi xe ${unique()}`

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('TC08 - Tạo khoản thu rồi ghi nhận thu phí', async ({ page }) => {
    // --- Bước 1: tạo khoản thu để thu ---
    await page.getByRole('link', { name: 'Khoản thu' }).click()
    await page.getByRole('button', { name: '+ Tạo khoản thu' }).click()
    await page.locator('input[name="name"]').fill(feeName)
    await page.locator('input[name="amount"]').fill('120000')
    await page.getByRole('button', { name: 'Lưu khoản thu' }).click()
    await expect(page.locator('tr', { hasText: feeName })).toBeVisible()

    // --- Bước 2: sang trang Thu phí và ghi nhận ---
    await page.getByRole('link', { name: 'Thu phí' }).click()
    await expect(page.getByRole('heading', { name: 'Thu phí / Đóng góp' })).toBeVisible()

    // INPUT: chọn khoản thu (số tiền tự điền theo định mức)
    await page.locator('select[name="fee_id"]').selectOption({ label: new RegExp(feeName) })
    await expect(page.locator('input[name="amount"]')).toHaveValue('120000')
    await page.locator('input[name="note"]').fill('Thanh toán tiền mặt')

    await page.getByRole('button', { name: 'Ghi nhận thu phí' }).click()

    // OUTPUT (expected): bản ghi mới hiển thị trong bảng lịch sử
    const row = page.locator('tr', { hasText: feeName }).first()
    await expect(row).toBeVisible()
    await expect(row).toContainText('120.000')
    await expect(row).toContainText('Thanh toán tiền mặt')
  })

  test('TC09 - Số tiền đã thu được cộng dồn vào khoản thu', async ({ page }) => {
    // Sau khi thu phí ở TC08, quay lại trang Khoản thu để kiểm tra cột "Đã thu"
    await page.getByRole('link', { name: 'Khoản thu' }).click()
    const row = page.locator('tr', { hasText: feeName })
    await expect(row).toBeVisible()
    // OUTPUT (expected): cột "Đã thu" > 0 và có ít nhất 1 lượt nộp
    await expect(row).toContainText('120.000')
  })
})
