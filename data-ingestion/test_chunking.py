"""
Test script to verify chunking algorithm works correctly.
"""
import os
from dotenv import load_dotenv
from ingest import chunk_text, clean_text

load_dotenv()

def test_chunking():
    """Test the chunking algorithm on one textbook."""
    
    # Test with Elementary Algebra
    book_name = "Elementary_Algebra_2e"
    text_path = f"scraped_data/{book_name}/{book_name}_full_text.txt"
    
    if not os.path.exists(text_path):
        print(f"❌ Text file not found: {text_path}")
        return
    
    print(f"🧪 Testing chunking algorithm on {book_name}...")
    
    # Read the text
    with open(text_path, 'r', encoding='utf-8') as file:
        text = file.read()
    
    print(f"📚 Original text: {len(text):,} characters")
    
    # Chunk the text
    chunks = chunk_text(text, book_name)
    
    print(f"📦 Created {len(chunks)} chunks")
    
    # Analyze chunk sizes
    chunk_sizes = [len(chunk['text']) for chunk in chunks]
    
    print(f"📊 Chunk size stats:")
    print(f"   - Average: {sum(chunk_sizes) / len(chunk_sizes):.0f} chars")
    print(f"   - Min: {min(chunk_sizes):,} chars")
    print(f"   - Max: {max(chunk_sizes):,} chars")
    print(f"   - Total: {sum(chunk_sizes):,} chars")
    
    # Check for oversized chunks
    oversized = [size for size in chunk_sizes if size > 8000]
    if oversized:
        print(f"⚠️  Found {len(oversized)} oversized chunks (>8000 chars)")
    else:
        print(f"✅ All chunks are appropriately sized")
    
    # Show first few chunks
    print(f"\n📋 First 3 chunks preview:")
    for i, chunk in enumerate(chunks[:3]):
        print(f"   Chunk {i+1}: {len(chunk['text'])} chars")
        print(f"   Book: {chunk['metadata']['book']}")
        print(f"   Chapter: {chunk['metadata']['chapter']}")
        print(f"   Preview: {chunk['text'][:100]}...")
        print()

if __name__ == "__main__":
    test_chunking() 