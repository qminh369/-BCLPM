# Hướng dẫn chi tiết kiểm thử với Playwright — Áp dụng cho App Quản Lý Chung Cư

Tài liệu này giải thích **input**, **output**, **cách sử dụng** và **quy trình kiểm thử** của Playwright, kèm bộ test thực tế cho ứng dụng quản lý chung cư (FastAPI + React + SQLite).

---

## Mục lục

1. [Playwright là gì và mô hình hoạt động](#1-playwright-là-gì-và-mô-hình-hoạt-động)
2. [INPUT — Đầu vào của một bài test](#2-input--đầu-vào-của-một-bài-test)
3. [OUTPUT — Đầu ra sau khi chạy test](#3-output--đầu-ra-sau-khi-chạy-test)
4. [Cách sử dụng — Các lệnh CLI](#4-cách-sử-dụng--các-lệnh-cli)
5. [Quy trình kiểm thử chuẩn](#5-quy-trình-kiểm-thử-chuẩn)
6. [Kiểm thử trên App Quản Lý Chung Cư](#6-kiểm-thử-trên-app-quản-lý-chung-cư)
7. [Chạy bộ test — thủ công và bằng Docker](#7-chạy-bộ-test--thủ-công-và-bằng-docker)
8. [Đọc kết quả và gỡ lỗi](#8-đọc-kết-quả-và-gỡ-lỗi)

---

## 1. Playwright là gì và mô hình hoạt động

**Playwright** là công cụ kiểm thử tự động end-to-end (E2E): nó **điều khiển một trình duyệt thật** (Chromium/Firefox/WebKit) thực hiện các thao tác của người dùng (mở trang, gõ chữ, bấm nút) rồi **kiểm chứng (assert)** kết quả hiển thị trên màn hình hoặc phản hồi API.

```
┌────────────┐   thao tác (goto, fill, click)   ┌──────────────┐
│  Test spec │ ───────────────────────────────► │  Trình duyệt │ ──► App chung cư
│  (.spec.js)│ ◄─────────────────────────────── │ (thật/headless)│    (React + API)
└────────────┘   trạng thái DOM / phản hồi API   └──────────────┘
        │
        └──► so sánh với kỳ vọng (expect) → PASS / FAIL
```

Kiểm thử E2E khác với unit test: nó chạy **toàn bộ hệ thống thật** (frontend + backend + database), mô phỏng đúng hành vi người dùng cuối.

---

## 2. INPUT — Đầu vào của một bài test

Một bài test Playwright nhận **4 nhóm input**:

### 2.1. Cấu hình (config) — `playwright.config.js`

Đây là input toàn cục: URL gốc, trình duyệt, timeout, số lần retry, định dạng báo cáo...

```js
use: {
  baseURL: 'http://localhost:3000',  // gốc để page.goto('/login') tự ghép URL
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
}
```

### 2.2. Locator — cách "chỉ" tới phần tử trên trang

Locator là input quan trọng nhất: nó xác định **thao tác lên phần tử nào**. Thứ tự ưu tiên (bền vững → dễ vỡ):

| Loại locator | Ví dụ | Khi nào dùng |
|--------------|-------|--------------|
| Theo vai trò (role) | `getByRole('button', { name: 'Đăng nhập' })` | **Ưu tiên nhất** — giống cách người dùng/máy đọc màn hình nhìn |
| Theo nhãn | `getByLabel('Email')` | Ô input có `<label>` gắn với input |
| Theo placeholder | `getByPlaceholder('A-1201')` | Ô input có placeholder |
| Theo text | `getByText('Đăng ký thành công')` | Kiểm tra thông báo |
| Theo test id | `getByTestId('fee-row')` | Khi cần ổn định tuyệt đối (thêm `data-testid`) |
| CSS / attribute | `locator('input[name="amount"]')` | Khi các cách trên không áp dụng |

### 2.3. Action — hành động mô phỏng người dùng (đây là "input" gửi vào app)

| Action | Ý nghĩa | Ví dụ trong app chung cư |
|--------|---------|--------------------------|
| `goto(url)` | Mở trang | `await page.goto('/login')` |
| `fill(value)` | Gõ giá trị vào ô nhập | `await email.fill('admin@chungcu.vn')` |
| `click()` | Bấm | `await page.getByRole('button', {name:'Đăng nhập'}).click()` |
| `selectOption(v)` | Chọn dropdown | `await page.locator('select[name="category"]').selectOption('mandatory')` |
| `check()/uncheck()` | Tick checkbox | — |
| `press('Enter')` | Nhấn phím | — |

### 2.4. Dữ liệu test (test data)

Giá trị nhập vào form. Để tránh trùng lặp giữa các lần chạy, ta sinh dữ liệu động:

```js
const email = `resident_${Date.now()}@test.vn`   // luôn duy nhất
const feeName = `Phí quản lý ${Date.now()}`
```

> Trong bộ test này, hàm `unique()` trong [tests/helpers.js](tests/helpers.js) đảm nhận việc đó.

---

## 3. OUTPUT — Đầu ra sau khi chạy test

Playwright tạo ra nhiều lớp output:

### 3.1. Kết quả PASS/FAIL (assertion)

Trái tim của test là các phép **`expect`**. Đây là output logic — quyết định test đỗ hay trượt:

```js
await expect(page.getByText('Đăng ký thành công')).toBeVisible()  // OUTPUT mong đợi
await expect(page).toHaveURL(/\/login/)
await expect(row).toContainText('500.000')
```

Playwright dùng **auto-waiting**: `expect` tự chờ tới khi điều kiện đúng (trong `expect.timeout`) rồi mới kết luận — không cần `sleep` thủ công.

### 3.2. Kết quả trên terminal (reporter `list`)

```
Running 12 tests using 1 worker

  ✓  01-auth.spec.js:14:3 › TC01 - Đăng ký tài khoản cư dân mới thành công (1.2s)
  ✓  01-auth.spec.js:34:3 › TC02 - Đăng ký thất bại khi email đã tồn tại (0.8s)
  ✗  02-fees.spec.js:25:3 › TC05 - Tạo khoản thu bắt buộc thành công (3.1s)

  1 failed, 11 passed (18.4s)
```

### 3.3. Báo cáo HTML (`playwright-report/`)

Báo cáo trực quan: từng test, các bước, thời gian, ảnh chụp, video, trace. Mở bằng:

```bash
npx playwright show-report
```

### 3.4. Artefact khi lỗi (theo cấu hình `use`)

| Output | File | Ý nghĩa |
|--------|------|---------|
| **Screenshot** | `test-results/.../test-failed-1.png` | Ảnh màn hình tại thời điểm lỗi |
| **Video** | `test-results/.../video.webm` | Quay lại toàn bộ phiên chạy lỗi |
| **Trace** | `trace.zip` | "Hộp đen": DOM, network, console từng bước — xem bằng `npx playwright show-trace` |
| **JSON** | `test-results/results.json` | Kết quả dạng máy đọc (cho CI/CD) |

---

## 4. Cách sử dụng — Các lệnh CLI

```bash
# Cài đặt (một lần)
npm install
npx playwright install          # tải trình duyệt

# Chạy toàn bộ test (headless — không hiện trình duyệt)
npx playwright test

# Chạy 1 file / 1 test cụ thể
npx playwright test 01-auth.spec.js
npx playwright test -g "TC05"   # theo tên test

# Chạy có hiển thị trình duyệt
npx playwright test --headed

# Chỉ chạy trên 1 trình duyệt
npx playwright test --project=chromium

# Chế độ UI tương tác (khuyến nghị khi phát triển test)
npx playwright test --ui

# Chế độ gỡ lỗi từng bước
npx playwright test --debug

# Tự sinh code test bằng cách ghi lại thao tác
npx playwright codegen http://localhost:3000

# Mở báo cáo
npx playwright show-report
```

Các lệnh trên đã được gói sẵn trong [package.json](package.json): `npm test`, `npm run test:ui`, `npm run codegen`...

---

## 5. Quy trình kiểm thử chuẩn

### 5.1. Vòng đời một dự án kiểm thử

```
1. Phân tích yêu cầu   → Liệt kê chức năng cần test (đăng ký, tạo khoản thu...)
2. Thiết kế test case  → Mỗi ca: tiền điều kiện, input, các bước, output mong đợi
3. Viết test script    → Dùng codegen để dựng khung, rồi tinh chỉnh locator/assert
4. Chạy test           → Local (headed để quan sát) → headless
5. Phân tích kết quả   → Xem report, trace, screenshot khi FAIL
6. Sửa lỗi & chạy lại  → App bug hoặc test bug
7. Tích hợp CI/CD      → Chạy tự động mỗi lần push code
```

### 5.2. Cấu trúc một test case — mẫu AAA (Arrange–Act–Assert)

```js
test('TC05 - Tạo khoản thu bắt buộc', async ({ page }) => {
  // ARRANGE: chuẩn bị (đăng nhập admin, mở trang Khoản thu)
  await login(page)
  await page.getByRole('link', { name: 'Khoản thu' }).click()

  // ACT: thực hiện hành động (INPUT: điền form + submit)
  await page.getByRole('button', { name: '+ Tạo khoản thu' }).click()
  await page.locator('input[name="name"]').fill('Phí quản lý')
  await page.locator('input[name="amount"]').fill('500000')
  await page.getByRole('button', { name: 'Lưu khoản thu' }).click()

  // ASSERT: kiểm chứng OUTPUT
  await expect(page.locator('tr', { hasText: 'Phí quản lý' })).toBeVisible()
})
```

### 5.3. Nguyên tắc viết test tốt

- **Độc lập**: mỗi test tự chuẩn bị dữ liệu, không phụ thuộc thứ tự chạy của test khác.
- **Dữ liệu duy nhất**: dùng `Date.now()` để không đụng dữ liệu cũ trong SQLite.
- **Ưu tiên `getByRole`/`getByText`** thay vì CSS dễ vỡ.
- **Không dùng `waitForTimeout` cố định** — để `expect` tự chờ.
- **Đặt tên rõ ràng**: `TC05 - Tạo khoản thu bắt buộc thành công`.

---

## 6. Kiểm thử trên App Quản Lý Chung Cư

Bộ test nằm trong thư mục [tests/](tests/), phủ đúng 4 tính năng của app. Bảng ánh xạ **INPUT → OUTPUT mong đợi**:

### 6.1. Đăng ký / Đăng nhập — [`01-auth.spec.js`](tests/01-auth.spec.js)

| Mã | Kịch bản | INPUT | OUTPUT mong đợi |
|----|----------|-------|-----------------|
| TC01 | Đăng ký cư dân mới | Họ tên, email duy nhất, mật khẩu, mã căn hộ | Thông báo "Đăng ký thành công", chuyển tới `/login` |
| TC02 | Đăng ký email trùng | Email đã tồn tại (`admin@chungcu.vn`) | Lỗi "Email đã được sử dụng" |
| TC03 | Đăng nhập admin | `admin@chungcu.vn` / `admin123` | Vào trang chủ, thấy badge "Ban quản lý" |
| TC04 | Đăng nhập sai mật khẩu | Mật khẩu sai | Lỗi "Email hoặc mật khẩu không đúng", vẫn ở `/login` |

### 6.2. Tạo khoản thu — [`02-fees.spec.js`](tests/02-fees.spec.js)

| Mã | Kịch bản | INPUT | OUTPUT mong đợi |
|----|----------|-------|-----------------|
| TC05 | Tạo khoản thu bắt buộc | Tên, 500000đ, loại "Bắt buộc", kỳ 07/2026 | Dòng mới trong bảng, tag "Bắt buộc", hiển thị "500.000" |
| TC06 | Tạo khoản tự nguyện | Tên, 100000đ, loại "Tự nguyện" | Dòng mới với tag "Tự nguyện" |
| TC07 | Xóa khoản thu | Bấm "Xóa" + xác nhận dialog | Dòng khoản thu biến mất khỏi bảng |

### 6.3. Thu phí — [`03-payments.spec.js`](tests/03-payments.spec.js)

| Mã | Kịch bản | INPUT | OUTPUT mong đợi |
|----|----------|-------|-----------------|
| TC08 | Ghi nhận thu phí | Chọn khoản thu → số tiền tự điền (120000) → ghi chú | Bản ghi mới trong bảng lịch sử, đúng số tiền + ghi chú |
| TC09 | Cộng dồn số đã thu | (kiểm tra sau TC08) | Cột "Đã thu" của khoản thu = 120.000 |

### 6.4. Thống kê — [`04-statistics.spec.js`](tests/04-statistics.spec.js)

| Mã | Kịch bản | INPUT | OUTPUT mong đợi |
|----|----------|-------|-----------------|
| TC10 | Hiển thị thẻ số liệu | — | 4 thẻ: Tổng đã thu, Bắt buộc, Tự nguyện, Lượt nộp |
| TC11 | Chi tiết theo khoản thu | — | Có mục "Chi tiết theo khoản thu", tiền định dạng "₫" |
| TC12 | Kiểm thử qua API | Token JWT | `GET /api/statistics` trả 200, JSON có `total_collected`, `by_fee` |

> **Lưu ý về TC12**: Playwright test được cả **UI lẫn API**. Test này lấy token từ `localStorage` sau khi đăng nhập rồi gọi thẳng API — hữu ích để kiểm chứng dữ liệu backend độc lập với giao diện.

---

## 7. Chạy bộ test — thủ công và bằng Docker

### 7.1. Điều kiện tiên quyết

App phải đang chạy. Khởi động bằng Docker (từ thư mục gốc `chung-cu-app`):

```bash
docker compose up --build -d      # app chạy nền tại http://localhost:3000
```

### 7.2. Cách A — Chạy test trực tiếp trên máy

```bash
cd e2e
npm install
npx playwright install            # tải trình duyệt (lần đầu)

npm test                          # chạy toàn bộ, headless
npm run test:headed               # hiện trình duyệt để quan sát
npm run test:ui                   # chế độ UI tương tác
npm run report                    # mở báo cáo HTML
```

### 7.3. Cách B — Chạy test bằng Docker (không cần cài Node/trình duyệt)

Dùng file [docker-compose.test.yml](../docker-compose.test.yml). Playwright chạy trong container, trỏ tới service `frontend` qua mạng nội bộ Docker:

```bash
# Từ thư mục gốc chung-cu-app
docker compose -f docker-compose.yml -f docker-compose.test.yml up --build --abort-on-container-exit e2e
```

Sau khi chạy xong, báo cáo được xuất ra `e2e/playwright-report/` trên máy host.

---

## 8. Đọc kết quả và gỡ lỗi

### 8.1. Khi test PASS

Terminal hiện `✓`, tổng kết `X passed`. Mở báo cáo HTML để xem chi tiết từng bước nếu muốn.

### 8.2. Khi test FAIL — quy trình chẩn đoán

1. **Đọc thông báo lỗi** trên terminal: thường chỉ rõ locator nào không tìm thấy hoặc assertion nào sai.
2. **Mở báo cáo HTML** (`npm run report`) → tìm test đỏ → xem **ảnh chụp** và **video** thời điểm lỗi.
3. **Mở trace** để "tua lại" từng bước kèm DOM/network/console:
   ```bash
   npx playwright show-trace test-results/<đường-dẫn>/trace.zip
   ```
4. **Chạy lại đúng test đó ở chế độ debug** để dừng từng bước:
   ```bash
   npx playwright test -g "TC05" --debug
   ```

### 8.3. Phân biệt "lỗi app" và "lỗi test"

- **Lỗi app (bug thật)**: app hành xử sai so với yêu cầu → báo cho nhóm phát triển, giữ nguyên test.
- **Lỗi test (flaky/sai locator)**: locator lỗi thời, thiếu chờ đợi, dữ liệu trùng → sửa test.

---

## Phụ lục: Cây thư mục bộ kiểm thử

```
e2e/
├── package.json                       # scripts + dependency @playwright/test
├── playwright.config.js               # cấu hình: baseURL, trình duyệt, reporter, trace
├── Dockerfile                         # image kiểm thử (kèm sẵn trình duyệt)
├── HUONG-DAN-KIEM-THU-PLAYWRIGHT.md   # tài liệu này
└── tests/
    ├── helpers.js                     # hàm login(), unique()
    ├── 01-auth.spec.js                # TC01–TC04: đăng ký, đăng nhập
    ├── 02-fees.spec.js                # TC05–TC07: tạo/xóa khoản thu
    ├── 03-payments.spec.js            # TC08–TC09: thu phí
    └── 04-statistics.spec.js          # TC10–TC12: thống kê (UI + API)
```

## Tài liệu tham khảo

- Playwright chính thức: <https://playwright.dev>
- Locators: <https://playwright.dev/docs/locators>
- Assertions: <https://playwright.dev/docs/test-assertions>
- Trace Viewer: <https://playwright.dev/docs/trace-viewer>
