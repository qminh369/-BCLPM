from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Date, ForeignKey, Enum, Text,
)
from sqlalchemy.orm import relationship
import enum

from .database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"        # Ban quản lý
    resident = "resident"  # Cư dân


class FeeCategory(str, enum.Enum):
    mandatory = "mandatory"    # Khoản thu bắt buộc (phí quản lý, gửi xe...)
    voluntary = "voluntary"    # Khoản đóng góp tự nguyện (quỹ từ thiện...)


class PaymentStatus(str, enum.Enum):
    pending = "pending"    # Chưa thanh toán
    paid = "paid"          # Đã thu


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    apartment_code = Column(String, nullable=True)   # Mã căn hộ, vd: A-1201
    role = Column(Enum(RoleEnum), default=RoleEnum.resident, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    payments = relationship("Payment", back_populates="user")


class Fee(Base):
    """Khoản thu do Ban quản lý tạo ra."""
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)              # Tên khoản thu
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=False, default=0)  # Số tiền định mức
    category = Column(Enum(FeeCategory), default=FeeCategory.mandatory, nullable=False)
    period = Column(String, nullable=True)             # Kỳ thu, vd: "07/2026"
    due_date = Column(Date, nullable=True)             # Hạn nộp
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    payments = relationship("Payment", back_populates="fee", cascade="all, delete-orphan")


class Payment(Base):
    """Bản ghi thu phí / đóng góp của một cư dân cho một khoản thu."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    fee_id = Column(Integer, ForeignKey("fees.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False, default=0)  # Số tiền thực nộp
    status = Column(Enum(PaymentStatus), default=PaymentStatus.paid, nullable=False)
    note = Column(String, nullable=True)
    paid_at = Column(DateTime, default=datetime.utcnow)

    fee = relationship("Fee", back_populates="payments")
    user = relationship("User", back_populates="payments")
