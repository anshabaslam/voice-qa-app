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
        """Comprehensive full-text answering that reads entire content"""
        logger.info(f"🔍 Performing comprehensive text analysis for: {question[:50]}...")
        
        question_lower = question.lower()
        
        # Extract key terms from question (more comprehensive)
        key_terms = re.findall(r'\b\w+\b', question_lower)
        stopwords = ['what', 'how', 'when', 'where', 'why', 'who', 'the', 'and', 'for', 'are', 'you', 'was', 'were', 'is', 'in', 'on', 'at', 'to', 'from', 'with', 'about', 'this', 'that', 'they', 'them', 'their', 'there', 'then', 'than', 'these', 'those']
        key_terms = [term for term in key_terms if len(term) > 2 and term not in stopwords]
        
        # Also extract phrases (2-3 word combinations)
        question_words = question.split()
        phrases = []
        for i in range(len(question_words) - 1):
            phrase = f"{question_words[i]} {question_words[i+1]}".lower().strip('.,!?')
            if len(phrase) > 5:
                phrases.append(phrase)
        
        logger.info(f"   - Key terms: {key_terms[:5]}")
        logger.info(f"   - Key phrases: {phrases[:3]}")
        
        # Analyze ENTIRE content from all sources
        all_relevant_content = []
        
        for item in context:
            content = item.get("content", "")
            title = item.get("title", "Untitled")
            url = item.get("url", "")
            
            if not content:
                continue
                
            logger.info(f"   - Analyzing source: {title} ({len(content)} chars)")
            
            # Split content into meaningful sections (sentences, paragraphs, sections)
            sections = []
            
            # First try paragraph splits
            paragraphs = re.split(r'\n\s*\n', content)
            for para in paragraphs:
                if len(para.strip()) > 30:  # Keep substantial paragraphs
                    sections.append(para.strip())
            
            # If no clear paragraphs, split by sentences
            if len(sections) == 1:
                sentences = re.split(r'[.!?]+', content)
                sections = [s.strip() for s in sentences if len(s.strip()) > 30]
            
            # Analyze each section for relevance
            for section in sections:
                section_lower = section.lower()
                
                # Count keyword matches
                keyword_matches = sum(1 for term in key_terms if term in section_lower)
                
                # Count phrase matches (higher weight)
                phrase_matches = sum(2 for phrase in phrases if phrase in section_lower)
                
                total_matches = keyword_matches + phrase_matches
                
                if total_matches > 0:
                    # Calculate comprehensive relevance score
                    relevance = total_matches * 10
                    
                    # Boost score for sections with multiple keywords close together
                    for i, term1 in enumerate(key_terms):
                        for term2 in key_terms[i+1:]:
                            if term1 in section_lower and term2 in section_lower:
                                pos1 = section_lower.find(term1)
                                pos2 = section_lower.find(term2)
                                distance = abs(pos1 - pos2)
                                if distance < 50:
                                    relevance += 20  # Very close
                                elif distance < 100:
                                    relevance += 10  # Close
                                elif distance < 200:
                                    relevance += 5   # Nearby
                    
                    # Boost score for exact phrase matches
                    for phrase in phrases:
                        if phrase in section_lower:
                            relevance += 25
                    
                    all_relevant_content.append({
                        'text': section,
                        'relevance': relevance,
                        'source': url,
                        'title': title,
                        'matches': total_matches,
                        'length': len(section)
                    })
        
        if not all_relevant_content:
            # If no keyword matches, provide guidance based on available content
            available_topics = []
            for item in context:
                title = item.get("title", "")
                if title:
                    available_topics.append(title)
            
            return f"I couldn't find specific information about '{', '.join(key_terms[:3])}' in the provided content.\n\nThe extracted content appears to cover these topics:\n" + '\n'.join(f"• {topic}" for topic in available_topics[:5]) + "\n\nPlease try:\n1. Asking about one of these available topics\n2. Using different keywords that might appear in the content\n3. Being more specific about what aspect you want to know"
        
        # Sort all relevant content by relevance score
        all_relevant_content.sort(key=lambda x: x['relevance'], reverse=True)
        
        logger.info(f"   - Found {len(all_relevant_content)} relevant content sections")
        logger.info(f"   - Top relevance scores: {[c['relevance'] for c in all_relevant_content[:5]]}")
        
        # Build comprehensive answer including ALL relevant content (no artificial limits)
        answer_sections = []
        used_sources = {}
        total_chars = 0
        
        # Take the most relevant content without strict character limits
        # Focus on providing complete, thorough information
        for content_block in all_relevant_content:
            if total_chars > 8000:  # Very generous limit for comprehensive answers
                break
                
            text = content_block['text']
            source = content_block['source']
            title = content_block['title']
            
            # Clean and format the text properly
            text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
            text = text.strip()
            
            if text and len(text) > 20:
                # Group content by source for better organization
                if source not in used_sources:
                    used_sources[source] = {
                        'title': title,
                        'sections': []
                    }
                
                used_sources[source]['sections'].append(text)
                total_chars += len(text)
        
        if not used_sources:
            return "I found some matching terms, but couldn't extract enough coherent information to provide a comprehensive answer."
        
        # Create a clean, focused answer without source headers for better flow
        answer_sentences = []
        seen_content = set()
        
        # Extract the most relevant content and merge into coherent paragraphs
        for content_block in all_relevant_content[:10]:  # Top 10 most relevant blocks
            text = content_block['text']
            
            # Clean and normalize the text
            text = re.sub(r'\s+', ' ', text).strip()
            
            # Skip if we've seen very similar content
            normalized_text = re.sub(r'[^\w\s]', '', text.lower())
            if normalized_text in seen_content or len(text) < 30:
                continue
            
            seen_content.add(normalized_text)
            
            # Split into sentences and clean each one
            sentences = re.split(r'[.!?]+', text)
            for sentence in sentences:
                sentence = sentence.strip()
                if len(sentence) > 20:  # Only keep substantial sentences
                    # Ensure sentence ends properly
                    if not sentence.endswith(('.', '!', '?')):
                        sentence += '.'
                    answer_sentences.append(sentence)
        
        if not answer_sentences:
            return "I found some matching content, but couldn't extract clear, readable information to answer your question properly."
        
        # Group sentences into coherent paragraphs
        paragraphs = []
        current_paragraph = []
        
        for sentence in answer_sentences[:15]:  # Limit to top 15 sentences for quality
            current_paragraph.append(sentence)
            
            # Start new paragraph every 2-3 sentences for readability
            if len(current_paragraph) >= 3:
                paragraphs.append(' '.join(current_paragraph))
                current_paragraph = []
        
        # Add remaining sentences
        if current_paragraph:
            paragraphs.append(' '.join(current_paragraph))
        
        # Create final clean answer
        clean_answer = '\n\n'.join(paragraphs)
        
        # Remove any remaining duplicate phrases within the answer
        final_answer = self._remove_duplicate_phrases(clean_answer)
        
        logger.info(f"   - Generated clean answer: {len(final_answer)} characters")
        logger.info(f"   - Used {len(answer_sentences)} sentences from {len(used_sources)} sources")
        
        return final_answer
    
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
        """Prepare context for AI models"""
        context_parts = []
        for i, item in enumerate(context[:5], 1):  # Use up to 5 sources
            title = item.get('title', 'Untitled')
            content = item.get('content', '')[:2000]  # Use much more content (2000 chars)
            url = item.get('url', '')
            context_parts.append(f"Source {i} - {title} ({url}):\n{content}")
        return "\n\n" + "="*50 + "\n\n".join(context_parts)
    
    async def transcribe_audio(self, audio_data: bytes) -> str:
        """Simple fallback for audio transcription"""
        # In a real implementation, you might use a free speech-to-text service
        # For now, return a message encouraging text input
        return "Audio transcription requires additional setup. Please type your question instead."
    
    async def close(self):
        """Close the HTTP session"""
        await self.session.aclose()