"""Schemas for feedback requests and responses."""

from enum import Enum
from pydantic import BaseModel, EmailStr

class FeedbackType(str, Enum):
    SUGGESTION = 'suggestion'
    BUG = 'bug'
    GENERAL = 'general'


class FeedbackResponse(BaseModel):
    """Schema for feedback response."""
    id: int | None = None
    message: str = "Feedback sent successfully"
