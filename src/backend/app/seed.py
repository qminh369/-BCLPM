"""Khởi tạo dữ liệu mẫu: một tài khoản Ban quản lý mặc định."""
from sqlalchemy.orm import Session

from . import models
from .database import SessionLocal
from .auth import hash_password


def seed_admin():
    db: Session = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.role == models.RoleEnum.admin).first()
        if not admin:
            admin = models.User(
                full_name="Ban Quản Lý",
                email="admin@chungcu.vn",
                hashed_password=hash_password("admin123"),
                apartment_code="BQL",
                role=models.RoleEnum.admin,
            )
            db.add(admin)
            db.commit()
            print("[seed] Đã tạo tài khoản admin mặc định: admin@chungcu.vn / admin123")
    finally:
        db.close()
