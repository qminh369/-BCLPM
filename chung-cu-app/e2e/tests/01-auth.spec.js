import { test, expect } from '@playwright/test'
import { ADMIN, unique } from './helpers'

/**
 * Kiểm thử chức năng ĐĂNG KÝ và ĐĂNG NHẬP.
 *
 * INPUT : thông tin tài khoản nhập vào form.
 * OUTPUT: điều hướng thành công / thông báo lỗi hiển thị trên UI.
 */
test.describe('Xác thực tài khoản', () => {

  test('TC01 - Đăng ký tài khoản cư dân mới thành công', async ({ page }) => {
    const email = `resident_${unique()}@test.vn`

    await page.goto('/register')
    await page.getByRole('heading', { name: 'Đăng ký tài khoản' }).waitFor()

    // INPUT: điền form đăng ký
    await page.locator('input[name="full_name"]').fill('Nguyễn Văn Test')
    await page.locator('input[name="email"]').fill(email)
    await page.locator('input[name="password"]').fill('matkhau123')
    await page.locator('input[name="apartment_code"]').fill('A-1201')
    await page.locator('select[name="role"]').selectOption('resident')

    await page.getByRole('button', { name: 'Đăng ký' }).click()

    // OUTPUT (expected): thông báo thành công rồi chuyển sang trang đăng nhập
    await expect(page.getByText('Đăng ký thành công')).toBeVisible()
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('TC02 - Đăng ký thất bại khi email đã tồn tại', async ({ page }) => {
    await page.goto('/register')
    await page.locator('input[name="full_name"]').fill('Trùng Email')
    await page.locator('input[name="email"]').fill(ADMIN.email) // email admin đã tồn tại
    await page.locator('input[name="password"]').fill('matkhau123')
    await page.getByRole('button', { name: 'Đăng ký' }).click()

    // OUTPUT (expected): hiển thị lỗi "Email đã được sử dụng"
    await expect(page.getByText('Email đã được sử dụng')).toBeVisible()
  })

  test('TC03 - Đăng nhập admin thành công', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(ADMIN.email)
    await page.locator('input[type="password"]').fill(ADMIN.password)
    await page.getByRole('button', { name: 'Đăng nhập' }).click()

    // OUTPUT (expected): vào trang chủ, thấy badge "Ban quản lý"
    await expect(page.getByRole('link', { name: 'Tổng quan' })).toBeVisible()
    await expect(page.getByText('Ban quản lý')).toBeVisible()
  })

  test('TC04 - Đăng nhập thất bại với mật khẩu sai', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(ADMIN.email)
    await page.locator('input[type="password"]').fill('sai_mat_khau')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()

    // OUTPUT (expected): thông báo lỗi, vẫn ở trang login
    await expect(page.getByText('Email hoặc mật khẩu không đúng')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })
})
