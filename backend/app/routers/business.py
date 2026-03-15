from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/api/business",
    tags=["business"]
)


@router.post("/", response_model=schemas.Business, status_code=status.HTTP_201_CREATED)
def create_business(business: schemas.BusinessCreate, db: Session = Depends(get_db)):
    """Create a new business profile"""
    return crud.create_business(db=db, business=business)


@router.get("/", response_model=List[schemas.Business])
def list_businesses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all business profiles"""
    return crud.get_businesses(db=db, skip=skip, limit=limit)


@router.get("/{business_id}", response_model=schemas.Business)
def get_business(business_id: int, db: Session = Depends(get_db)):
    """Get a specific business profile"""
    business = crud.get_business(db=db, business_id=business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business


@router.put("/{business_id}", response_model=schemas.Business)
def update_business(business_id: int, business: schemas.BusinessUpdate, db: Session = Depends(get_db)):
    """Update a business profile"""
    updated_business = crud.update_business(db=db, business_id=business_id, business=business)
    if not updated_business:
        raise HTTPException(status_code=404, detail="Business not found")
    return updated_business


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(business_id: int, db: Session = Depends(get_db)):
    """Delete a business profile"""
    success = crud.delete_business(db=db, business_id=business_id)
    if not success:
        raise HTTPException(status_code=404, detail="Business not found")
    return None
