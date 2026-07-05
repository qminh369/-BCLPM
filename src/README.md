# 🏢 Web App Quản Lý Chung Cư

Ứng dụng web quản lý thu phí chung cư, gồm các chức năng: **đăng ký tài khoản**, **tạo khoản thu**, **thu phí** và **thống kê các khoản đóng góp**.

## Công nghệ

| Thành phần | Công nghệ |
|-----------|-----------|
| Backend   | Python — **FastAPI** + SQLAlchemy, xác thực **JWT** |
| Frontend  | **React** (Vite) + React Router + Axios |
| Database  | **SQLite** |
| Triển khai | **Docker** + Docker Compose (backend, frontend đều được container hóa) |

## Cấu trúc thư mục

```
chung-cu-app/
├── backend/                # API FastAPI
│   ├── app/
│   │   ├── main.py         # Khởi tạo app, đăng ký router, tạo bảng, seed admin
│   │   ├── config.py       # Cấu hình (secret key, DB URL...)
│   │   ├── database.py     # Kết nối SQLite qua SQLAlchemy
│   │   ├── models.py       # User, Fee (khoản thu), Payment (thu phí)
│   │   ├── schemas.py      # Pydantic schema
│   │   ├── auth.py         # Hash mật khẩu, tạo/giải mã JWT, phân quyền
│   │   ├── seed.py         # Tạo tài khoản admin mặc định
│   │   └── routers/        # auth, fees, payments, stats, users
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Giao diện React
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard, Fees, Payments, Statistics
│   │   ├── components/     # Layout (sidebar + topbar)
│   │   ├── context/        # AuthContext (quản lý đăng nhập)
│   │   ├── api.js          # Axios + interceptor gắn token
│   │   └── styles.css
│   ├── nginx.conf          # Phục vụ SPA + proxy /api → backend
│   ├── Dockerfile          # Build React rồi serve bằng Nginx
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Chạy bằng Docker (khuyến nghị)

Yêu cầu: đã cài **Docker** và **Docker Compose**.

```bash
cd chung-cu-app
docker compose up --build
```

Sau khi build xong:

- **Ứng dụng web:** <http://localhost:3000>
- **API (tài liệu Swagger):** <http://localhost:8000/docs>

Dừng ứng dụng:

```bash
docker compose down
```

> Dữ liệu SQLite được lưu trong Docker volume `backend_data` nên **không mất** khi rebuild.
> Muốn xóa sạch dữ liệu: `docker compose down -v`.

### Tài khoản mẫu

Hệ thống tự tạo sẵn một tài khoản Ban quản lý:

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Ban quản lý (admin) | `admin@chungcu.vn` | `admin123` |

Cư dân tự đăng ký tài khoản mới ở trang **Đăng ký**.

## 🧩 Các chức năng

1. **Đăng ký / Đăng nhập tài khoản** — cư dân hoặc Ban quản lý; xác thực bằng JWT.
2. **Tạo khoản thu** — Ban quản lý tạo các khoản thu (phí quản lý, gửi xe, quỹ...), phân loại **bắt buộc** / **tự nguyện**, kèm định mức và kỳ thu.
3. **Thu phí** — ghi nhận việc nộp tiền cho từng khoản thu. Cư dân tự nộp cho mình; admin có thể **thu hộ** cho bất kỳ cư dân nào.
4. **Thống kê các khoản đóng góp** — tổng đã thu, tách theo loại bắt buộc/tự nguyện, biểu đồ chi tiết theo từng khoản thu.

### Phân quyền

| Chức năng | Cư dân | Ban quản lý |
|-----------|:------:|:-----------:|
| Đăng ký / đăng nhập | ✅ | ✅ |
| Xem khoản thu | ✅ | ✅ |
| Tạo / sửa / xóa khoản thu | ❌ | ✅ |
| Nộp phí cho bản thân | ✅ | ✅ |
| Thu hộ cư dân khác | ❌ | ✅ |
| Xem thống kê | ✅ | ✅ |

## 🛠️ Chạy thủ công (không dùng Docker, để phát triển)

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API chạy tại <http://localhost:8000>, tài liệu tại <http://localhost:8000/docs>.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Giao diện chạy tại <http://localhost:5173> (Vite tự proxy `/api` sang backend cổng 8000).

## 📡 Tóm tắt API

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| POST | `/api/auth/register` | Đăng ký | Công khai |
| POST | `/api/auth/login` | Đăng nhập, nhận JWT | Công khai |
| GET  | `/api/auth/me` | Thông tin tài khoản | Đã đăng nhập |
| GET  | `/api/fees` | Danh sách khoản thu | Đã đăng nhập |
| POST | `/api/fees` | Tạo khoản thu | Admin |
| PUT/DELETE | `/api/fees/{id}` | Sửa / xóa khoản thu | Admin |
| GET  | `/api/payments` | Danh sách thu phí | Đã đăng nhập |
| POST | `/api/payments` | Ghi nhận thu phí | Đã đăng nhập |
| GET  | `/api/statistics` | Thống kê đóng góp | Đã đăng nhập |
| GET  | `/api/users` | Danh sách cư dân (thu hộ) | Admin |

## Ghi chú kỹ thuật

- Mật khẩu được hash bằng **pbkdf2_sha256** (thuần Python, không cần thư viện native).
- Trong production: đổi `SECRET_KEY`, cân nhắc bỏ mapping cổng `8000` của backend (chỉ để frontend truy cập nội bộ qua Nginx), và giới hạn CORS `allow_origins` theo domain thật.
