import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Configuration
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    ENVIRONMENT: str = "development"
    
    # AI Service Configuration (FREE options)
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    # Free AI Options
    USE_OLLAMA: bool = True
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama2"
    
    HUGGINGFACE_API_KEY: str = ""
    HUGGINGFACE_MODEL: str = "microsoft/DialoGPT-medium"
    
    # TTS Configuration
    ELEVENLABS_API_KEY: str = ""
    USE_BROWSER_TTS: bool = True  # Fallback to browser TTS
    
    # Storage Configuration (Optional)
    DATABASE_URL: str = ""
    REDIS_URL: str = ""
    
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        if self.ENVIRONMENT == "development":
            return [
                "http://localhost:3000", 
                "http://127.0.0.1:3000",
                "http://localhost:5173", 
                "http://127.0.0.1:5173"
            ]
        return [self.FRONTEND_URL]
    
    @property
    def USE_OPENAI(self) -> bool:
        return bool(self.OPENAI_API_KEY)
    
    @property
    def USE_ANTHROPIC(self) -> bool:
        return bool(self.ANTHROPIC_API_KEY)
    
    @property
    def USE_ELEVENLABS(self) -> bool:
        return bool(self.ELEVENLABS_API_KEY)
        
    @property
    def USE_HUGGINGFACE(self) -> bool:
        return bool(self.HUGGINGFACE_API_KEY) or True  # HuggingFace works without API key with rate limits
        
    @property 
    def USE_LOCAL_AI(self) -> bool:
        return self.USE_OLLAMA
        
    @property
    def USE_REDIS(self) -> bool:
        return bool(self.REDIS_URL)
    
    class Config:
        env_file = ".env"

settings = Settings()