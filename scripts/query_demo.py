#!/usr/bin/env python
"""Demo script - Query the copilot"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import Config
from app.rag_engine import RAGEngine
from app.knowledge_graph import KnowledgeGraph

print("🤖 Industrial Knowledge Copilot - Demo")
print("="*60)

# Initialize
rag_engine = RAGEngine()
knowledge_graph = KnowledgeGraph()

# Load knowledge graph if exists
if os.path.exists(Config.GRAPH_FILE):
    knowledge_graph.load_from_file(Config.GRAPH_FILE)
    print(f"✓ Knowledge graph loaded")

# Sample queries
queries = [
    "What is the maintenance history of Pump-A23?",
    "Show me the operating procedures for the heat exchanger",
    "What are the compliance requirements for this equipment?",
    "When was the last inspection performed?",
    "What equipment requires urgent maintenance?"
]

print("\n📋 Sample Queries:\n")

for i, query in enumerate(queries, 1):
    print(f"\n[Query {i}] {query}")
    print("-" * 60)
    
    # Query RAG engine
    result = rag_engine.query(query)
    
    print(f"\nAnswer: {result['answer'][:300]}...")
    print(f"\nSources:")
    for source in result['sources']:
        print(f"  - {source['document']} ({source['doc_type']})")
    print(f"\nConfidence: {result['confidence']*100:.1f}%")

print(f"\n\n✅ Demo complete!")
print("\nTo start the API server, run: python app/api.py")
