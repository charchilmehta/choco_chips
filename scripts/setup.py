#!/usr/bin/env python
"""Setup script - Initialize system and create sample data"""

import os
import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import Config
from app.document_processor import DocumentProcessor
from app.knowledge_graph import KnowledgeGraph

print("🏭 Industrial Knowledge Intelligence Platform - Setup")
print("="*60)

# Create directories
print("\n📁 Creating directories...")
os.makedirs(Config.DOCUMENTS_DIR, exist_ok=True)
os.makedirs(Config.EMBEDDINGS_DIR, exist_ok=True)
print(f"✓ Documents directory: {Config.DOCUMENTS_DIR}")
print(f"✓ Embeddings directory: {Config.EMBEDDINGS_DIR}")

# Initialize knowledge graph
print("\n🧠 Initializing knowledge graph...")
kg = KnowledgeGraph()
kg.save_to_file(Config.GRAPH_FILE)
print(f"✓ Knowledge graph saved to: {Config.GRAPH_FILE}")

print("\n✅ Setup complete!")
print("\nNext steps:")
print("1. Create .env file from .env.example")
print("2. Add your OPENAI_API_KEY")
print("3. Run: python scripts/generate_samples.py")
print("4. Run: python scripts/ingest_documents.py")
print("5. Run: python app/api.py")
