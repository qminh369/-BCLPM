from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import require_admin

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Danh sách cư dân (dùng cho chức năng thu hộ) — chỉ Ban quản lý."""
    return db.query(models.User).order_by(models.User.full_name).all()
