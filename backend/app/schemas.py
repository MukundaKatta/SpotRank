from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ── Auth schemas ──────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    role: str
    subscription_plan: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


# ── Competitor schema ─────────────────────────────────────────

class Competitor(BaseModel):
    name: str
    gbp_url: Optional[str] = None
    notes: Optional[str] = None


# ── Business schemas ──────────────────────────────────────────

class BusinessBase(BaseModel):
    name: str
    website: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    gbp_url: Optional[str] = None
    service_areas: Optional[List[str]] = []
    target_keywords: Optional[List[str]] = []
    competitors: Optional[List[Dict[str, str]]] = []
    core_services: Optional[List[str]] = []
    unique_selling_points: Optional[str] = None
    current_gbp_category: Optional[str] = None
    current_secondary_categories: Optional[List[str]] = []


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    gbp_url: Optional[str] = None
    service_areas: Optional[List[str]] = None
    target_keywords: Optional[List[str]] = None
    competitors: Optional[List[Dict[str, str]]] = None
    core_services: Optional[List[str]] = None
    unique_selling_points: Optional[str] = None
    current_gbp_category: Optional[str] = None
    current_secondary_categories: Optional[List[str]] = None


class Business(BusinessBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Generated Content schemas ─────────────────────────────────

class GeneratedContentCreate(BaseModel):
    business_id: int
    prompt_type: str
    week_number: Optional[int] = None
    content: Dict[str, Any]
    notes: Optional[str] = None


class GeneratedContentUpdate(BaseModel):
    content: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class GeneratedContent(BaseModel):
    id: int
    business_id: int
    prompt_type: str
    week_number: Optional[int] = None
    content: Dict[str, Any]
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Progress schemas ──────────────────────────────────────────

class ProgressCreate(BaseModel):
    business_id: int
    week_number: int
    prompt_number: int
    prompt_type: str
    completed: bool = False


class ProgressUpdate(BaseModel):
    completed: bool


class Progress(BaseModel):
    id: int
    business_id: int
    week_number: int
    prompt_number: int
    prompt_type: str
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Prompt execution schemas ──────────────────────────────────

class PromptExecuteRequest(BaseModel):
    business_id: int
    prompt_type: str
    additional_context: Optional[Dict[str, Any]] = None


class PromptExecuteResponse(BaseModel):
    success: bool
    prompt_type: str
    content: Dict[str, Any]
    message: Optional[str] = None
