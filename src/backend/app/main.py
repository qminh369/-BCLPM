from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models  # noqa: F401  (đăng ký models với Base)
from .routers import auth, fees, payments, stats, users
from .seed import seed_admin

# Tạo bảng nếu chưa tồn tại
Base.metadata.create_all(bind=engine)
seed_admin()

app = FastAPI(title="API Quản lý Chung cư", version="1.0.0")

# CORS — cho phép frontend gọi API (điều chỉnh theo domain khi triển khai thật)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(fees.router)
app.include_router(payments.router)
app.include_router(stats.router)
app.include_router(users.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
