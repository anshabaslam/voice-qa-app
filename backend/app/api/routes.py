from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from typing import List
import os
from app.models.schemas import (
    LinkInput, ExtractionResponse, QuestionInput, 
    AnswerResponse, TTSRequest, TTSResponse, HealthCheck
)
from app.services.content_extractor import ContentExtractorService
from app.services.ai_service import AIService
from app.services.tts_service import TTSService

router = APIRouter()

@router.post("/links", response_model=ExtractionResponse)
async def extract_content(link_input: LinkInput):
    try:
        extractor = ContentExtractorService()
        result = await extractor.extract_from_urls(link_input.urls)
        
        # Store context for AI service if extraction was successful
        if result.success and result.extracted_content:
            ai_service = AIService()
            # Generate a simple session ID
            import uuid
            session_id = str(uuid.uuid4())[:8]  # Short session ID
            
            context_data = [
                {
                    "url": content.url,
                    "title": content.title,
                    "content": content.content
                }
                for content in result.extracted_content if content.success
            ]
            await ai_service.store_context(session_id, context_data)
            result.session_id = session_id
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content extraction failed: {str(e)}")

@router.post("/ask", response_model=AnswerResponse)
async def ask_question(question_input: QuestionInput):
    try:
        ai_service = AIService()
        result = await ai_service.answer_question(
            question_input.question,
            session_id=question_input.session_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question processing failed: {str(e)}")

@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(tts_request: TTSRequest):
    try:
        tts_service = TTSService()
        result = await tts_service.generate_speech(
            tts_request.text,
            voice_id=tts_request.voice_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@router.post("/upload-audio")
async def upload_audio(audio: UploadFile = File(...)):
    try:
        ai_service = AIService()
        question = await ai_service.transcribe_audio(audio)
        return {"question": question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {str(e)}")

@router.get("/voices")
async def get_voices():
    try:
        tts_service = TTSService()
        voices = await tts_service.get_available_voices()
        return {"voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get voices: {str(e)}")

@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    # Clean up old audio files (older than 1 hour)
    import glob
    import time
    current_time = time.time()
    for old_file in glob.glob("/tmp/tts_*.mp3"):
        try:
            file_age = current_time - os.path.getmtime(old_file)
            if file_age > 3600:  # 1 hour
                os.remove(old_file)
        except:
            pass
    
    file_path = f"/tmp/{filename.split('?')[0]}"  # Remove query params
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/mpeg")
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")

@router.get("/health", response_model=HealthCheck)
async def health_check():
    return HealthCheck(
        status="healthy",
        version="1.0.0",
        services={
            "content_extractor": "active",
            "ai_service": "active",
            "tts_service": "active"
        }
    )