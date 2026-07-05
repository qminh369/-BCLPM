from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _payment_to_out(p: models.Payment) -> schemas.PaymentOut:
    out = schemas.PaymentOut.model_validate(p)
    out.fee_name = p.fee.name if p.fee else None
    out.user_name = p.user.full_name if p.user else None
    out.apartment_code = p.user.apartment_code if p.user else None
    return out


@router.get("", response_model=list[schemas.PaymentOut])
def list_payments(
    fee_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Danh sách các lần thu phí.

    - Admin: xem tất cả.
    - Cư dân: chỉ xem của mình.
    """
    query = db.query(models.Payment)
    if current_user.role != models.RoleEnum.admin:
        query = query.filter(models.Payment.user_id == current_user.id)
    if fee_id:
        query = query.filter(models.Payment.fee_id == fee_id)
    payments = query.order_by(models.Payment.paid_at.desc()).all()
    return [_payment_to_out(p) for p in payments]


@router.post("", response_model=schemas.PaymentOut, status_code=201)
def create_payment(
    payload: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Ghi nhận thu phí / đóng góp.

    - Cư dân tự nộp cho chính mình.
    - Admin có thể thu hộ bằng cách chỉ định user_id.
    """
    fee = db.query(models.Fee).filter(models.Fee.id == payload.fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Không tìm thấy khoản thu")

    target_user_id = payload.user_id or current_user.id
    if payload.user_id and payload.user_id != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Bạn không có quyền thu hộ người khác")

    target = db.query(models.User).filter(models.User.id == target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Không tìm thấy cư dân")

    payment = models.Payment(
        fee_id=payload.fee_id,
        user_id=target_user_id,
        amount=payload.amount,
        note=payload.note,
        status=payload.status,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return _payment_to_out(payment)


@router.delete("/{payment_id}", status_code=204)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi")
    if current_user.role != models.RoleEnum.admin and payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Không có quyền xóa")
    db.delete(payment)
    db.commit()
