import httpx
import uuid
from typing import Optional
from app.models.schemas import TTSResponse
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Optional import for OpenAI
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

class TTSService:
    def __init__(self):
        self.openai_client = None
        self.elevenlabs_client = None
        
        # Initialize OpenAI if available and configured
        if OPENAI_AVAILABLE and settings.USE_OPENAI and settings.OPENAI_API_KEY:
            self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Initialize ElevenLabs if configured
        if settings.USE_ELEVENLABS and settings.ELEVENLABS_API_KEY:
            self.elevenlabs_client = httpx.AsyncClient(
                base_url="https://api.elevenlabs.io/v1",
                headers={"xi-api-key": settings.ELEVENLABS_API_KEY}
            )
    
    async def generate_speech(self, text: str, voice_id: Optional[str] = None) -> TTSResponse:
        # Try ElevenLabs first (if configured)
        if self.elevenlabs_client:
            try:
                return await self._generate_with_elevenlabs(text, voice_id)
            except Exception as e:
                logger.warning(f"ElevenLabs TTS failed: {e}")
        
        # Try OpenAI TTS (if configured)
        if self.openai_client:
            try:
                return await self._generate_with_openai(text)
            except Exception as e:
                logger.warning(f"OpenAI TTS failed: {e}")
        
        # Always fallback to browser TTS (client-side) - this is FREE
        logger.info("Using browser TTS fallback (free)")
        return TTSResponse(
            audio_url="",  # Empty URL indicates client-side TTS should be used
            duration=self._estimate_duration(text)
        )
    
    async def _generate_with_elevenlabs(self, text: str, voice_id: Optional[str] = None) -> TTSResponse:
        if not voice_id:
            voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice (default)
        
        try:
            response = await self.elevenlabs_client.post(
                f"/text-to-speech/{voice_id}",
                json={
                    "text": text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.5,
                        "style": 0.0,
                        "use_speaker_boost": True
                    }
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"ElevenLabs API error: {response.status_code}")
            
            # Save audio file
            audio_filename = f"tts_{uuid.uuid4().hex}.mp3"
            audio_path = f"/tmp/{audio_filename}"
            
            with open(audio_path, "wb") as f:
                f.write(response.content)
            
            # In production, you'd upload this to a CDN or serve it statically
            audio_url = f"/api/audio/{audio_filename}"
            
            return TTSResponse(
                audio_url=audio_url,
                duration=self._estimate_duration(text)
            )
            
        except Exception as e:
            logger.error(f"ElevenLabs TTS error: {e}")
            raise
    
    async def _generate_with_openai(self, text: str) -> TTSResponse:
        try:
            response = await self.openai_client.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=text,
                response_format="mp3"
            )
            
            # Save audio file
            audio_filename = f"tts_{uuid.uuid4().hex}.mp3"
            audio_path = f"/tmp/{audio_filename}"
            
            with open(audio_path, "wb") as f:
                async for chunk in response.iter_bytes():
                    f.write(chunk)
            
            # In production, you'd upload this to a CDN or serve it statically
            audio_url = f"/api/audio/{audio_filename}"
            
            return TTSResponse(
                audio_url=audio_url,
                duration=self._estimate_duration(text)
            )
            
        except Exception as e:
            logger.error(f"OpenAI TTS error: {e}")
            raise
    
    def _estimate_duration(self, text: str) -> float:
        # Rough estimate: 150 words per minute, average 5 characters per word
        words = len(text) / 5
        return (words / 150) * 60  # Convert to seconds
    
    async def get_available_voices(self) -> list:
        if self.elevenlabs_client:
            try:
                response = await self.elevenlabs_client.get("/voices")
                if response.status_code == 200:
                    data = response.json()
                    return [
                        {"id": voice["voice_id"], "name": voice["name"]}
                        for voice in data.get("voices", [])
                    ]
            except Exception as e:
                logger.error(f"Failed to get ElevenLabs voices: {e}")
        
        # OpenAI TTS voices
        return [
            {"id": "alloy", "name": "Alloy"},
            {"id": "echo", "name": "Echo"},
            {"id": "fable", "name": "Fable"},
            {"id": "onyx", "name": "Onyx"},
            {"id": "nova", "name": "Nova"},
            {"id": "shimmer", "name": "Shimmer"}
        ]
    
    async def close(self):
        if self.elevenlabs_client:
            await self.elevenlabs_client.aclose()