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
            # Use simple HTTP extraction with BeautifulSoup
            response = await self.session.get(url)
            
            if response.status_code != 200:
                return ExtractedContent(
                    url=url,
                    title="",
                    content="",
                    success=False,
                    error_message=f"HTTP {response.status_code}",
                    word_count=0
                )
            
            html_content = response.text
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Try to find the main content
            title = self._extract_title(soup)
            content = self._extract_content(soup)
            
            if not content or len(content.strip()) < 100:
                return ExtractedContent(
                    url=url,
                    title=title,
                    content="",
                    success=False,
                    error_message="Insufficient content extracted",
                    word_count=0
                )
            
            cleaned_content = self._clean_text(content)
            word_count = len(cleaned_content.split())
            
            return ExtractedContent(
                url=url,
                title=title,
                content=cleaned_content,
                success=True,
                word_count=word_count
            )
            
        except Exception as e:
            logger.error(f"Failed to extract content from {url}: {e}")
            return ExtractedContent(
                url=url,
                title="",
                content="",
                success=False,
                error_message=str(e),
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
        # Try to find main content areas
        content_selectors = [
            'article', 'main', '[role="main"]',
            '.content', '.post-content', '.entry-content',
            '.article-content', '.story-body'
        ]
        
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                return ' '.join(el.get_text() for el in elements)
        
        # Fallback to body content
        body = soup.find('body')
        if body:
            return body.get_text()
        
        return soup.get_text()
    
    def _clean_text(self, text: str) -> str:
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:()\-\'""]', ' ', text)
        
        # Remove excessive punctuation
        text = re.sub(r'\.{3,}', '...', text)
        text = re.sub(r'[.,!?]{2,}', '.', text)
        
        return text.strip()
    
    async def close(self):
        await self.session.aclose()