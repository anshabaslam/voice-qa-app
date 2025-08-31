import asyncio
import json
import uuid
import re
from typing import Optional, List, Dict
from fastapi import UploadFile
from app.models.schemas import AnswerResponse
from app.core.config import settings
from app.services.free_ai_service import FreeAIService
import logging

logger = logging.getLogger(__name__)

# Optional imports for paid services
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

class AIService:
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.groq_client = None
        self.redis_client = None
        self.free_ai_service = FreeAIService()
        
        # Initialize paid services if available and configured
        if OPENAI_AVAILABLE and settings.USE_OPENAI and settings.OPENAI_API_KEY:
            self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        if ANTHROPIC_AVAILABLE and settings.USE_ANTHROPIC and settings.ANTHROPIC_API_KEY:
            self.anthropic_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        
        if GROQ_AVAILABLE and settings.USE_GROQ_SERVICE and settings.GROQ_API_KEY:
            self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        # Initialize Redis if available and configured
        if REDIS_AVAILABLE and settings.USE_REDIS:
            try:
                self.redis_client = redis.from_url(settings.REDIS_URL)
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}")
    
    async def answer_question(self, question: str, session_id: Optional[str] = None) -> AnswerResponse:
        logger.info(f"📝 AI Service: Answering question for session {session_id}")
        logger.info(f"   - Question: {question[:100]}...")
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Get context from previous extractions
        context = await self._get_context(session_id)
        logger.info(f"   - Context items: {len(context) if context else 0}")
        
        if not context:
            logger.error("No context available for session")
            raise ValueError("No content available. Please extract content from URLs first.")
        
        # Log which services are available
        logger.info(f"   - OpenAI available: {self.openai_client is not None}")
        logger.info(f"   - Anthropic available: {self.anthropic_client is not None}")
        logger.info(f"   - Groq available: {self.groq_client is not None}")
        
        # Try different AI services in order of preference
        try:
            # Try paid services first if available
            if self.openai_client:
                logger.info("🤖 Using OpenAI GPT service")
                answer, sources = await self._answer_with_openai(question, context)
            elif self.groq_client:
                logger.info("⚡ Using Groq service (FAST)")
                answer, sources = await self._answer_with_groq(question, context)
            elif self.anthropic_client:
                logger.info("🤖 Using Anthropic Claude service")
                answer, sources = await self._answer_with_anthropic(question, context)
            else:
                # Use free AI service as fallback
                logger.info("🆓 Using free AI service (includes Ollama)")
                logger.info(f"🔧 Ollama settings - USE_OLLAMA: {settings.USE_OLLAMA}, Model: {settings.OLLAMA_MODEL}, URL: {settings.OLLAMA_BASE_URL}")
                result = await self.free_ai_service.answer_question(question, context, session_id)
                answer, sources = result.answer, result.sources
                logger.info(f"✅ Free AI service returned answer: {len(answer)} characters")
        
        except Exception as e:
            logger.error(f"❌ Primary AI service failed: {e}")
            logger.info("🆓 Falling back to free AI service")
            try:
                result = await self.free_ai_service.answer_question(question, context, session_id)
                answer, sources = result.answer, result.sources
            except Exception as e2:
                logger.error(f"❌ Free AI service also failed: {e2}")
                raise ValueError(f"All AI services failed. Error: {str(e2)}")
        
        logger.info(f"✅ Generated answer (length: {len(answer)} chars)")
        
        # Store the Q&A in session
        await self._store_qa(session_id, question, answer)
        
        return AnswerResponse(
            answer=answer,
            sources=sources,
            session_id=session_id,
            confidence=0.8
        )
    
    async def _answer_with_openai(self, question: str, context: List[Dict]) -> tuple[str, List[str]]:
        try:
            # Prepare context for the model
            context_text = self._prepare_context(context)
            
            messages = [
                {
                    "role": "system",
                    "content": """You are a helpful AI assistant who provides clear, natural answers based on web content.

                    INSTRUCTIONS:
                    1. Answer in a conversational, natural tone as if speaking to a friend
                    2. Write in clear, well-structured paragraphs 
                    3. Include specific facts, dates, names, and details from the sources
                    4. If information is incomplete, politely mention what's missing
                    5. Only use information directly found in the provided context
                    6. Organize your response logically and make it easy to read
                    7. Avoid including raw HTML, navigation text, or website formatting
                    8. Focus on being helpful and informative in plain language
                    
                    FORMAT: Provide a natural, conversational answer that directly addresses the question."""
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context_text}\n\nQuestion: {question}"
                }
            ]
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=1500,  # Increased for fuller answers
                temperature=0.7
            )
            
            answer = response.choices[0].message.content.strip()
            sources = [item["url"] for item in context]
            
            return answer, sources
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise ValueError(f"Failed to generate answer: {str(e)}")
    
    async def _answer_with_groq(self, question: str, context: List[Dict]) -> tuple[str, List[str]]:
        try:
            context_text = self._prepare_context(context)
            
            messages = [
                {
                    "role": "system",
                    "content": """You are a helpful AI assistant who provides clear, natural answers based on web content.

                    INSTRUCTIONS:
                    1. Answer in a conversational, natural tone as if speaking to a friend
                    2. Write in clear, well-structured paragraphs 
                    3. Include specific facts, dates, names, and details from the sources
                    4. If information is incomplete, politely mention what's missing
                    5. Only use information directly found in the provided context
                    6. Organize your response logically and make it easy to read
                    7. Avoid including raw HTML, navigation text, or website formatting
                    8. Focus on being helpful and informative in plain language
                    
                    FORMAT: Provide a natural, conversational answer that directly addresses the question."""
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context_text}\n\nQuestion: {question}"
                }
            ]
            
            response = await self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Fast Groq model
                messages=messages,
                max_tokens=1000,
                temperature=0.7
            )
            
            answer = response.choices[0].message.content.strip()
            sources = [item["url"] for item in context]
            
            return answer, sources
            
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise ValueError(f"Failed to generate answer: {str(e)}")

    async def _answer_with_anthropic(self, question: str, context: List[Dict]) -> tuple[str, List[str]]:
        try:
            context_text = self._prepare_context(context)
            
            prompt = f"""You are a helpful AI assistant who provides clear, natural answers based on web content.

            INSTRUCTIONS:
            1. Answer in a conversational, natural tone as if speaking to a friend
            2. Write in clear, well-structured paragraphs
            3. Include specific facts, dates, names, and details from the sources
            4. If information is incomplete, politely mention what's missing
            5. Only use information directly found in the provided context
            6. Organize your response logically and make it easy to read
            7. Avoid including raw HTML, navigation text, or website formatting
            8. Focus on being helpful and informative in plain language

            Context:
            {context_text}

            Question: {question}

            Please provide a natural, conversational answer that directly addresses the question based on the context above."""
            
            response = await self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1500,  # Increased for fuller answers
                messages=[{"role": "user", "content": prompt}]
            )
            
            answer = response.content[0].text.strip()
            sources = [item["url"] for item in context]
            
            return answer, sources
            
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise ValueError(f"Failed to generate answer: {str(e)}")
    
    def _prepare_context(self, context: List[Dict]) -> str:
        context_parts = []
        for i, item in enumerate(context, 1):
            content = item['content']
            title = item['title']
            
            # Clean the content for better AI consumption
            if content:
                # Remove excessive whitespace
                content = re.sub(r'\s+', ' ', content)
                # Remove HTML-like artifacts  
                content = re.sub(r'<[^>]+>', '', content)
                # Remove repetitive elements
                content = re.sub(r'(\w+)\1{2,}', r'\1', content)
                # Use up to 4000 chars per source for good context
                content = content[:4000]
                if len(item['content']) > 4000:
                    content += "..."
                    
            context_parts.append(f"Article {i}: {title}\nContent: {content}\n")
        return "\n".join(context_parts)
    
    async def transcribe_audio(self, audio_file: UploadFile) -> str:
        # Try OpenAI Whisper if available
        if self.openai_client:
            try:
                audio_file.file.seek(0)
                response = await self.openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file.file
                )
                return response.text.strip()
            except Exception as e:
                logger.warning(f"OpenAI transcription failed: {e}")
        
        # Fallback to free service
        try:
            audio_data = await audio_file.read()
            return await self.free_ai_service.transcribe_audio(audio_data)
        except Exception as e:
            logger.error(f"Audio transcription failed: {e}")
            return "Could not transcribe audio. Please type your question instead."
    
    # Simple in-memory storage as fallback when Redis is not available
    _context_storage = {}
    _qa_storage = {}
    
    async def _get_context(self, session_id: str) -> Optional[List[Dict]]:
        if self.redis_client:
            try:
                context_key = f"context:{session_id}"
                context_data = await self.redis_client.get(context_key)
                if context_data:
                    return json.loads(context_data)
            except Exception as e:
                logger.error(f"Failed to retrieve context from Redis: {e}")
        
        # Fallback to in-memory storage
        return self._context_storage.get(session_id)
    
    async def store_context(self, session_id: str, extracted_content: List[Dict]):
        if self.redis_client:
            try:
                context_key = f"context:{session_id}"
                context_data = json.dumps(extracted_content, default=str)
                await self.redis_client.setex(context_key, 86400, context_data)
                return
            except Exception as e:
                logger.error(f"Failed to store context in Redis: {e}")
        
        # Fallback to in-memory storage
        self._context_storage[session_id] = extracted_content
        logger.info(f"Stored context in memory for session {session_id}")
    
    async def _store_qa(self, session_id: str, question: str, answer: str):
        from datetime import datetime
        
        qa_entry = {
            "question": question,
            "answer": answer,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if self.redis_client:
            try:
                qa_key = f"qa:{session_id}"
                await self.redis_client.lpush(qa_key, json.dumps(qa_entry))
                await self.redis_client.expire(qa_key, 86400)
                return
            except Exception as e:
                logger.error(f"Failed to store Q&A in Redis: {e}")
        
        # Fallback to in-memory storage
        if session_id not in self._qa_storage:
            self._qa_storage[session_id] = []
        self._qa_storage[session_id].append(qa_entry)
    
    async def get_session_history(self, session_id: str) -> List[Dict]:
        if self.redis_client:
            try:
                qa_key = f"qa:{session_id}"
                qa_data = await self.redis_client.lrange(qa_key, 0, -1)
                return [json.loads(qa) for qa in qa_data]
            except Exception as e:
                logger.error(f"Failed to retrieve session history from Redis: {e}")
        
        # Fallback to in-memory storage
        return self._qa_storage.get(session_id, [])