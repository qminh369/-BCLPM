# Hướng dẫn cài đặt công cụ kiểm thử Playwright trên Linux và Windows

Playwright là một thư viện kiểm thử tự động (end-to-end testing) do Microsoft phát triển, hỗ trợ kiểm thử trên các trình duyệt Chromium, Firefox và WebKit với một API thống nhất.

---

## Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cài đặt trên Windows](#2-cài-đặt-trên-windows)
3. [Cài đặt trên Linux](#3-cài-đặt-trên-linux)
4. [Kiểm tra cài đặt](#4-kiểm-tra-cài-đặt)
5. [Chạy thử bộ test mẫu](#5-chạy-thử-bộ-test-mẫu)
6. [Một số lệnh thường dùng](#6-một-số-lệnh-thường-dùng)
7. [Xử lý sự cố thường gặp](#7-xử-lý-sự-cố-thường-gặp)

---

## 1. Yêu cầu hệ thống

| Thành phần | Yêu cầu tối thiểu |
|------------|-------------------|
| Node.js    | Phiên bản 18, 20 hoặc 22 (LTS) trở lên |
| npm        | Đi kèm với Node.js |
| Hệ điều hành | Windows 10/11, Windows Server 2016+; hoặc Linux (Ubuntu 20.04/22.04/24.04, Debian 11/12) |
| RAM        | Tối thiểu 4 GB (khuyến nghị 8 GB) |
| Dung lượng | Khoảng 1–2 GB cho các trình duyệt |

> **Lưu ý:** Playwright cũng có bản dành cho Python, Java và .NET. Tài liệu này tập trung vào bản **Node.js/JavaScript/TypeScript** (phổ biến nhất). Phần cuối có ghi chú nhanh cho Python.

---

## 2. Cài đặt trên Windows

### 2.1. Cài đặt Node.js

1. Truy cập trang chủ <https://nodejs.org> và tải bản **LTS**.
2. Chạy file `.msi` và cài đặt theo hướng dẫn (giữ nguyên các tùy chọn mặc định).
3. Mở **PowerShell** hoặc **Command Prompt** và kiểm tra:

```powershell
node -v
npm -v
```

Nếu cả hai lệnh in ra số phiên bản nghĩa là Node.js đã được cài thành công.

### 2.2. Tạo thư mục dự án

```powershell
mkdir playwright-demo
cd playwright-demo
```

### 2.3. Cài đặt Playwright

**Cách 1 — Dùng trình khởi tạo (khuyến nghị cho dự án mới):**

```powershell
npm init playwright@latest
```

Trình cài đặt sẽ hỏi một vài tùy chọn:

- Chọn **TypeScript** hoặc **JavaScript**.
- Tên thư mục chứa test (mặc định `tests`).
- Có thêm file cấu hình GitHub Actions hay không.
- Có cài đặt trình duyệt ngay không → chọn **Yes**.

**Cách 2 — Thêm vào dự án đã có sẵn:**

```powershell
npm install -D @playwright/test
npx playwright install
```

Lệnh `npx playwright install` sẽ tải về Chromium, Firefox và WebKit.

### 2.4. (Tùy chọn) Cài riêng một trình duyệt

```powershell
npx playwright install chromium
```

---

## 3. Cài đặt trên Linux

Hướng dẫn dưới đây áp dụng cho **Ubuntu/Debian**. Với các bản phân phối khác (Fedora, Arch...), thay lệnh quản lý gói tương ứng.

### 3.1. Cài đặt Node.js

**Cách 1 — Qua kho NodeSource (khuyến nghị, lấy bản mới):**

```bash
# Cài Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Cách 2 — Dùng nvm (Node Version Manager, dễ quản lý nhiều phiên bản):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Mở lại terminal hoặc nạp lại cấu hình shell
source ~/.bashrc
nvm install 20
nvm use 20
```

Kiểm tra:

```bash
node -v
npm -v
```

### 3.2. Tạo thư mục dự án

```bash
mkdir playwright-demo
cd playwright-demo
```

### 3.3. Cài đặt Playwright

```bash
npm init playwright@latest
```

Hoặc thêm vào dự án có sẵn:

```bash
npm install -D @playwright/test
npx playwright install
```

### 3.4. Cài đặt các thư viện hệ thống phụ thuộc

Trên Linux, các trình duyệt cần một số thư viện hệ thống. Playwright hỗ trợ tự động cài:

```bash
# Cài đầy đủ trình duyệt kèm các gói phụ thuộc hệ thống
sudo npx playwright install-deps
npx playwright install

# Hoặc gộp cả hai bước (cần quyền sudo)
sudo npx playwright install --with-deps
```

> **Lưu ý cho máy chủ không có giao diện (headless server / CI):** Playwright chạy mặc định ở chế độ headless nên không cần màn hình. Nếu muốn chạy ở chế độ có giao diện (headed), cần cài thêm `xvfb`:
>
> ```bash
> sudo apt-get install -y xvfb
> xvfb-run npx playwright test
> ```

---

## 4. Kiểm tra cài đặt

Kiểm tra phiên bản Playwright (chạy được trên cả Windows và Linux):

```bash
npx playwright --version
```

Liệt kê các trình duyệt đã cài:

```bash
npx playwright install --dry-run
```

---

## 5. Chạy thử bộ test mẫu

Khi dùng `npm init playwright@latest`, Playwright tạo sẵn một file test mẫu trong thư mục `tests/` (ví dụ `example.spec.ts`).

Chạy toàn bộ test:

```bash
npx playwright test
```

Xem báo cáo kết quả dạng HTML:

```bash
npx playwright show-report
```

Chạy ở chế độ giao diện (UI Mode) để xem trực quan:

```bash
npx playwright test --ui
```

Ví dụ một file test đơn giản (`tests/example.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test('có tiêu đề đúng', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('điều hướng tới trang Get started', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
```

---

## 6. Một số lệnh thường dùng

| Lệnh | Chức năng |
|------|-----------|
| `npx playwright test` | Chạy toàn bộ test |
| `npx playwright test tên-file.spec.ts` | Chạy một file test cụ thể |
| `npx playwright test --headed` | Chạy với trình duyệt hiển thị |
| `npx playwright test --project=chromium` | Chỉ chạy trên Chromium |
| `npx playwright test --ui` | Mở chế độ giao diện tương tác |
| `npx playwright test --debug` | Chạy ở chế độ gỡ lỗi (Inspector) |
| `npx playwright codegen <url>` | Tự sinh code test bằng cách ghi lại thao tác |
| `npx playwright show-report` | Mở báo cáo HTML |
| `npx playwright show-trace trace.zip` | Xem lại trace để gỡ lỗi |

---

## 7. Xử lý sự cố thường gặp

### 7.1. Lỗi thiếu thư viện trên Linux

Thông báo kiểu `error while loading shared libraries`:

```bash
sudo npx playwright install-deps
```

### 7.2. Tải trình duyệt chậm hoặc lỗi mạng (do proxy)

Thiết lập biến môi trường proxy trước khi cài:

**Windows (PowerShell):**

```powershell
$env:HTTPS_PROXY = "http://proxy.cong-ty:8080"
npx playwright install
```

**Linux (Bash):**

```bash
export HTTPS_PROXY="http://proxy.cong-ty:8080"
npx playwright install
```

### 7.3. Thay đổi thư mục lưu trình duyệt

```bash
# Linux
export PLAYWRIGHT_BROWSERS_PATH=/duong-dan/tuy-chon
```

```powershell
# Windows
$env:PLAYWRIGHT_BROWSERS_PATH = "D:\playwright-browsers"
```

### 7.4. Node.js quá cũ

Nếu gặp lỗi liên quan đến phiên bản, hãy nâng cấp Node.js lên bản LTS mới nhất (xem mục 2.1 và 3.1).

---

## Phụ lục: Cài đặt nhanh bản Python

```bash
# Cài thư viện
pip install pytest-playwright

# Cài trình duyệt
playwright install

# (Linux) cài kèm phụ thuộc hệ thống
playwright install --with-deps

# Chạy test
pytest
```

---

## Tài liệu tham khảo

- Trang chủ Playwright: <https://playwright.dev>
- Hướng dẫn cài đặt chính thức: <https://playwright.dev/docs/intro>
- Kho mã nguồn GitHub: <https://github.com/microsoft/playwright>
