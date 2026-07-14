import { test, expect } from '@playwright/test'
import { login, unique } from './helpers'

/**
 * Kiểm thử chức năng TẠO KHOẢN THU (quyền Ban quản lý).
 *
 * INPUT : thông tin khoản thu (tên, số tiền, loại, kỳ...).
 * OUTPUT: khoản thu mới xuất hiện trong bảng danh sách.
 */
test.describe('Quản lý khoản thu', () => {

  // Đăng nhập admin trước mỗi test
  test.beforeEach(async ({ page }) => {
    await login(page) // mặc định đăng nhập bằng tài khoản admin
    await page.getByRole('link', { name: 'Khoản thu' }).click()
    await expect(page.getByRole('heading', { name: 'Khoản thu' })).toBeVisible()
  })

  test('TC05 - Tạo khoản thu bắt buộc thành công', async ({ page }) => {
    const feeName = `Phí quản lý ${unique()}`

    // Mở form tạo khoản thu
    await page.getByRole('button', { name: '+ Tạo khoản thu' }).click()

    // INPUT: điền thông tin khoản thu
    await page.locator('input[name="name"]').fill(feeName)
    await page.locator('input[name="amount"]').fill('500000')
    await page.locator('select[name="category"]').selectOption('mandatory')
    await page.locator('input[name="period"]').fill('07/2026')
    await page.locator('input[name="description"]').fill('Phí quản lý căn hộ hằng tháng')

    await page.getByRole('button', { name: 'Lưu khoản thu' }).click()

    // OUTPUT (expected): khoản thu mới xuất hiện trong bảng
    const row = page.locator('tr', { hasText: feeName })
    await expect(row).toBeVisible()
    await expect(row.getByText('Bắt buộc')).toBeVisible()
    await expect(row).toContainText('500.000')
  })

  test('TC06 - Tạo khoản đóng góp tự nguyện', async ({ page }) => {
    const feeName = `Quỹ từ thiện ${unique()}`

    await page.getByRole('button', { name: '+ Tạo khoản thu' }).click()
    await page.locator('input[name="name"]').fill(feeName)
    await page.locator('input[name="amount"]').fill('100000')
    await page.locator('select[name="category"]').selectOption('voluntary')
    await page.getByRole('button', { name: 'Lưu khoản thu' }).click()

    const row = page.locator('tr', { hasText: feeName })
    await expect(row).toBeVisible()
    await expect(row.getByText('Tự nguyện')).toBeVisible()
  })

  test('TC07 - Xóa khoản thu', async ({ page }) => {
    const feeName = `Phí tạm ${unique()}`

    // Tạo trước một khoản thu để xóa
    await page.getByRole('button', { name: '+ Tạo khoản thu' }).click()
    await page.locator('input[name="name"]').fill(feeName)
    await page.locator('input[name="amount"]').fill('50000')
    await page.getByRole('button', { name: 'Lưu khoản thu' }).click()

    const row = page.locator('tr', { hasText: feeName })
    await expect(row).toBeVisible()

    // Chấp nhận hộp thoại confirm khi bấm Xóa
    page.on('dialog', (dialog) => dialog.accept())
    await row.getByRole('button', { name: 'Xóa' }).click()

    // OUTPUT (expected): dòng khoản thu biến mất
    await expect(row).toHaveCount(0)
  })
})
