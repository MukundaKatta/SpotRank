from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from . import models, schemas


# Business CRUD operations
def create_business(db: Session, business: schemas.BusinessCreate, user_id: int = None) -> models.Business:
    """Create a new business profile"""
    db_business = models.Business(**business.model_dump(), user_id=user_id)
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business


def get_business(db: Session, business_id: int) -> Optional[models.Business]:
    """Get a business by ID"""
    return db.query(models.Business).filter(models.Business.id == business_id).first()


def get_businesses(db: Session, user_id: int = None, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[models.Business]:
    """Get businesses with pagination and optional search, scoped to user."""
    query = db.query(models.Business)
    if user_id is not None:
        query = query.filter(
            (models.Business.user_id == user_id) | (models.Business.user_id == None)
        )
    if search:
        query = query.filter(models.Business.name.ilike(f"%{search}%"))
    return query.order_by(models.Business.created_at.desc()).offset(skip).limit(limit).all()


def update_business(db: Session, business_id: int, business: schemas.BusinessUpdate) -> Optional[models.Business]:
    """Update a business profile"""
    db_business = get_business(db, business_id)
    if not db_business:
        return None

    update_data = business.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_business, field, value)

    db.commit()
    db.refresh(db_business)
    return db_business


def delete_business(db: Session, business_id: int) -> bool:
    """Delete a business profile"""
    db_business = get_business(db, business_id)
    if not db_business:
        return False

    db.delete(db_business)
    db.commit()
    return True


# Generated Content CRUD operations
def create_generated_content(db: Session, content: schemas.GeneratedContentCreate) -> models.GeneratedContent:
    """Create generated content"""
    db_content = models.GeneratedContent(**content.model_dump())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content


def get_generated_content(db: Session, content_id: int) -> Optional[models.GeneratedContent]:
    """Get generated content by ID"""
    return db.query(models.GeneratedContent).filter(models.GeneratedContent.id == content_id).first()


def get_business_content(db: Session, business_id: int, prompt_type: Optional[str] = None) -> List[models.GeneratedContent]:
    """Get all generated content for a business, optionally filtered by prompt type"""
    query = db.query(models.GeneratedContent).filter(models.GeneratedContent.business_id == business_id)

    if prompt_type:
        query = query.filter(models.GeneratedContent.prompt_type == prompt_type)

    return query.order_by(models.GeneratedContent.created_at.desc()).all()


def update_generated_content(db: Session, content_id: int, content: schemas.GeneratedContentUpdate) -> Optional[models.GeneratedContent]:
    """Update generated content"""
    db_content = get_generated_content(db, content_id)
    if not db_content:
        return None

    update_data = content.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_content, field, value)

    db.commit()
    db.refresh(db_content)
    return db_content


def delete_generated_content(db: Session, content_id: int) -> bool:
    """Delete generated content"""
    db_content = get_generated_content(db, content_id)
    if not db_content:
        return False

    db.delete(db_content)
    db.commit()
    return True


# Progress CRUD operations
def create_progress(db: Session, progress: schemas.ProgressCreate) -> models.Progress:
    """Create progress entry"""
    db_progress = models.Progress(**progress.model_dump())
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress


def get_business_progress(db: Session, business_id: int) -> List[models.Progress]:
    """Get all progress entries for a business"""
    return db.query(models.Progress).filter(models.Progress.business_id == business_id).all()


def get_progress_by_prompt(db: Session, business_id: int, prompt_type: str) -> Optional[models.Progress]:
    """Get progress for a specific prompt"""
    return db.query(models.Progress).filter(
        models.Progress.business_id == business_id,
        models.Progress.prompt_type == prompt_type
    ).first()


def update_progress(db: Session, progress_id: int, progress: schemas.ProgressUpdate) -> Optional[models.Progress]:
    """Update progress entry"""
    db_progress = db.query(models.Progress).filter(models.Progress.id == progress_id).first()
    if not db_progress:
        return None

    update_data = progress.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_progress, field, value)

    if progress.completed:
        db_progress.completed_at = func.now()

    db.commit()
    db.refresh(db_progress)
    return db_progress


def mark_prompt_complete(db: Session, business_id: int, prompt_type: str) -> models.Progress:
    """Mark a prompt as complete"""
    db_progress = get_progress_by_prompt(db, business_id, prompt_type)

    if db_progress:
        db_progress.completed = True
        db_progress.completed_at = func.now()
    else:
        db_progress = models.Progress(
            business_id=business_id,
            prompt_type=prompt_type,
            week_number=get_week_for_prompt(prompt_type),
            prompt_number=get_prompt_number(prompt_type),
            completed=True,
            completed_at=func.now()
        )
        db.add(db_progress)

    db.commit()
    db.refresh(db_progress)
    return db_progress


# Analytics queries
def get_dashboard_analytics(db: Session, user_id: int = None) -> dict:
    """Get dashboard analytics data, scoped to user."""
    biz_query = db.query(models.Business)
    if user_id is not None:
        biz_query = biz_query.filter(
            (models.Business.user_id == user_id) | (models.Business.user_id == None)
        )
    user_biz_ids = [b.id for b in biz_query.all()]

    total_businesses = len(user_biz_ids)

    if user_biz_ids:
        total_content = db.query(func.count(models.GeneratedContent.id)).filter(
            models.GeneratedContent.business_id.in_(user_biz_ids)
        ).scalar()
        total_progress = db.query(func.count(models.Progress.id)).filter(
            models.Progress.completed == True,
            models.Progress.business_id.in_(user_biz_ids),
        ).scalar()
    else:
        total_content = 0
        total_progress = 0

    total_possible = total_businesses * 8 if total_businesses else 0
    completion_rate = round((total_progress / total_possible) * 100) if total_possible > 0 else 0

    # Recent activity
    recent_query = db.query(models.GeneratedContent)
    if user_biz_ids:
        recent_query = recent_query.filter(models.GeneratedContent.business_id.in_(user_biz_ids))
    recent = recent_query.order_by(
        models.GeneratedContent.created_at.desc()
    ).limit(5).all()

    recent_activity = []
    for item in recent:
        biz = get_business(db, item.business_id)
        recent_activity.append({
            "id": item.id,
            "business_name": biz.name if biz else "Unknown",
            "prompt_type": item.prompt_type,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        })

    return {
        "total_businesses": total_businesses,
        "total_content_generated": total_content,
        "completion_rate": completion_rate,
        "recent_activity": recent_activity,
    }


def get_week_for_prompt(prompt_type: str) -> int:
    """Map prompt type to week number"""
    week_mapping = {
        "gbp_category_audit": 1,
        "gbp_attributes_audit": 1,
        "services_optimization": 2,
        "description_optimization": 2,
        "competitor_review_teardown": 3,
        "review_response_templates": 3,
        "posts_calendar": 4,
        "photo_strategy": 4,
    }
    return week_mapping.get(prompt_type, 1)


def get_prompt_number(prompt_type: str) -> int:
    """Map prompt type to prompt number within the week"""
    prompt_mapping = {
        "gbp_category_audit": 1,
        "gbp_attributes_audit": 2,
        "services_optimization": 1,
        "description_optimization": 2,
        "competitor_review_teardown": 1,
        "review_response_templates": 2,
        "posts_calendar": 1,
        "photo_strategy": 2,
    }
    return prompt_mapping.get(prompt_type, 1)
