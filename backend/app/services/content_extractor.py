import asyncio
import httpx
from bs4 import BeautifulSoup
import html2text
from typing import List
from app.models.schemas import ExtractedContent, ExtractionResponse
from app.core.config import settings
import re
import logging

logger = logging.getLogger(__name__)

class ContentExtractorService:
    def __init__(self):
        self.session = httpx.AsyncClient(
            timeout=30.0,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
    
    async def extract_from_urls(self, urls: List[str]) -> ExtractionResponse:
        tasks = [self._extract_single_url(str(url)) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        extracted_content = []
        failed_urls = []
        total_word_count = 0
        
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Extraction failed: {result}")
                failed_urls.append(str(result))
            elif isinstance(result, ExtractedContent):
                extracted_content.append(result)
                if result.success:
                    total_word_count += result.word_count
                else:
                    failed_urls.append(result.url)
        
        success = len(extracted_content) > 0 and total_word_count > 0
        
        return ExtractionResponse(
            success=success,
            extracted_content=extracted_content,
            total_word_count=total_word_count,
            failed_urls=failed_urls
        )
    
    async def _extract_single_url(self, url: str) -> ExtractedContent:
        try:
            logger.info(f"🌐 Starting extraction from: {url}")
            
            # Use simple HTTP extraction with BeautifulSoup
            response = await self.session.get(url)
            logger.info(f"📡 HTTP response: {response.status_code}")
            
            if response.status_code == 404:
                return ExtractedContent(
                    url=url,
                    title="",
                    content="",
                    success=False,
                    error_message="Page not found (404). Please check if the URL is correct.",
                    word_count=0
                )
            elif response.status_code == 403:
                return ExtractedContent(
                    url=url,
                    title="",
                    content="",
                    success=False,
                    error_message="Access denied (403). This website blocks automated access.",
                    word_count=0
                )
            elif response.status_code != 200:
                return ExtractedContent(
                    url=url,
                    title="",
                    content="",
                    success=False,
                    error_message=f"Website returned error {response.status_code}. Please check if the URL is accessible.",
                    word_count=0
                )
            
            html_content = response.text
            if not html_content:
                logger.warning(f"Empty HTML content from {url}")
                return ExtractedContent(
                    url=url, title="", content="", success=False,
                    error_message="No HTML content received", word_count=0
                )
                
            soup = BeautifulSoup(html_content, 'html.parser')
            if soup is None:
                logger.warning(f"Failed to parse HTML from {url}")
                return ExtractedContent(
                    url=url, title="", content="", success=False,
                    error_message="Failed to parse HTML content", word_count=0
                )
            
            # Remove script and style elements with null checks
            for script in soup(["script", "style", "nav", "footer", "header"]):
                if script is not None:
                    script.decompose()
            
            # Try to find the main content
            title = self._extract_title(soup)
            content = self._extract_content(soup)
            
            # Be much more lenient with content length requirements
            if not content or len(content.strip()) < 50:  # Reduced from 100 to 50
                logger.warning(f"Insufficient content from {url}: {len(content.strip()) if content else 0} chars")
                return ExtractedContent(
                    url=url,
                    title=title,
                    content="",
                    success=False,
                    error_message="This page doesn't contain enough readable content. It might be a JavaScript-heavy site or require authentication.",
                    word_count=0
                )
            
            logger.info(f"Raw content extracted: {len(content)} chars")
            
            cleaned_content = self._clean_text(content)
            word_count = len(cleaned_content.split())
            
            logger.info(f"✅ Final content: {len(cleaned_content)} chars, {word_count} words")
            
            # Make sure we still have content after cleaning
            if len(cleaned_content.strip()) < 20:
                logger.warning(f"Content lost during cleaning. Original: {len(content)}, Cleaned: {len(cleaned_content)}")
                # Use original content if cleaning removed too much
                cleaned_content = content[:2000]  # Use first 2000 chars of original content
                word_count = len(cleaned_content.split())
                logger.info(f"Using original content: {len(cleaned_content)} chars")
            
            return ExtractedContent(
                url=url,
                title=title,
                content=cleaned_content,
                success=True,
                word_count=word_count
            )
            
        except httpx.TimeoutException:
            logger.error(f"Timeout extracting from {url}")
            return ExtractedContent(
                url=url,
                title="",
                content="",
                success=False,
                error_message="Request timed out. The website might be slow or unreachable.",
                word_count=0
            )
        except httpx.ConnectError:
            logger.error(f"Connection error for {url}")
            return ExtractedContent(
                url=url,
                title="",
                content="",
                success=False,
                error_message="Unable to connect to this website. Please check if the URL is correct.",
                word_count=0
            )
        except Exception as e:
            logger.error(f"Failed to extract content from {url}: {e}")
            return ExtractedContent(
                url=url,
                title="",
                content="",
                success=False,
                error_message=f"Extraction failed: {str(e)[:100]}...",
                word_count=0
            )
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        # Try different title sources
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()
        
        h1_tag = soup.find('h1')
        if h1_tag:
            return h1_tag.get_text().strip()
        
        return "Untitled"
    
    def _extract_content(self, soup: BeautifulSoup) -> str:
        # Check if this is a Wikipedia page - check the URL properly
        page_source = str(soup)[:1000]  # Check first 1000 chars for efficiency
        is_wikipedia = ('wikipedia.org' in page_source or 
                       soup.find(attrs={'class': 'mw-parser-output'}) is not None or
                       soup.find(attrs={'id': 'mw-content-text'}) is not None)
        
        if is_wikipedia:
            logger.info("Detected Wikipedia page - using specialized extraction")
            content = self._extract_wikipedia_content(soup)
            if content and len(content.strip()) > 50:
                logger.info(f"Wikipedia extraction successful: {len(content)} chars")
                return content
            else:
                logger.warning("Wikipedia specialized extraction failed, trying generic extraction")
        
        # Remove unwanted elements that create noise
        for unwanted in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'menu', 
                             'noscript', 'iframe', 'object', 'embed', 'form', 'input', 'button']):
            unwanted.decompose()
        
        # Remove common clutter classes/ids
        for clutter in soup.find_all(attrs={'class': re.compile(r'(nav|menu|sidebar|footer|header|ad|advertisement|social|share|comment|related)', re.I)}):
            clutter.decompose()
        
        for clutter in soup.find_all(attrs={'id': re.compile(r'(nav|menu|sidebar|footer|header|ad|advertisement|social|share|comment|related)', re.I)}):
            clutter.decompose()
        
        # Try to find main content areas (in order of preference)
        content_selectors = [
            'article',
            'main', 
            '[role="main"]',
            '.content',
            '.post-content', 
            '.entry-content',
            '.article-content',
            '.story-body',
            '.post-body',
            '.article-text'
        ]
        
        extracted_content = []
        
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                for element in elements:
                    # Extract text with better structure preservation
                    text = self._extract_structured_text(element)
                    if text and len(text.strip()) > 100:
                        extracted_content.append(text)
                
                if extracted_content:
                    return '\n\n'.join(extracted_content)
        
        # Fallback: Get text from paragraphs in body
        body = soup.find('body')
        if body:
            paragraphs = body.find_all('p')
            if len(paragraphs) > 3:  # Ensure we have substantial paragraph content
                paragraph_texts = []
                for p in paragraphs:
                    text = p.get_text().strip()
                    if len(text) > 30:  # Only keep substantial paragraphs
                        paragraph_texts.append(text)
                
                if paragraph_texts:
                    return '\n\n'.join(paragraph_texts)
            
            # Last resort: body text
            return body.get_text()
        
        return soup.get_text()
    
    def _extract_wikipedia_content(self, soup: BeautifulSoup) -> str:
        """Simplified and robust extraction for Wikipedia pages"""
        logger.info("Extracting Wikipedia content with simplified method")
        
        # Simple approach: get all paragraphs from the page
        all_paragraphs = soup.find_all('p')
        logger.info(f"Found {len(all_paragraphs)} total paragraphs")
        
        paragraph_texts = []
        
        for p in all_paragraphs:
            if p is None:
                continue
                
            # Remove reference markers and edit links
            for unwanted in p.find_all(['sup', 'a']):
                if unwanted is None:
                    continue
                    
                # Safe null checks for attributes
                unwanted_class = unwanted.get('class') if unwanted else None
                unwanted_title = unwanted.get('title') if unwanted else None
                
                if unwanted_class and 'reference' in ' '.join(unwanted_class):
                    unwanted.decompose()
                elif unwanted_title and 'edit' in unwanted_title.lower():
                    unwanted.decompose()
            
            try:
                text = p.get_text().strip() if p else ""
            except Exception as e:
                logger.warning(f"Error extracting text from paragraph: {e}")
                continue
            
            # Very lenient filtering - keep almost everything that looks like content
            if (text and len(text) > 10 and 
                not re.match(r'^[\d\s\-\.]+$', text) and  # Skip numeric-only
                not text.lower().startswith(('edit', 'view', 'from wikipedia', 'jump to'))):
                
                paragraph_texts.append(text)
        
        if paragraph_texts:
            content = '\n\n'.join(paragraph_texts)
            logger.info(f"Wikipedia simple extraction: {len(content)} characters from {len(paragraph_texts)} paragraphs")
            return content
        
        # Ultimate fallback: just get all text content
        logger.info("Using ultimate Wikipedia fallback - all text")
        body = soup.find('body')
        if body is not None:
            try:
                # Remove obviously unwanted elements
                for unwanted in body.find_all(['script', 'style', 'nav', 'footer']):
                    if unwanted is not None:
                        unwanted.decompose()
                
                text = body.get_text()
                # Clean up excessive whitespace
                text = re.sub(r'\s+', ' ', text).strip()
                
                if len(text) > 100:
                    logger.info(f"Wikipedia ultimate fallback: {len(text)} characters")
                    return text
            except Exception as e:
                logger.error(f"Error in ultimate fallback: {e}")
        
        logger.error("All Wikipedia extraction methods failed")
        return ""
    
    def _extract_structured_text(self, element) -> str:
        """Extract text while preserving paragraph structure"""
        texts = []
        
        # Process paragraphs and headings separately to maintain structure
        for child in element.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div']):
            text = child.get_text().strip()
            if len(text) > 20:  # Only keep substantial text blocks
                texts.append(text)
        
        if not texts:
            # Fallback to all text if no structured elements found
            text = element.get_text().strip()
            if text:
                texts.append(text)
        
        return '\n\n'.join(texts)
    
    def _clean_text(self, text: str) -> str:
        # Remove navigation elements, menus, and common website clutter
        text = re.sub(r'(Menu|Navigation|Skip to|Home|About|Contact|Privacy|Terms|Edit|View history)', ' ', text, flags=re.IGNORECASE)
        
        # Remove duplicate words that appear consecutively (like "MammoottyMammootty")
        text = re.sub(r'\b(\w+)\1+\b', r'\1', text)
        
        # For non-Wikipedia content, remove table-like data (be more selective for Wikipedia)
        if 'wikipedia.org' not in text.lower():
            text = re.sub(r'\b(Born|Died|Age|Occupation|Years active|Spouse|Children|Education|Alma mater)\s*[:\-]?\s*[^\n]*', '', text)
        
        # Remove excessive whitespace and normalize
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep essential punctuation and parentheses
        text = re.sub(r'[^\w\s.,!?;:()\-\'""\n]', ' ', text)
        
        # Remove excessive punctuation
        text = re.sub(r'\.{3,}', '...', text)
        text = re.sub(r'[.,!?]{2,}', '.', text)
        
        # Remove lines that are too short (likely fragments) - be more lenient
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            # Be more lenient for line length, especially for Wikipedia
            if len(line) > 10 and not re.match(r'^[\d\s\-\.]+$', line):  # Skip numeric-only lines
                cleaned_lines.append(line)
        
        # Join lines and remove duplicate sentences
        text = ' '.join(cleaned_lines)
        
        # Split into sentences and remove duplicates (be more lenient)
        sentences = re.split(r'[.!?]+', text)
        unique_sentences = []
        seen = set()
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 10:  # More lenient sentence length
                # Normalize for duplicate detection
                normalized = re.sub(r'\s+', ' ', sentence.lower())
                # Only remove exact duplicates, not similar sentences
                if normalized not in seen:
                    seen.add(normalized)
                    unique_sentences.append(sentence)
        
        # Rejoin sentences
        cleaned_text = '. '.join(unique_sentences)
        if cleaned_text and not cleaned_text.endswith(('.', '!', '?')):
            cleaned_text += '.'
            
        return cleaned_text.strip()
    
    async def close(self):
        await self.session.aclose()