import httpx
import asyncio
from typing import Optional, List, Dict, Tuple
from app.models.schemas import AnswerResponse
from app.core.config import settings
import logging
import json
import re

logger = logging.getLogger(__name__)

class FreeAIService:
    def __init__(self):
        self.session = httpx.AsyncClient(timeout=20.0)  # Reasonable timeout for fast responses
        
    async def answer_question(self, question: str, context: List[Dict], session_id: Optional[str] = None) -> AnswerResponse:
        """Answer questions using free AI alternatives"""
        
        if not session_id:
            import uuid
            session_id = str(uuid.uuid4())
        
        # Try different free AI methods in order of preference
        answer = None
        sources = [item["url"] for item in context]
        
        # Method 1: Try Ollama (if running locally)
        if settings.USE_OLLAMA:
            logger.info(f"🔥 Attempting Ollama with model: {settings.OLLAMA_MODEL}")
            try:
                answer = await self._answer_with_ollama(question, context)
                if answer:
                    logger.info(f"🎉 Ollama SUCCESS! Generated {len(answer)} character response")
                    return AnswerResponse(
                        answer=answer,
                        sources=sources,
                        session_id=session_id,
                        confidence=0.8
                    )
                else:
                    logger.warning("❌ Ollama returned empty response")
            except Exception as e:
                logger.error(f"❌ Ollama failed with error: {e}")
        else:
            logger.info("⚠️ Ollama is disabled in settings")
        
        # Method 2: Try HuggingFace Inference API (free tier)
        if settings.USE_HUGGINGFACE:
            logger.info("🤗 Attempting HuggingFace...")
            try:
                answer = await self._answer_with_huggingface(question, context)
                if answer:
                    logger.info(f"🎉 HuggingFace SUCCESS! Generated {len(answer)} character response")
                    return AnswerResponse(
                        answer=answer,
                        sources=sources,
                        session_id=session_id,
                        confidence=0.7
                    )
                else:
                    logger.warning("❌ HuggingFace returned empty response")
            except Exception as e:
                logger.error(f"❌ HuggingFace failed with error: {e}")
        else:
            logger.info("⚠️ HuggingFace is disabled in settings")
        
        # Method 3: Simple keyword-based answering (always works)
        logger.info("📝 Falling back to keyword-based analysis")
        answer = self._simple_keyword_answer(question, context)
        
        return AnswerResponse(
            answer=answer,
            sources=sources,
            session_id=session_id,
            confidence=0.6
        )
    
    async def _answer_with_ollama(self, question: str, context: List[Dict]) -> Optional[str]:
        """Try to answer using local Ollama installation"""
        try:
            logger.info(f"🌐 Connecting to Ollama at {settings.OLLAMA_BASE_URL}")
            
            # First test if Ollama is accessible
            try:
                test_response = await self.session.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
                logger.info(f"📡 Ollama connection test: {test_response.status_code}")
            except Exception as conn_error:
                logger.error(f"🚫 Cannot connect to Ollama: {conn_error}")
                return None
                
            context_text = self._prepare_context(context)
            logger.info(f"📄 Context prepared: {len(context_text)} characters")
            
            prompt = f"""Based on this information, answer the question in natural language:

{context_text}

Question: {question}

Answer briefly and naturally:"""

            payload = {
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            }
            
            response = await self.session.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
                
        except Exception as e:
            logger.error(f"Ollama API error: {e}")
            
        return None
    
    async def _answer_with_huggingface(self, question: str, context: List[Dict]) -> Optional[str]:
        """Try to answer using HuggingFace Inference API"""
        try:
            # Use a simple text generation model
            context_text = self._prepare_context(context)[:1000]  # Limit context size
            
            prompt = f"Context: {context_text}\nQ: {question}\nA:"
            
            headers = {}
            if settings.HUGGINGFACE_API_KEY:
                headers["Authorization"] = f"Bearer {settings.HUGGINGFACE_API_KEY}"
            
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 150,
                    "temperature": 0.7,
                    "return_full_text": False
                }
            }
            
            # Try a simple question-answering model
            model_url = "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2"
            
            qa_payload = {
                "inputs": {
                    "question": question,
                    "context": context_text[:500]  # Limit context for QA model
                }
            }
            
            response = await self.session.post(model_url, headers=headers, json=qa_payload)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, dict) and "answer" in result:
                    return result["answer"].strip()
                    
        except Exception as e:
            logger.error(f"HuggingFace API error: {e}")
            
        return None
    
    def _simple_keyword_answer(self, question: str, context: List[Dict]) -> str:
        """Generate natural language answers from scraped content from multiple sources"""
        logger.info(f"🔍 Creating natural response for: {question[:50]}...")
        
        # Group by source
        sources = {}
        for item in context:
            url = item.get('url', 'unknown')
            if url not in sources:
                sources[url] = {
                    'title': item.get('title', 'Untitled'),
                    'content': []
                }
            content = item.get("content", "")
            if content:
                sources[url]['content'].append(content)
        
        # Combine content from each source
        all_content = ""
        source_count = 0
        for url, source_data in sources.items():
            if source_data['content']:
                source_count += 1
                combined_content = ' '.join(source_data['content'])
                cleaned = self._clean_website_content(combined_content)
                all_content += f"\n\nSource {source_count} - {source_data['title']}: {cleaned}"
        
        if not all_content.strip():
            return "I couldn't find any content to answer your question."
        
        logger.info(f"📊 Processing content from {source_count} sources")
        
        # Create natural AI-like response mentioning multiple sources
        return self._create_natural_response(question, all_content, source_count)
    
    def _clean_website_content(self, content: str) -> str:
        """Clean website content from HTML artifacts and navigation elements"""
        # Remove excessive whitespace
        content = re.sub(r'\s+', ' ', content)
        # Remove HTML-like artifacts
        content = re.sub(r'<[^>]+>', '', content)
        # Remove repetitive elements
        content = re.sub(r'(\w+)\1{2,}', r'\1', content)
        # Remove common website navigation text
        content = re.sub(r'\b(Home|Contact|About|Menu|Navigation|Footer|Header)\b', '', content, flags=re.IGNORECASE)
        return content.strip()
    
    def _create_natural_response(self, question: str, content: str, source_count: int = 1) -> str:
        """Create a natural language response from the content"""
        logger.info(f"📝 Creating natural response from {len(content)} characters of content from {source_count} sources")
        
        # Limit content length for better processing
        if len(content) > 4000:
            content = content[:4000] + "..."
        
        # Create a simple natural response by extracting relevant information
        # This is a fallback when AI services aren't available
        sentences = re.split(r'[.!?]+', content)
        relevant_sentences = []
        
        question_words = set(word.lower().strip('.,!?') for word in question.split() if len(word) > 3)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20:  # Only substantial sentences
                sentence_words = set(word.lower().strip('.,!?') for word in sentence.split())
                # Check if sentence contains any question keywords
                if question_words & sentence_words:
                    relevant_sentences.append(sentence)
        
        if not relevant_sentences:
            # If no specific matches, use first few sentences from each source
            relevant_sentences = [s.strip() for s in sentences[:6] if len(s.strip()) > 20]
        
        # Create a natural response
        if relevant_sentences:
            if source_count > 1:
                response = f"Based on information from {source_count} sources:\n\n"
            else:
                response = "Based on the information provided:\n\n"
            
            response += ". ".join(relevant_sentences[:4])  # Use more sentences when multiple sources
            if not response.endswith('.'):
                response += "."
            
            # Add a note about multiple sources if applicable
            if source_count > 1:
                response += f"\n\n(Information synthesized from {source_count} different sources)"
            
            return response
        
        return f"I found content from {source_count} source{'s' if source_count > 1 else ''} but couldn't extract a clear answer to your specific question."
    
    def _remove_duplicate_phrases(self, text: str) -> str:
        """Remove duplicate phrases and clean up the text"""
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        unique_sentences = []
        seen_sentences = set()
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 10:
                # Normalize for comparison
                normalized = re.sub(r'\s+', ' ', sentence.lower())
                
                # Check for substantial similarity (not just exact duplicates)
                is_duplicate = False
                for seen in seen_sentences:
                    # Calculate rough similarity
                    words_current = set(normalized.split())
                    words_seen = set(seen.split())
                    if len(words_current & words_seen) / max(len(words_current | words_seen), 1) > 0.7:
                        is_duplicate = True
                        break
                
                if not is_duplicate:
                    seen_sentences.add(normalized)
                    if not sentence.endswith(('.', '!', '?')):
                        sentence += '.'
                    unique_sentences.append(sentence)
        
        return '. '.join(unique_sentences)
    
    def _prepare_context(self, context: List[Dict]) -> str:
        """Prepare clean, concise context for AI models from multiple sources"""
        # Group by URL to organize by source
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
        source_limit = min(5, len(sources))  # Use up to 5 sources for free AI
        
        for i, (url, source_data) in enumerate(list(sources.items())[:source_limit], 1):
            title = source_data['title']
            # Combine chunks from the same source
            combined_content = ' '.join(source_data['chunks'])
            
            # Clean and reduce content for speed
            if combined_content:
                # Remove excessive whitespace
                combined_content = re.sub(r'\s+', ' ', combined_content)
                # Remove HTML-like artifacts
                combined_content = re.sub(r'<[^>]+>', '', combined_content)
                # Remove repetitive elements
                combined_content = re.sub(r'(\w+)\1{2,}', r'\1', combined_content)
                # Take only first 1500 chars per source for speed
                combined_content = combined_content[:1500]
                if len(' '.join(source_data['chunks'])) > 1500:
                    combined_content += "..."
                
            context_parts.append(f"Source {i} ({title}): {combined_content}")
            
        logger.info(f"Prepared context from {len(context_parts)} sources for free AI")
        return "\n\n".join(context_parts)
    
    async def transcribe_audio(self, audio_data: bytes) -> str:
        """Simple fallback for audio transcription"""
        # In a real implementation, you might use a free speech-to-text service
        # For now, return a message encouraging text input
        return "Audio transcription requires additional setup. Please type your question instead."
    
    async def close(self):
        """Close the HTTP session"""
        await self.session.aclose()