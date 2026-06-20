from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    history = relationship("ResumeHistory", back_populates="user", cascade="all, delete-orphan")


class ResumeHistory(Base):
    __tablename__ = "resume_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    jd_snippet = Column(String(200), nullable=False)
    filename = Column(String(255), nullable=False)
    original_text = Column(Text, nullable=False)
    customized_json = Column(Text, nullable=False)
    cover_letter = Column(Text, nullable=True)

    user = relationship("User", back_populates="history")
