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
        self.session = httpx.AsyncClient(timeout=30.0)
        
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
            try:
                answer = await self._answer_with_ollama(question, context)
                if answer:
                    return AnswerResponse(
                        answer=answer,
                        sources=sources,
                        session_id=session_id,
                        confidence=0.8
                    )
            except Exception as e:
                logger.warning(f"Ollama failed: {e}")
        
        # Method 2: Try HuggingFace Inference API (free tier)
        if settings.USE_HUGGINGFACE:
            try:
                answer = await self._answer_with_huggingface(question, context)
                if answer:
                    return AnswerResponse(
                        answer=answer,
                        sources=sources,
                        session_id=session_id,
                        confidence=0.7
                    )
            except Exception as e:
                logger.warning(f"HuggingFace failed: {e}")
        
        # Method 3: Simple keyword-based answering (always works)
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
            context_text = self._prepare_context(context)
            
            prompt = f"""Context: {context_text}

Question: {question}

Please provide a helpful answer based on the context above. If you cannot find the answer in the context, say so clearly."""

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
        """Simple keyword-based answering as fallback"""
        question_lower = question.lower()
        
        # Extract key terms from question
        key_terms = re.findall(r'\b\w+\b', question_lower)
        key_terms = [term for term in key_terms if len(term) > 2 and term not in ['what', 'how', 'when', 'where', 'why', 'who', 'the', 'and', 'for', 'are', 'you']]
        
        if not key_terms:
            return "I need more specific keywords in your question to search through the content."
        
        # Search for relevant sentences in context
        relevant_sentences = []
        
        for item in context:
            content = item.get("content", "")
            sentences = re.split(r'[.!?]+', content)
            
            for sentence in sentences:
                sentence = sentence.strip()
                if len(sentence) < 20:  # Skip very short sentences
                    continue
                    
                sentence_lower = sentence.lower()
                matches = sum(1 for term in key_terms if term in sentence_lower)
                
                if matches > 0:
                    relevant_sentences.append((sentence, matches, item.get("url", "")))
        
        if not relevant_sentences:
            return f"I couldn't find information about '{' '.join(key_terms)}' in the provided content. Please try rephrasing your question or check if the content sources contain relevant information."
        
        # Sort by relevance (number of keyword matches)
        relevant_sentences.sort(key=lambda x: x[1], reverse=True)
        
        # Build answer from most relevant sentences
        answer_parts = []
        used_sources = set()
        
        for sentence, matches, source in relevant_sentences[:3]:  # Top 3 most relevant
            answer_parts.append(sentence)
            used_sources.add(source)
            
        answer = " ".join(answer_parts)
        
        # Add a simple summary
        if len(answer) > 300:
            answer = answer[:300] + "..."
        
        return f"Based on the provided content: {answer}"
    
    def _prepare_context(self, context: List[Dict]) -> str:
        """Prepare context for AI models"""
        context_parts = []
        for i, item in enumerate(context[:3], 1):  # Limit to 3 sources
            title = item.get('title', 'Untitled')
            content = item.get('content', '')[:500]  # Limit content length
            context_parts.append(f"Source {i} ({title}): {content}")
        return "\n\n".join(context_parts)
    
    async def transcribe_audio(self, audio_data: bytes) -> str:
        """Simple fallback for audio transcription"""
        # In a real implementation, you might use a free speech-to-text service
        # For now, return a message encouraging text input
        return "Audio transcription requires additional setup. Please type your question instead."
    
    async def close(self):
        """Close the HTTP session"""
        await self.session.aclose()