from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/statistics", tags=["statistics"])


@router.get("", response_model=schemas.StatisticsOut)
def statistics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Thống kê các khoản đóng góp / thu phí."""
    paid = models.PaymentStatus.paid

    total_collected = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(
        models.Payment.status == paid
    ).scalar() or 0

    total_payments = db.query(func.count(models.Payment.id)).filter(
        models.Payment.status == paid
    ).scalar() or 0

    total_fees = db.query(func.count(models.Fee.id)).scalar() or 0

    # Tổng theo loại khoản thu
    def sum_by_category(cat):
        return db.query(func.coalesce(func.sum(models.Payment.amount), 0)).join(
            models.Fee, models.Fee.id == models.Payment.fee_id
        ).filter(
            models.Payment.status == paid, models.Fee.category == cat
        ).scalar() or 0

    mandatory = sum_by_category(models.FeeCategory.mandatory)
    voluntary = sum_by_category(models.FeeCategory.voluntary)

    # Chi tiết theo từng khoản thu
    rows = (
        db.query(
            models.Fee.id,
            models.Fee.name,
            models.Fee.category,
            func.coalesce(func.sum(models.Payment.amount), 0),
            func.count(models.Payment.id),
        )
        .outerjoin(
            models.Payment,
            (models.Payment.fee_id == models.Fee.id) & (models.Payment.status == paid),
        )
        .group_by(models.Fee.id)
        .all()
    )

    by_fee = [
        schemas.FeeStat(
            fee_id=r[0],
            fee_name=r[1],
            category=r[2],
            total_collected=float(r[3] or 0),
            payment_count=int(r[4] or 0),
        )
        for r in rows
    ]

    return schemas.StatisticsOut(
        total_collected=float(total_collected),
        total_payments=int(total_payments),
        total_fees=int(total_fees),
        mandatory_collected=float(mandatory),
        voluntary_collected=float(voluntary),
        by_fee=by_fee,
    )
