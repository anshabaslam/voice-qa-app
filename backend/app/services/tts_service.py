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
                base_url="https://api.elevenlabs.io",  # Remove /v1 from base URL to support both v1 and v2
                headers={"xi-api-key": settings.ELEVENLABS_API_KEY}
            )
    
    async def generate_speech(self, text: str, voice_id: Optional[str] = None) -> TTSResponse:
        logger.info(f"🔊 TTS Request: text='{text[:30]}...', voice_id='{voice_id}'")
        
        # Try ElevenLabs first (if configured)
        if self.elevenlabs_client:
            logger.info("🎯 Trying ElevenLabs TTS...")
            try:
                return await self._generate_with_elevenlabs(text, voice_id)
            except Exception as e:
                logger.warning(f"ElevenLabs TTS failed: {e}")
        else:
            logger.info("❌ ElevenLabs client not configured")
        
        # Try OpenAI TTS (if configured)
        if self.openai_client:
            logger.info("🎯 Trying OpenAI TTS...")
            try:
                return await self._generate_with_openai(text)
            except Exception as e:
                logger.warning(f"OpenAI TTS failed: {e}")
        else:
            logger.info("❌ OpenAI client not configured")
        
        # Always fallback to browser TTS (client-side) - this is FREE
        logger.info("🌐 Using browser TTS fallback (free)")
        return TTSResponse(
            audio_url="",  # Empty URL indicates client-side TTS should be used
            duration=self._estimate_duration(text)
        )
    
    async def _generate_with_elevenlabs(self, text: str, voice_id: Optional[str] = None) -> TTSResponse:
        logger.info(f"🎤 ElevenLabs TTS Debug:")
        logger.info(f"   - Received voice_id: '{voice_id}'")
        logger.info(f"   - Text: '{text[:50]}{'...' if len(text) > 50 else ''}'")
        if not voice_id:
            voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice (default)
        logger.info(f"   - Using voice_id: '{voice_id}'")
        
        # Try to get voice-specific settings from API
        voice_settings = {"stability": 0.5, "similarity_boost": 0.5, "style": 0.0}
        model_id = "eleven_monolingual_v1"
        
        try:
            # Get voice-specific settings from the API
            voice_response = await self.elevenlabs_client.get(f"/v1/voices/{voice_id}")
            if voice_response.status_code == 200:
                voice_data = voice_response.json()
                api_settings = voice_data.get("settings", {})
                
                # Use API-provided settings for maximum distinctiveness
                if api_settings:
                    voice_settings = {
                        "stability": api_settings.get("stability", 0.5),
                        "similarity_boost": api_settings.get("similarity_boost", 0.5), 
                        "style": api_settings.get("style", 0.0)
                    }
                
                # Choose model based on voice labels
                labels = voice_data.get("labels", {})
                accent = labels.get("accent", "american").lower()
                
                # Use multilingual model for non-American accents for better pronunciation
                if accent in ["british", "australian", "irish", "scottish", "canadian"]:
                    model_id = "eleven_multilingual_v2"
                else:
                    model_id = "eleven_monolingual_v1"
                    
        except Exception as e:
            logger.warning(f"Could not get voice settings for {voice_id}: {e}")
        
        try:
            response = await self.elevenlabs_client.post(
                f"/v1/text-to-speech/{voice_id}",
                json={
                    "text": text,
                    "model_id": model_id,
                    "voice_settings": {
                        "stability": voice_settings["stability"],
                        "similarity_boost": voice_settings["similarity_boost"],
                        "style": voice_settings["style"],
                        "use_speaker_boost": True
                    }
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"ElevenLabs API error: {response.status_code}")
            
            # Save audio file with timestamp for cache busting
            import time
            timestamp = int(time.time() * 1000)  # milliseconds
            audio_filename = f"tts_{voice_id}_{timestamp}_{uuid.uuid4().hex[:8]}.mp3"
            audio_path = f"/tmp/{audio_filename}"
            
            with open(audio_path, "wb") as f:
                f.write(response.content)
            
            # Cache-busting URL with timestamp
            audio_url = f"/api/audio/{audio_filename}?t={timestamp}"
            
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
                # Use v2 API for richer voice metadata  
                response = await self.elevenlabs_client.get("/v2/voices")
                if response.status_code == 200:
                    data = response.json()
                    
                    voices = []
                    for voice in data.get("voices", []):
                        voice_id = voice["voice_id"]
                        name = voice["name"]
                        
                        # Extract rich metadata from labels
                        labels = voice.get("labels", {})
                        description = voice.get("description", "")
                        
                        # Build descriptive name from metadata
                        gender = labels.get("gender", "").title()
                        accent = labels.get("accent", "").title()
                        age = labels.get("age", "")
                        descriptive = labels.get("descriptive", "")
                        use_case = labels.get("use_case", "")
                        
                        # Create rich description
                        parts = [name]
                        if gender:
                            parts.append(gender)
                        if age:
                            parts.append(age.title())
                        if accent and accent != "American":
                            parts.append(f"({accent})")
                        if descriptive:
                            parts.append(f"- {descriptive.title()}")
                        elif use_case:
                            parts.append(f"- {use_case.title()}")
                        
                        display_name = " ".join(parts)
                        
                        voices.append({
                            "id": voice_id,
                            "name": display_name,
                            "description": description,
                            "preview_url": voice.get("preview_url"),
                            "labels": labels,
                            "settings": voice.get("settings", {}),
                            "category": voice.get("category", "")
                        })
                    
                    # Sort by gender (female first), then by age, then by name
                    voices.sort(key=lambda v: (
                        0 if v["labels"].get("gender") == "female" else 1,
                        {"young": 0, "middle-aged": 1, "old": 2}.get(v["labels"].get("age", ""), 3),
                        v["name"]
                    ))
                    
                    return voices
                    
            except Exception as e:
                logger.error(f"Failed to get ElevenLabs v2 voices: {e}")
                
                # Fallback to v1 API
                try:
                    response = await self.elevenlabs_client.get("/voices")
                    if response.status_code == 200:
                        data = response.json()
                        return [
                            {"id": voice["voice_id"], "name": voice["name"]}
                            for voice in data.get("voices", [])
                        ]
                except Exception as e2:
                    logger.error(f"Failed to get ElevenLabs v1 voices: {e2}")
        
        # OpenAI TTS voices fallback
        return [
            {"id": "nova", "name": "Nova - Female (OpenAI)"},
            {"id": "shimmer", "name": "Shimmer - Female (OpenAI)"},
            {"id": "alloy", "name": "Alloy - Male (OpenAI)"},
            {"id": "echo", "name": "Echo - Male (OpenAI)"},
            {"id": "fable", "name": "Fable - Male (OpenAI)"},
            {"id": "onyx", "name": "Onyx - Male (OpenAI)"}
        ]
    
    async def close(self):
        if self.elevenlabs_client:
            await self.elevenlabs_client.aclose()