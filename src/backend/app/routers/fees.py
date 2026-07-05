from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/api/fees", tags=["fees"])


def _fee_to_out(db: Session, fee: models.Fee) -> schemas.FeeOut:
    total, count = (
        db.query(func.coalesce(func.sum(models.Payment.amount), 0), func.count(models.Payment.id))
        .filter(models.Payment.fee_id == fee.id, models.Payment.status == models.PaymentStatus.paid)
        .first()
    )
    out = schemas.FeeOut.model_validate(fee)
    out.total_collected = float(total or 0)
    out.payment_count = int(count or 0)
    return out


@router.get("", response_model=list[schemas.FeeOut])
def list_fees(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Danh sách khoản thu kèm số đã thu."""
    fees = db.query(models.Fee).order_by(models.Fee.created_at.desc()).all()
    return [_fee_to_out(db, f) for f in fees]


@router.post("", response_model=schemas.FeeOut, status_code=201)
def create_fee(
    payload: schemas.FeeCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    """Tạo khoản thu (chỉ Ban quản lý)."""
    fee = models.Fee(**payload.model_dump(), created_by=admin.id)
    db.add(fee)
    db.commit()
    db.refresh(fee)
    return _fee_to_out(db, fee)


@router.get("/{fee_id}", response_model=schemas.FeeOut)
def get_fee(fee_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    fee = db.query(models.Fee).filter(models.Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Không tìm thấy khoản thu")
    return _fee_to_out(db, fee)


@router.put("/{fee_id}", response_model=schemas.FeeOut)
def update_fee(
    fee_id: int,
    payload: schemas.FeeCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    fee = db.query(models.Fee).filter(models.Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Không tìm thấy khoản thu")
    for k, v in payload.model_dump().items():
        setattr(fee, k, v)
    db.commit()
    db.refresh(fee)
    return _fee_to_out(db, fee)


@router.delete("/{fee_id}", status_code=204)
def delete_fee(fee_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    fee = db.query(models.Fee).filter(models.Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Không tìm thấy khoản thu")
    db.delete(fee)
    db.commit()
