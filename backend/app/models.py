from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    """User account model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    role = Column(String, default="client")  # admin / client
    subscription_plan = Column(String, default="free")  # free / pro / agency
    stripe_customer_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    businesses = relationship("Business", back_populates="owner", cascade="all, delete-orphan")


class Business(Base):
    """Business profile model"""
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for migration compat
    name = Column(String, nullable=False)
    website = Column(String)
    location = Column(String)
    address = Column(Text)
    phone = Column(String)
    gbp_url = Column(String)  # Google Business Profile URL
    service_areas = Column(JSON)  # List of service areas
    target_keywords = Column(JSON)  # List of target keywords
    competitors = Column(JSON)  # List of competitor objects
    core_services = Column(JSON)  # List of services
    unique_selling_points = Column(Text)
    current_gbp_category = Column(String)
    current_secondary_categories = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="businesses")
    generated_content = relationship("GeneratedContent", back_populates="business", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="business", cascade="all, delete-orphan")


class GeneratedContent(Base):
    """Store AI-generated content"""
    __tablename__ = "generated_content"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    prompt_type = Column(String, nullable=False)
    week_number = Column(Integer)
    content = Column(JSON)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    business = relationship("Business", back_populates="generated_content")


class Progress(Base):
    """Track user progress through the playbook"""
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    prompt_number = Column(Integer, nullable=False)
    prompt_type = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    business = relationship("Business", back_populates="progress")
