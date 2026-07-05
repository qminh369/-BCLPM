from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field

from .models import RoleEnum, FeeCategory, PaymentStatus


# ---------- User / Auth ----------
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    apartment_code: Optional[str] = None
    role: RoleEnum = RoleEnum.resident


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    apartment_code: Optional[str] = None
    role: RoleEnum
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Fee (Khoản thu) ----------
class FeeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    amount: float = 0
    category: FeeCategory = FeeCategory.mandatory
    period: Optional[str] = None
    due_date: Optional[date] = None


class FeeOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    amount: float
    category: FeeCategory
    period: Optional[str]
    due_date: Optional[date]
    created_at: datetime
    # Số liệu tổng hợp
    total_collected: float = 0
    payment_count: int = 0

    class Config:
        from_attributes = True


# ---------- Payment (Thu phí) ----------
class PaymentCreate(BaseModel):
    fee_id: int
    user_id: Optional[int] = None   # Admin có thể thu hộ; nếu trống thì lấy user hiện tại
    amount: float
    note: Optional[str] = None
    status: PaymentStatus = PaymentStatus.paid


class PaymentOut(BaseModel):
    id: int
    fee_id: int
    user_id: int
    amount: float
    status: PaymentStatus
    note: Optional[str]
    paid_at: datetime
    fee_name: Optional[str] = None
    user_name: Optional[str] = None
    apartment_code: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Thống kê ----------
class FeeStat(BaseModel):
    fee_id: int
    fee_name: str
    category: FeeCategory
    total_collected: float
    payment_count: int


class StatisticsOut(BaseModel):
    total_collected: float
    total_payments: int
    total_fees: int
    mandatory_collected: float
    voluntary_collected: float
    by_fee: List[FeeStat]
