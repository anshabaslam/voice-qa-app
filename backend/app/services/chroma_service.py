try:
    import chromadb
    from chromadb.utils import embedding_functions
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    
import uuid
import logging
from typing import List, Dict, Optional
import os

# Disable CoreML and other problematic ONNX providers on macOS
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

logger = logging.getLogger(__name__)

class ChromaService:
    def __init__(self):
        self.client = None
        self.collection = None
        self.embedding_function = None
        self._initialize()
    
    def _initialize(self):
        """Initialize ChromaDB client with Hugging Face embedding function"""
        if not CHROMADB_AVAILABLE:
            logger.warning("ChromaDB not available - service disabled")
            self.client = None
            self.collection = None
            return
            
        try:
            # Initialize ChromaDB client (persistent storage)
            persist_directory = os.path.join(os.path.dirname(__file__), "../../chroma_db")
            os.makedirs(persist_directory, exist_ok=True)
            self.client = chromadb.PersistentClient(path=persist_directory)
            
            # Initialize SentenceTransformer embedding function (local, no API key needed)
            self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
            
            # Get or create collection with HF embeddings
            self.collection = self.client.get_or_create_collection(
                name="content_embeddings",
                embedding_function=self.embedding_function,
                metadata={"description": "Web content embeddings for Q&A via Hugging Face"}
            )
            
            logger.info("✅ ChromaDB service initialized successfully with Hugging Face embeddings")
            
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            # Fallback to in-memory storage
            self._initialize_fallback()
    
    def _initialize_fallback(self):
        """Fallback to in-memory ChromaDB if persistent fails"""
        try:
            self.client = chromadb.Client()
            
            # Initialize SentenceTransformer embedding function for fallback (local, no API key needed)
            self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
            
            self.collection = self.client.get_or_create_collection(
                name="content_embeddings",
                embedding_function=self.embedding_function,
                metadata={"description": "Web content embeddings for Q&A via Hugging Face"}
            )
            logger.info("ChromaDB fallback (in-memory) initialized with Hugging Face embeddings")
        except Exception as e:
            logger.error(f"ChromaDB fallback failed: {e}")
            self.client = None
            self.collection = None
    
    def add_content(self, session_id: str, content_items: List[Dict]) -> bool:
        """Add content items to ChromaDB with chunking for large content"""
        if not self.collection:
            return False
        
        try:
            # Clear existing content for this session
            self.clear_session_content(session_id)
            
            documents = []
            metadatas = []
            ids = []
            
            for item in content_items:
                content = item.get('content', '')
                title = item.get('title', '')
                url = item.get('url', '')
                
                # Chunk large content into smaller pieces (1000 chars each)
                chunks = self._chunk_content(content, chunk_size=1000)
                
                for i, chunk in enumerate(chunks):
                    doc_id = f"{session_id}_{url}_{i}_{uuid.uuid4().hex[:8]}"
                    
                    documents.append(chunk)
                    metadatas.append({
                        "session_id": session_id,
                        "url": url,
                        "title": title,
                        "chunk_index": i,
                        "total_chunks": len(chunks)
                    })
                    ids.append(doc_id)
            
            # Add to ChromaDB
            if documents:
                self.collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                
                logger.info(f"Added {len(documents)} content chunks for session {session_id}")
                return True
            
        except Exception as e:
            logger.error(f"Failed to add content to ChromaDB: {e}")
        
        return False
    
    def search_relevant_content(self, session_id: str, query: str, max_results: int = 10) -> List[Dict]:
        """Search for relevant content chunks using semantic similarity with balanced representation from multiple sources"""
        if not self.collection:
            return []
        
        try:
            # First, get all unique URLs for this session
            session_results = self.collection.get(
                where={"session_id": session_id}
            )
            
            unique_urls = list(set([meta.get('url', '') for meta in session_results['metadatas']]))
            logger.info(f"Found {len(unique_urls)} unique sources for session {session_id}")
            
            if len(unique_urls) == 1:
                # Single source - use normal search
                results = self.collection.query(
                    query_texts=[query],
                    n_results=max_results,
                    where={"session_id": session_id}
                )
            else:
                # Multiple sources - ensure balanced representation
                results_per_source = max(2, max_results // len(unique_urls))  # At least 2 results per source
                total_results = min(max_results * 2, 20)  # Search more results initially
                
                results = self.collection.query(
                    query_texts=[query],
                    n_results=total_results,
                    where={"session_id": session_id}
                )
            
            relevant_content = []
            if results['documents'] and results['documents'][0]:
                # Group results by URL for balanced selection
                url_groups = {}
                
                for i, doc in enumerate(results['documents'][0]):
                    metadata = results['metadatas'][0][i]
                    url = metadata.get('url', '')
                    distance = results['distances'][0][i] if 'distances' in results else 0
                    
                    content_item = {
                        'content': doc,
                        'url': url,
                        'title': metadata.get('title', ''),
                        'relevance_score': 1 - distance,  # Convert distance to similarity
                        'chunk_index': metadata.get('chunk_index', 0),
                        'distance': distance
                    }
                    
                    if url not in url_groups:
                        url_groups[url] = []
                    url_groups[url].append(content_item)
                
                # If multiple sources, balance the selection
                if len(unique_urls) > 1:
                    results_per_source = max(1, max_results // len(unique_urls))
                    
                    # Take the most relevant chunks from each source
                    for url in unique_urls:
                        if url in url_groups:
                            # Sort by relevance (lowest distance = highest relevance)
                            url_groups[url].sort(key=lambda x: x['distance'])
                            # Take top chunks from this source
                            relevant_content.extend(url_groups[url][:results_per_source])
                    
                    # Fill remaining slots with the most relevant overall
                    remaining_slots = max_results - len(relevant_content)
                    if remaining_slots > 0:
                        all_remaining = []
                        for url, items in url_groups.items():
                            all_remaining.extend(items[results_per_source:])  # Items not yet selected
                        
                        all_remaining.sort(key=lambda x: x['distance'])  # Sort by relevance
                        relevant_content.extend(all_remaining[:remaining_slots])
                else:
                    # Single source - take top results
                    for url, items in url_groups.items():
                        items.sort(key=lambda x: x['distance'])
                        relevant_content.extend(items[:max_results])
                
                # Remove the distance field before returning
                for item in relevant_content:
                    item.pop('distance', None)
            
            logger.info(f"Found {len(relevant_content)} relevant chunks from {len(set(item['url'] for item in relevant_content))} sources for query")
            return relevant_content[:max_results]  # Ensure we don't exceed max_results
            
        except Exception as e:
            logger.error(f"Failed to search ChromaDB: {e}")
            return []
    
    def clear_session_content(self, session_id: str) -> bool:
        """Clear all content for a specific session"""
        if not self.collection:
            return False
        
        try:
            # Get all IDs for this session
            results = self.collection.get(
                where={"session_id": session_id}
            )
            
            if results['ids']:
                self.collection.delete(ids=results['ids'])
                logger.info(f"Cleared {len(results['ids'])} items for session {session_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to clear session content: {e}")
            return False
    
    def _chunk_content(self, content: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
        """Split large content into overlapping chunks"""
        if len(content) <= chunk_size:
            return [content]
        
        chunks = []
        start = 0
        
        while start < len(content):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(content):
                # Look for sentence endings within the last 200 chars
                sentence_end = content.rfind('.', start + chunk_size - 200, end)
                if sentence_end > start:
                    end = sentence_end + 1
            
            chunk = content[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - overlap if end < len(content) else end
        
        return chunks
    
    def get_collection_stats(self, session_id: str) -> Dict:
        """Get statistics about stored content for a session"""
        if not self.collection:
            return {"total_chunks": 0, "urls": []}
        
        try:
            results = self.collection.get(
                where={"session_id": session_id}
            )
            
            urls = list(set([meta.get('url', '') for meta in results['metadatas']]))
            
            return {
                "total_chunks": len(results['ids']),
                "urls": urls
            }
            
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {"total_chunks": 0, "urls": []}

# Global instance
chroma_service = ChromaService()