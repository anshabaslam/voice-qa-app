import asyncio
import json
import uuid
import re
from typing import Optional, List, Dict
from fastapi import UploadFile
from app.models.schemas import AnswerResponse
from app.core.config import settings
from app.services.free_ai_service import FreeAIService
from app.services.chroma_service import chroma_service
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
        
        # Get context from previous extractions using semantic search
        context = await self._get_context(session_id, query=question)
        logger.info(f"   - Context items: {len(context) if context else 0}")
        
        if not context:
            logger.error(f"No context available for session {session_id}")
            logger.info("Available sessions in memory:", list(self._context_storage.keys()) if hasattr(self, '_context_storage') else "No storage")
            raise ValueError("No content available. Please extract content from URLs first. Make sure to use the session_id returned from the /links endpoint.")
        
        # Log which services are available
        logger.info(f"   - OpenAI available: {self.openai_client is not None}")
        logger.info(f"   - Anthropic available: {self.anthropic_client is not None}")
        logger.info(f"   - Groq available: {self.groq_client is not None}")
        
        # Try different AI services in order of preference
        try:
            # Try paid services first if available
            if self.openai_client:
                logger.info("🤖 Trying OpenAI GPT service")
                answer, sources = await self._answer_with_openai(question, context)
                logger.info("✅ OpenAI service succeeded")
            elif self.groq_client:
                logger.info("⚡ Trying Groq service (FAST)")
                answer, sources = await self._answer_with_groq(question, context)
                logger.info("✅ Groq service succeeded")
            elif self.anthropic_client:
                logger.info("🤖 Trying Anthropic Claude service")
                answer, sources = await self._answer_with_anthropic(question, context)
                logger.info("✅ Anthropic service succeeded")
            else:
                # Use free AI service as fallback
                logger.info("🆓 No paid AI services available, using free AI service")
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
                    "content": """You are a helpful AI assistant who provides answers based on the provided web content context from multiple sources.

                    GUIDELINES:
                    1. For greetings (hi, hello, etc.) and basic conversational responses, respond naturally
                    2. For factual questions, use ONLY information from the provided web content context
                    3. When multiple sources are available, synthesize information from ALL relevant sources
                    4. If factual information is available in the context, provide a comprehensive answer drawing from all sources
                    5. If factual information is not in the context, state "I don't have that specific information in the provided content"
                    6. Do NOT use general knowledge for factual questions - stick to the extracted content only
                    7. Keep answers informative but concise, combining insights from different sources when relevant
                    8. Avoid including raw HTML, navigation text, or website formatting
                    9. When answering factual questions, you may reference which source(s) the information comes from
                    10. If sources provide contradictory information, acknowledge the differences
                    
                    FORMAT: Respond naturally to greetings. For factual questions, provide comprehensive answers that utilize information from all relevant sources in the context."""
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
                    "content": """You are a helpful AI assistant who provides answers based on the provided web content context from multiple sources.

                    GUIDELINES:
                    1. For greetings (hi, hello, etc.) and basic conversational responses, respond naturally
                    2. For factual questions, use ONLY information from the provided web content context
                    3. When multiple sources are available, synthesize information from ALL relevant sources
                    4. If factual information is available in the context, provide a comprehensive answer drawing from all sources
                    5. If factual information is not in the context, state "I don't have that specific information in the provided content"
                    6. Do NOT use general knowledge for factual questions - stick to the extracted content only
                    7. Keep answers informative but concise, combining insights from different sources when relevant
                    8. Avoid including raw HTML, navigation text, or website formatting
                    9. When answering factual questions, you may reference which source(s) the information comes from
                    10. If sources provide contradictory information, acknowledge the differences
                    
                    FORMAT: Respond naturally to greetings. For factual questions, provide comprehensive answers that utilize information from all relevant sources in the context."""
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
            
            prompt = f"""You are a helpful AI assistant who provides answers based on the provided web content context from multiple sources.

            GUIDELINES:
            1. For greetings (hi, hello, etc.) and basic conversational responses, respond naturally
            2. For factual questions, use ONLY information from the provided web content context
            3. When multiple sources are available, synthesize information from ALL relevant sources
            4. If factual information is available in the context, provide a comprehensive answer drawing from all sources
            5. If factual information is not in the context, state "I don't have that specific information in the provided content"
            6. Do NOT use general knowledge for factual questions - stick to the extracted content only
            7. Keep answers informative but concise, combining insights from different sources when relevant
            8. Avoid including raw HTML, navigation text, or website formatting
            9. When answering factual questions, you may reference which source(s) the information comes from
            10. If sources provide contradictory information, acknowledge the differences

            Context:
            {context_text}

            Question: {question}

            Please respond naturally to greetings, or analyze the context carefully for factual questions, utilizing information from all available sources."""
            
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
        # Group context by URL to organize by source
        sources = {}
        for item in context:
            url = item.get('url', 'unknown')
            if url not in sources:
                sources[url] = {
                    'title': item.get('title', 'Untitled'),
                    'chunks': []
                }
            sources[url]['chunks'].append(item.get('content', ''))
        
        context_parts = []
        for i, (url, source_data) in enumerate(sources.items(), 1):
            title = source_data['title']
            
            # Combine chunks from the same source
            combined_content = ' '.join(source_data['chunks'])
            
            # Clean the content for better AI consumption
            if combined_content:
                # Remove excessive whitespace
                combined_content = re.sub(r'\s+', ' ', combined_content)
                # Remove HTML-like artifacts  
                combined_content = re.sub(r'<[^>]+>', '', combined_content)
                # Remove repetitive elements
                combined_content = re.sub(r'(\w+)\1{2,}', r'\1', combined_content)
                # Use up to 4000 chars per source for good context
                combined_content = combined_content[:4000]
                if len(' '.join(source_data['chunks'])) > 4000:
                    combined_content += "..."
                    
            context_parts.append(f"Source {i} - {title} ({url}):\n{combined_content}\n")
        
        logger.info(f"Prepared context from {len(sources)} unique sources")
        return "\n" + "="*60 + "\n" + "\n".join(context_parts) + "\n" + "="*60
    
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
    
    async def _get_context(self, session_id: str, query: str = "") -> Optional[List[Dict]]:
        """Get context using semantic search from ChromaDB for better relevance"""
        
        # Try ChromaDB first for semantic search (if query provided)
        if query and chroma_service.collection:
            try:
                relevant_content = chroma_service.search_relevant_content(
                    session_id=session_id, 
                    query=query, 
                    max_results=10  # Increased to ensure multiple sources are included
                )
                if relevant_content:
                    unique_sources = len(set(item['url'] for item in relevant_content))
                    logger.info(f"🔍 ChromaDB: Found {len(relevant_content)} relevant chunks from {unique_sources} sources using semantic search")
                    return relevant_content
            except Exception as e:
                logger.error(f"ChromaDB search failed: {e}")
        elif chroma_service.collection is None:
            logger.info("ChromaDB not available, using enhanced fallback")
        
        # Fallback to Redis/in-memory storage
        if self.redis_client:
            try:
                context_key = f"context:{session_id}"
                context_data = await self.redis_client.get(context_key)
                if context_data:
                    return json.loads(context_data)
            except Exception as e:
                logger.error(f"Failed to retrieve context from Redis: {e}")
        
        # Final fallback to in-memory storage with multi-source enhancement
        context_data = self._context_storage.get(session_id)
        if context_data:
            logger.info(f"📚 Found {len(context_data)} items in memory storage for session {session_id}")
            if query:
                # Enhanced multi-source context selection
                selected_content = self._select_multi_source_content(context_data, query)
                logger.info(f"🎯 Selected {len(selected_content)} items after multi-source filtering")
                return selected_content
            else:
                # No query, return all content but limit for performance
                return context_data[:10]
        else:
            logger.warning(f"❌ No context data found for session {session_id}")
            logger.info(f"Available sessions: {list(self._context_storage.keys())}")
            return None
    
    async def store_context(self, session_id: str, extracted_content: List[Dict]):
        # Store in ChromaDB for semantic search (primary)
        if chroma_service.collection:
            try:
                success = chroma_service.add_content(session_id, extracted_content)
                if success:
                    logger.info(f"✅ ChromaDB: Stored content for session {session_id}")
                else:
                    logger.warning("ChromaDB storage failed, using fallback")
            except Exception as e:
                logger.error(f"Failed to store context in ChromaDB: {e}")
        else:
            logger.info(f"ChromaDB not available, using fallback storage for session {session_id}")
        
        # Also store in Redis/memory for backwards compatibility
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
    
    def _select_multi_source_content(self, context_data: List[Dict], query: str) -> List[Dict]:
        """Enhanced multi-source content selection without ChromaDB"""
        logger.info(f"🔍 Multi-source selection: {len(context_data)} total items, query: '{query[:50]}...'")
        
        if not context_data or len(context_data) <= 5:
            logger.info(f"📝 Small dataset ({len(context_data)} items), returning all")
            return context_data
        
        # Group by URL to ensure multi-source representation
        sources = {}
        for item in context_data:
            url = item.get('url', 'unknown')
            if url not in sources:
                sources[url] = []
            sources[url].append(item)
        
        logger.info(f"📊 Found {len(sources)} unique sources:")
        for url, items in sources.items():
            logger.info(f"   - {url}: {len(items)} items")
        
        # If single source, return top content
        if len(sources) <= 1:
            logger.info("📝 Single source detected, returning top 10 items")
            return context_data[:10]
        
        # Multi-source: ensure balanced representation
        selected_content = []
        items_per_source = max(2, 10 // len(sources))  # At least 2 items per source
        logger.info(f"🎯 Target: {items_per_source} items per source")
        
        # Simple keyword-based relevance for each source
        query_words = set(query.lower().split())
        logger.info(f"🔑 Query keywords: {query_words}")
        
        for url, items in sources.items():
            # Score items by keyword overlap
            scored_items = []
            for item in items:
                content_words = set(item.get('content', '').lower().split())
                title_words = set(item.get('title', '').lower().split())
                
                # Simple scoring: title matches worth more
                title_score = len(query_words & title_words) * 2
                content_score = len(query_words & content_words)
                total_score = title_score + content_score
                
                scored_items.append((total_score, item))
            
            # Sort by score and take top items from this source
            scored_items.sort(reverse=True, key=lambda x: x[0])
            source_selected = [item for _, item in scored_items[:items_per_source]]
            selected_content.extend(source_selected)
            
            logger.info(f"   ✅ Selected {len(source_selected)} items from {url}")
            for score, item in scored_items[:items_per_source]:
                logger.info(f"      - Score {score}: {item.get('title', 'Untitled')[:40]}...")
        
        # Fill remaining slots with highest scoring items overall
        remaining_slots = 10 - len(selected_content)
        if remaining_slots > 0:
            logger.info(f"🔄 Filling {remaining_slots} remaining slots with best items")
            
            # Get all remaining items
            selected_urls = {item['url'] for item in selected_content}
            remaining_items = [item for item in context_data 
                             if item['url'] not in selected_urls or 
                             len([x for x in selected_content if x['url'] == item['url']]) < 3]
            
            # Score and add best remaining items
            scored_remaining = []
            for item in remaining_items:
                content_words = set(item.get('content', '').lower().split())
                title_words = set(item.get('title', '').lower().split())
                title_score = len(query_words & title_words) * 2
                content_score = len(query_words & content_words)
                scored_remaining.append((title_score + content_score, item))
            
            scored_remaining.sort(reverse=True, key=lambda x: x[0])
            additional_items = [item for _, item in scored_remaining[:remaining_slots]]
            selected_content.extend(additional_items)
            logger.info(f"   ➕ Added {len(additional_items)} additional items")
        
        unique_sources = len(set(item['url'] for item in selected_content))
        logger.info(f"✅ Final selection: {len(selected_content)} items from {unique_sources} sources")
        
        return selected_content[:10]
    
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