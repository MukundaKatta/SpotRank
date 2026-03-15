from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db
from ..services.claude_service import claude_service

router = APIRouter(
    prefix="/api/prompts",
    tags=["prompts"]
)


@router.post("/execute", response_model=schemas.PromptExecuteResponse)
async def execute_prompt(
    request: schemas.PromptExecuteRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Execute a specific prompt and generate content"""
    # Get business data
    business = crud.get_business(db=db, business_id=request.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Convert business model to dict for claude service
    business_dict = {
        "id": business.id,
        "name": business.name,
        "website": business.website,
        "location": business.location,
        "address": business.address,
        "phone": business.phone,
        "gbp_url": business.gbp_url,
        "service_areas": business.service_areas or [],
        "target_keywords": business.target_keywords or [],
        "competitors": business.competitors or [],
        "core_services": business.core_services or [],
        "unique_selling_points": business.unique_selling_points,
        "current_gbp_category": business.current_gbp_category,
        "current_secondary_categories": business.current_secondary_categories or [],
    }

    # Add any additional context from request
    if request.additional_context:
        business_dict.update(request.additional_context)

    try:
        # Execute the prompt
        result = claude_service.execute_prompt(request.prompt_type, business_dict)

        # Save the generated content
        content_data = schemas.GeneratedContentCreate(
            business_id=request.business_id,
            prompt_type=request.prompt_type,
            week_number=crud.get_week_for_prompt(request.prompt_type),
            content={"generated_text": result["content"]}
        )
        crud.create_generated_content(db=db, content=content_data)

        # Mark prompt as complete in background
        background_tasks.add_task(
            crud.mark_prompt_complete,
            db=db,
            business_id=request.business_id,
            prompt_type=request.prompt_type
        )

        return schemas.PromptExecuteResponse(
            success=True,
            prompt_type=request.prompt_type,
            content={"generated_text": result["content"]},
            message="Content generated successfully"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating content: {str(e)}"
        )


@router.get("/types")
def get_prompt_types():
    """Get list of available prompt types"""
    return {
        "prompt_types": [
            {
                "id": "gbp_category_audit",
                "name": "GBP Category Audit",
                "description": "Analyze and optimize Google Business Profile categories",
                "week": 1,
                "prompt_number": 1
            },
            {
                "id": "gbp_attributes_audit",
                "name": "GBP Attributes Audit",
                "description": "Review and optimize Google Business Profile attributes",
                "week": 1,
                "prompt_number": 2
            },
            {
                "id": "services_optimization",
                "name": "Services Section Optimization",
                "description": "Create optimized service descriptions",
                "week": 2,
                "prompt_number": 1
            },
            {
                "id": "description_optimization",
                "name": "GBP Description Optimization",
                "description": "Generate optimized business descriptions",
                "week": 2,
                "prompt_number": 2
            },
            {
                "id": "competitor_review_teardown",
                "name": "Competitor Review Teardown",
                "description": "Analyze competitor reviews and build review strategy",
                "week": 3,
                "prompt_number": 1
            },
            {
                "id": "review_response_templates",
                "name": "Review Response Templates",
                "description": "Generate templates for responding to reviews",
                "week": 3,
                "prompt_number": 2
            },
            {
                "id": "posts_calendar",
                "name": "GBP Posts Calendar",
                "description": "Create 8-week posting calendar",
                "week": 4,
                "prompt_number": 1
            },
            {
                "id": "photo_strategy",
                "name": "Photo Strategy",
                "description": "Develop 8-week photo upload plan",
                "week": 4,
                "prompt_number": 2
            }
        ]
    }


@router.get("/progress/{business_id}", response_model=List[schemas.Progress])
def get_progress(business_id: int, db: Session = Depends(get_db)):
    """Get progress for a business"""
    # Verify business exists
    business = crud.get_business(db=db, business_id=business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    return crud.get_business_progress(db=db, business_id=business_id)


@router.put("/progress/{progress_id}", response_model=schemas.Progress)
def update_progress(
    progress_id: int,
    progress: schemas.ProgressUpdate,
    db: Session = Depends(get_db)
):
    """Update progress status"""
    updated_progress = crud.update_progress(db=db, progress_id=progress_id, progress=progress)
    if not updated_progress:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    return updated_progress
