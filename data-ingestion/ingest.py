"""
This script will be responsible for the entire data ingestion pipeline:
1.  Downloading: Fetching K-12 math textbook PDFs directly from OpenStax.
2.  Text Extraction: Extracting text content from the PDF files.
3.  Chunking: Breaking the raw text into smaller, meaningful pieces.
4.  Embedding: Using OpenAI's API to convert text chunks into vector embeddings.
5.  Upserting: Storing the embeddings and their metadata into our Pinecone index.
"""
import os
import re
import requests
import pdfplumber
from dotenv import load_dotenv
from typing import Dict, List, Tuple
from tqdm import tqdm
import openai
from pinecone import Pinecone
import time
import hashlib

# --- CONFIGURATION ---
load_dotenv()

# K-12 Math textbooks from OpenStax with their correct download URLs
TEXTBOOK_URLS = {
    "Elementary_Algebra_2e": "https://assets.openstax.org/oscms-prodcms/media/documents/ElementaryAlgebra2e-WEB_EjIP4sI.pdf",
    "Prealgebra_2e": "https://assets.openstax.org/oscms-prodcms/media/documents/Prealgebra2e-WEB_0qbw93r.pdf",
    "Prealgebra": "https://assets.openstax.org/oscms-prodcms/media/documents/Prealgebra-OP_oYhyXVE.pdf",
    "Calculus_Volume_1": "https://assets.openstax.org/oscms-prodcms/media/documents/CalculusVolume1-WEB_7Fy9zKx.pdf",
    # Try alternative URLs for other books
    "Intermediate_Algebra_2e": "https://assets.openstax.org/oscms-prodcms/media/documents/IntermediateAlgebra2e-WEB.pdf",
    "College_Algebra_2e": "https://assets.openstax.org/oscms-prodcms/media/documents/CollegeAlgebra2e-WEB.pdf",
    "Algebra_and_Trigonometry_2e": "https://assets.openstax.org/oscms-prodcms/media/documents/AlgebraAndTrigonometry2e-WEB.pdf",
    "Precalculus_2e": "https://assets.openstax.org/oscms-prodcms/media/documents/Precalculus2e-WEB.pdf",
    "Calculus_Volume_2": "https://assets.openstax.org/oscms-prodcms/media/documents/CalculusVolume2-WEB.pdf",
    "Calculus_Volume_3": "https://assets.openstax.org/oscms-prodcms/media/documents/CalculusVolume3-WEB.pdf",
}

# Directories
BASE_DIR = "scraped_data"
PDF_DIR = os.path.join(BASE_DIR, "pdfs")

# API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "k12-math-textbooks"

# Chunking Configuration
CHUNK_SIZE = 1000  # Target characters per chunk
CHUNK_OVERLAP = 200  # Overlap between chunks to maintain context
MIN_CHUNK_SIZE = 300  # Minimum size for a chunk to be useful

def ensure_directories():
    """Create necessary directories if they don't exist."""
    os.makedirs(BASE_DIR, exist_ok=True)
    os.makedirs(PDF_DIR, exist_ok=True)

def download_pdf(book_name: str, url: str) -> bool:
    """
    Download a PDF file from the given URL.
    
    Args:
        book_name: Name of the textbook
        url: Direct download URL for the PDF
        
    Returns:
        bool: True if successful, False otherwise
    """
    pdf_path = os.path.join(PDF_DIR, f"{book_name}.pdf")
    
    # Skip if PDF already exists
    if os.path.exists(pdf_path):
        print(f"✓ PDF already exists: {book_name}")
        return True
    
    try:
        print(f"📥 Downloading {book_name}...")
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        
        with open(pdf_path, 'wb') as file:
            if total_size == 0:
                file.write(response.content)
            else:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        file.write(chunk)
                        downloaded += len(chunk)
                        
        file_size = os.path.getsize(pdf_path)
        print(f"✅ Downloaded {book_name}: {file_size / (1024*1024):.1f} MB")
        return True
        
    except Exception as e:
        print(f"❌ Failed to download {book_name}: {str(e)}")
        return False

def extract_text_from_pdf(book_name: str) -> bool:
    """
    Extract text from a PDF file and save it to a text file.
    
    Args:
        book_name: Name of the textbook
        
    Returns:
        bool: True if successful, False otherwise
    """
    pdf_path = os.path.join(PDF_DIR, f"{book_name}.pdf")
    book_dir = os.path.join(BASE_DIR, book_name)
    text_path = os.path.join(book_dir, f"{book_name}_full_text.txt")
    
    # Skip if text file already exists
    if os.path.exists(text_path):
        print(f"✓ Text already extracted: {book_name}")
        return True
    
    # Skip if PDF doesn't exist
    if not os.path.exists(pdf_path):
        print(f"⚠️  PDF not found: {book_name}")
        return False
    
    try:
        print(f"📄 Extracting text from {book_name}...")
        os.makedirs(book_dir, exist_ok=True)
        
        text_content = []
        
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
                    
                    # Progress indicator
                    if page_num % 50 == 0 or page_num == total_pages:
                        print(f"  📖 Processed {page_num}/{total_pages} pages")
                        
                except Exception as e:
                    print(f"  ⚠️  Error on page {page_num}: {str(e)}")
                    continue
        
        # Combine all text
        full_text = "\n\n".join(text_content)
        
        # Save to file
        with open(text_path, 'w', encoding='utf-8') as file:
            file.write(full_text)
        
        char_count = len(full_text)
        print(f"✅ Extracted text from {book_name}: {char_count:,} characters ({total_pages} pages)")
        return True
        
    except Exception as e:
        print(f"❌ Failed to extract text from {book_name}: {str(e)}")
        return False

def clean_text(text: str) -> str:
    """
    Clean and normalize text for better chunking and embedding.
    
    Args:
        text: Raw text to clean
        
    Returns:
        str: Cleaned text
    """
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove page numbers and headers/footers (common patterns)
    text = re.sub(r'\n\d+\s*\n', '\n', text)
    text = re.sub(r'\n\s*Page \d+\s*\n', '\n', text)
    
    # Remove URLs and email addresses
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    
    # Normalize quotes and dashes
    text = re.sub(r'[""]', '"', text)
    text = re.sub(r'[''`]', "'", text)
    text = re.sub(r'[—–]', '-', text)
    
    return text.strip()

def chunk_text(text: str, book_name: str) -> List[Dict]:
    """
    Break text into smaller, overlapping chunks with metadata.
    
    Args:
        text: Full text to chunk
        book_name: Name of the source textbook
        
    Returns:
        List[Dict]: List of text chunks with metadata
    """
    clean_text_content = clean_text(text)
    chunks = []
    
    # Split by paragraphs first (double newlines)
    paragraphs = clean_text_content.split('\n\n')
    
    current_chunk = ""
    current_chapter = "Introduction"
    current_section = ""
    chunk_count = 0
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        # Detect chapter headers (simple heuristic)
        if (len(paragraph) < 100 and 
            ('chapter' in paragraph.lower() or 
             'section' in paragraph.lower() or
             paragraph.isupper() or
             re.match(r'^\d+\.', paragraph))):
            
            # Save current chunk if it's substantial
            if len(current_chunk) >= MIN_CHUNK_SIZE:
                chunks.append({
                    "text": current_chunk.strip(),
                    "metadata": {
                        "book": book_name,
                        "chapter": current_chapter,
                        "section": current_section,
                        "chunk_id": chunk_count
                    }
                })
                chunk_count += 1
                current_chunk = ""
            
            # Update chapter/section info
            if 'chapter' in paragraph.lower():
                current_chapter = paragraph
                current_section = ""
            else:
                current_section = paragraph
            
            continue
        
        # Check if adding this paragraph would exceed chunk size
        if len(current_chunk) + len(paragraph) + 2 > CHUNK_SIZE:
            # Save current chunk if it meets minimum size
            if len(current_chunk) >= MIN_CHUNK_SIZE:
                chunks.append({
                    "text": current_chunk.strip(),
                    "metadata": {
                        "book": book_name,
                        "chapter": current_chapter,
                        "section": current_section,
                        "chunk_id": chunk_count
                    }
                })
                chunk_count += 1
                
                # Start new chunk with overlap
                overlap_words = current_chunk.split()[-30:]  # Last 30 words for context
                current_chunk = " ".join(overlap_words) + "\n\n" + paragraph + "\n\n"
            else:
                # Current chunk too small, just add paragraph
                current_chunk += paragraph + "\n\n"
        else:
            current_chunk += paragraph + "\n\n"
    
    # Don't forget the last chunk
    if len(current_chunk.strip()) >= MIN_CHUNK_SIZE:
        chunks.append({
            "text": current_chunk.strip(),
            "metadata": {
                "book": book_name,
                "chapter": current_chapter,
                "section": current_section,
                "chunk_id": chunk_count
            }
        })
    
    # If we still have very few chunks, force split by character count
    if len(chunks) < 5 and len(clean_text_content) > CHUNK_SIZE * 2:
        print(f"⚠️  Only {len(chunks)} chunks created, force-splitting by character count...")
        chunks = []
        chunk_count = 0
        
        # Simple character-based chunking as fallback
        for i in range(0, len(clean_text_content), CHUNK_SIZE - CHUNK_OVERLAP):
            chunk_text_content = clean_text_content[i:i + CHUNK_SIZE]
            
            if len(chunk_text_content) >= MIN_CHUNK_SIZE:
                chunks.append({
                    "text": chunk_text_content,
                    "metadata": {
                        "book": book_name,
                        "chapter": f"Section {chunk_count // 10 + 1}",
                        "section": f"Part {chunk_count % 10 + 1}",
                        "chunk_id": chunk_count
                    }
                })
                chunk_count += 1
    
    return chunks

def create_embedding(text: str) -> List[float]:
    """
    Create an embedding for the given text using OpenAI's API.
    
    Args:
        text: Text to embed
        
    Returns:
        List[float]: Vector embedding
    """
    try:
        # Safety check: estimate tokens (rough approximation: 1 token ≈ 4 characters)
        estimated_tokens = len(text) // 4
        max_tokens = 8000  # Leave some buffer below the 8192 limit
        
        if estimated_tokens > max_tokens:
            print(f"⚠️  Text too long ({estimated_tokens} estimated tokens), truncating...")
            # Truncate to safe length
            text = text[:max_tokens * 4]
        
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
            encoding_format="float"
        )
        
        return response.data[0].embedding
        
    except Exception as e:
        print(f"❌ Error creating embedding: {str(e)}")
        return None

def generate_chunk_id(chunk: Dict) -> str:
    """
    Generate a unique ID for a chunk based on its content and metadata.
    
    Args:
        chunk: Chunk dictionary with text and metadata
        
    Returns:
        str: Unique chunk ID
    """
    content = f"{chunk['metadata']['book']}_{chunk['metadata']['chunk_id']}_{chunk['text'][:100]}"
    return hashlib.md5(content.encode()).hexdigest()

def upsert_to_pinecone(chunks: List[Dict]) -> bool:
    """
    Upload chunks with embeddings to Pinecone.
    
    Args:
        chunks: List of text chunks with metadata
        
    Returns:
        bool: True if successful
    """
    try:
        print(f"🌲 Connecting to Pinecone...")
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        
        # Process chunks in batches
        batch_size = 100
        total_chunks = len(chunks)
        
        for i in range(0, total_chunks, batch_size):
            batch = chunks[i:i + batch_size]
            vectors = []
            
            print(f"📊 Processing batch {i//batch_size + 1}/{(total_chunks-1)//batch_size + 1}...")
            
            for chunk in tqdm(batch, desc="Creating embeddings"):
                # Create embedding
                embedding = create_embedding(chunk['text'])
                if embedding is None:
                    continue
                
                # Prepare vector for Pinecone
                vector_id = generate_chunk_id(chunk)
                vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": {
                        **chunk['metadata'],
                        "text": chunk['text'][:1000]  # Truncate text for metadata storage
                    }
                })
                
                # Rate limiting for OpenAI API
                time.sleep(0.1)
            
            # Upsert batch to Pinecone
            if vectors:
                print(f"🚀 Upserting {len(vectors)} vectors to Pinecone...")
                index.upsert(vectors=vectors)
                print(f"✅ Successfully upserted batch")
        
        # Get index stats
        stats = index.describe_index_stats()
        print(f"🎉 Pinecone index now contains {stats['total_vector_count']} vectors")
        return True
        
    except Exception as e:
        print(f"❌ Error upserting to Pinecone: {str(e)}")
        return False

def process_textbook_to_embeddings(book_name: str) -> bool:
    """
    Complete pipeline: chunk text and create embeddings for a textbook.
    
    Args:
        book_name: Name of the textbook to process
        
    Returns:
        bool: True if successful
    """
    text_path = os.path.join(BASE_DIR, book_name, f"{book_name}_full_text.txt")
    
    if not os.path.exists(text_path):
        print(f"⚠️  Text file not found for {book_name}")
        return False
    
    try:
        print(f"\n🔄 Processing {book_name} for embeddings...")
        
        # Read the text file
        with open(text_path, 'r', encoding='utf-8') as file:
            text = file.read()
        
        print(f"📚 Text loaded: {len(text):,} characters")
        
        # Chunk the text
        print(f"✂️  Chunking text...")
        chunks = chunk_text(text, book_name)
        print(f"📦 Created {len(chunks)} chunks")
        
        # Create embeddings and upsert to Pinecone
        success = upsert_to_pinecone(chunks)
        
        if success:
            print(f"✅ Successfully processed {book_name} ({len(chunks)} chunks)")
        else:
            print(f"❌ Failed to process {book_name}")
            
        return success
        
    except Exception as e:
        print(f"❌ Error processing {book_name}: {str(e)}")
        return False

def main():
    """Main execution function."""
    print("🚀 Starting MathSnap Knowledge Base Ingestion Pipeline")
    print("=" * 60)
    
    # Ensure directories exist
    ensure_directories()
    
    # Check API keys
    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY not found in environment variables")
        return
    
    if not PINECONE_API_KEY:
        print("❌ PINECONE_API_KEY not found in environment variables")
        return
    
    print("✅ API keys configured")
    
    # Phase 1: Download PDFs (if needed)
    print("\n📥 PHASE 1: Downloading PDFs...")
    download_count = 0
    for book_name, url in TEXTBOOK_URLS.items():
        if download_pdf(book_name, url):
            download_count += 1
    
    print(f"📊 Downloaded/Verified {download_count} PDFs")
    
    # Phase 2: Extract text (if needed)
    print("\n📄 PHASE 2: Extracting text...")
    extraction_count = 0
    for book_name in TEXTBOOK_URLS.keys():
        if extract_text_from_pdf(book_name):
            extraction_count += 1
    
    print(f"📊 Extracted/Verified {extraction_count} text files")
    
    # Phase 3: Process for embeddings
    print("\n🧠 PHASE 3: Creating embeddings and uploading to Pinecone...")
    processed_count = 0
    
    # Process textbooks that have extracted text
    for book_name in TEXTBOOK_URLS.keys():
        text_path = os.path.join(BASE_DIR, book_name, f"{book_name}_full_text.txt")
        if os.path.exists(text_path):
            if process_textbook_to_embeddings(book_name):
                processed_count += 1
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎉 PIPELINE COMPLETE!")
    print(f"📚 Processed {processed_count} textbooks into vector embeddings")
    print("🔍 Your RAG knowledge base is ready for queries!")
    
    # Calculate total characters processed
    total_chars = 0
    for book_name in TEXTBOOK_URLS.keys():
        text_path = os.path.join(BASE_DIR, book_name, f"{book_name}_full_text.txt")
        if os.path.exists(text_path):
            with open(text_path, 'r', encoding='utf-8') as file:
                total_chars += len(file.read())
    
    print(f"📊 Total content: {total_chars:,} characters")

if __name__ == "__main__":
    main() 