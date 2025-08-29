from typing import List, Optional
from pydantic import BaseModel, HttpUrl, validator

class LinkInput(BaseModel):
    urls: List[HttpUrl]
    
    @validator('urls')
    def validate_urls(cls, v):
        if len(v) < 3:
            raise ValueError('At least 3 URLs are required')
        if len(v) > 10:
            raise ValueError('Maximum 10 URLs allowed')
        return v

class ExtractedContent(BaseModel):
    url: str
    title: str
    content: str
    success: bool
    error_message: Optional[str] = None
    word_count: int = 0

class ExtractionResponse(BaseModel):
    success: bool
    extracted_content: List[ExtractedContent]
    total_word_count: int
    failed_urls: List[str] = []
    session_id: Optional[str] = None

class QuestionInput(BaseModel):
    question: str
    session_id: Optional[str] = None
    
    @validator('question')
    def validate_question(cls, v):
        if not v.strip():
            raise ValueError('Question cannot be empty')
        if len(v.strip()) < 3:
            raise ValueError('Question must be at least 3 characters long')
        return v.strip()

class AnswerResponse(BaseModel):
    answer: str
    sources: List[str]
    session_id: str
    confidence: Optional[float] = None

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    
    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty')
        if len(v) > 5000:
            raise ValueError('Text too long (max 5000 characters)')
        return v.strip()

class TTSResponse(BaseModel):
    audio_url: str
    duration: Optional[float] = None

class HealthCheck(BaseModel):
    status: str
    version: str
    services: dict