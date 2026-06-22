#!/usr/bin/env python
"""Ingest sample documents into the system"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import Config
from app.document_processor import DocumentProcessor
from app.entity_extractor import EntityExtractor
from app.knowledge_graph import KnowledgeGraph
from app.rag_engine import RAGEngine

print("📥 Ingesting documents...")
print("="*60)

# Initialize components
doc_processor = DocumentProcessor(Config.DATA_DIR)
entity_extractor = EntityExtractor()
knowledge_graph = KnowledgeGraph()
rag_engine = RAGEngine()

# Process all documents
if os.path.exists(Config.DOCUMENTS_DIR):
    documents = doc_processor.process_batch(Config.DOCUMENTS_DIR)
    print(f"\n📄 Found {len(documents)} documents")
    
    # Process each document
    for i, doc in enumerate(documents, 1):
        filename = doc.get('filename', f'doc_{i}')
        print(f"\n[{i}/{len(documents)}] Processing: {filename}")
        
        # Extract entities
        entities = entity_extractor.extract_entities(doc['content'])
        print(f"  - Equipment IDs: {entities['equipment_ids']}")
        print(f"  - Procedures: {entities['procedures']}")
        print(f"  - Regulations: {entities['regulations']}")
        
        # Add to knowledge graph
        doc_id = filename.replace('.', '_')
        summary = entity_extractor.extract_summary(doc['content'])
        knowledge_graph.add_document_node(doc_id, filename, doc['type'], summary)
        knowledge_graph.add_entities_from_extraction(doc_id, entities)
        
        # Add to RAG
        rag_engine.add_documents([doc])
    
    # Save knowledge graph
    knowledge_graph.save_to_file(Config.GRAPH_FILE)
    print(f"\n✅ Ingestion complete!")
    print(f"📊 Knowledge graph saved: {Config.GRAPH_FILE}")
    
    # Print statistics
    graph_data = knowledge_graph.to_dict()
    print(f"\n📈 Statistics:")
    print(f"  - Total nodes: {graph_data['stats']['total_nodes']}")
    print(f"  - Total relationships: {graph_data['stats']['total_edges']}")
else:
    print(f"❌ Documents directory not found: {Config.DOCUMENTS_DIR}")
    print("Run 'python scripts/generate_samples.py' first")
