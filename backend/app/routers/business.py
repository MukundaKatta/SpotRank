from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/api/business",
    tags=["business"]
)


@router.post("/", response_model=schemas.Business, status_code=status.HTTP_201_CREATED)
def create_business(
    business: schemas.BusinessCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new business profile owned by the current user."""
    return crud.create_business(db=db, business=business, user_id=current_user.id)


@router.get("/", response_model=List[schemas.Business])
def list_businesses(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List businesses owned by the current user."""
    return crud.get_businesses(db=db, user_id=current_user.id, skip=skip, limit=limit, search=search)


@router.get("/{business_id}", response_model=schemas.Business)
def get_business(
    business_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific business profile (must be owned by current user)."""
    business = crud.get_business(db=db, business_id=business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business.user_id and business.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this business")
    return business


@router.put("/{business_id}", response_model=schemas.Business)
def update_business(
    business_id: int,
    business: schemas.BusinessUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a business profile (must be owned by current user)."""
    existing = crud.get_business(db=db, business_id=business_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Business not found")
    if existing.user_id and existing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to modify this business")
    return crud.update_business(db=db, business_id=business_id, business=business)


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(
    business_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a business profile (must be owned by current user)."""
    existing = crud.get_business(db=db, business_id=business_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Business not found")
    if existing.user_id and existing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this business")
    crud.delete_business(db=db, business_id=business_id)
    return None


# Analytics
analytics_router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@analytics_router.get("/dashboard")
def get_dashboard_analytics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard analytics for the current user's businesses."""
    return crud.get_dashboard_analytics(db=db, user_id=current_user.id)
