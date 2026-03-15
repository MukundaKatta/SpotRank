from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/api/content",
    tags=["content"]
)


@router.post("/", response_model=schemas.GeneratedContent, status_code=status.HTTP_201_CREATED)
def create_content(content: schemas.GeneratedContentCreate, db: Session = Depends(get_db)):
    """Save generated content"""
    return crud.create_generated_content(db=db, content=content)


@router.get("/{content_id}", response_model=schemas.GeneratedContent)
def get_content(content_id: int, db: Session = Depends(get_db)):
    """Get specific generated content"""
    content = crud.get_generated_content(db=db, content_id=content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


@router.get("/business/{business_id}", response_model=List[schemas.GeneratedContent])
def get_business_content(business_id: int, prompt_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all generated content for a business"""
    # Verify business exists
    business = crud.get_business(db=db, business_id=business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    return crud.get_business_content(db=db, business_id=business_id, prompt_type=prompt_type)


@router.put("/{content_id}", response_model=schemas.GeneratedContent)
def update_content(content_id: int, content: schemas.GeneratedContentUpdate, db: Session = Depends(get_db)):
    """Update generated content"""
    updated_content = crud.update_generated_content(db=db, content_id=content_id, content=content)
    if not updated_content:
        raise HTTPException(status_code=404, detail="Content not found")
    return updated_content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(content_id: int, db: Session = Depends(get_db)):
    """Delete generated content"""
    success = crud.delete_generated_content(db=db, content_id=content_id)
    if not success:
        raise HTTPException(status_code=404, detail="Content not found")
    return None
