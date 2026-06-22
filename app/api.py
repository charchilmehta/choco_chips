from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
from pathlib import Path
from app import create_app
from app.config import Config
from app.document_processor import DocumentProcessor
from app.entity_extractor import EntityExtractor
from app.knowledge_graph import KnowledgeGraph
from app.rag_engine import RAGEngine

app = create_app()

# Initialize components
doc_processor = DocumentProcessor(Config.DATA_DIR)
entity_extractor = EntityExtractor()
knowledge_graph = KnowledgeGraph()
rag_engine = RAGEngine()

ALLOWED_EXTENSIONS = {'pdf', 'csv', 'txt', 'md'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Industrial Knowledge Intelligence Platform',
        'version': '1.0.0'
    })

@app.route('/upload', methods=['POST'])
def upload_document():
    """Upload and process a document"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(Config.DOCUMENTS_DIR, filename)
        file.save(filepath)
        
        # Process document
        doc_data = doc_processor.process_document(filepath)
        if 'error' in doc_data:
            return jsonify({'error': doc_data['error']}), 400
        
        # Extract entities
        entities = entity_extractor.extract_entities(doc_data['content'])
        keywords = entity_extractor.extract_keywords(doc_data['content'])
        summary = entity_extractor.extract_summary(doc_data['content'])
        
        # Add to knowledge graph
        doc_id = filename.replace('.', '_')
        knowledge_graph.add_document_node(doc_id, filename, doc_data['type'], summary)
        knowledge_graph.add_entities_from_extraction(doc_id, entities)
        
        # Add to RAG
        rag_engine.add_documents([doc_data])
        
        # Save graph
        knowledge_graph.save_to_file(Config.GRAPH_FILE)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'entities': entities,
            'keywords': keywords,
            'summary': summary,
            'doc_id': doc_id
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['POST'])
def query_copilot():
    """Query the RAG copilot"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        # Query RAG engine
        result = rag_engine.query(question)
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/knowledge-graph', methods=['GET'])
def get_knowledge_graph():
    """Get current knowledge graph"""
    try:
        graph_data = knowledge_graph.to_dict()
        return jsonify(graph_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/equipment/<equipment_id>', methods=['GET'])
def get_equipment_info(equipment_id):
    """Get equipment information from knowledge graph"""
    try:
        history = knowledge_graph.find_equipment_history(equipment_id)
        procedures = knowledge_graph.find_applicable_procedures(equipment_id)
        
        return jsonify({
            'equipment_id': equipment_id,
            'maintenance_history': history,
            'applicable_procedures': procedures
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/documents', methods=['GET'])
def list_documents():
    """List all processed documents"""
    try:
        documents = []
        if os.path.exists(Config.DOCUMENTS_DIR):
            for filename in os.listdir(Config.DOCUMENTS_DIR):
                documents.append(filename)
        
        return jsonify({
            'total': len(documents),
            'documents': documents
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/similar', methods=['POST'])
def find_similar_documents():
    """Find similar documents"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        k = data.get('k', 5)
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        similar = rag_engine.get_similar_documents(query, k)
        return jsonify({'similar_documents': similar}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get system statistics"""
    try:
        graph_dict = knowledge_graph.to_dict()
        doc_count = len(os.listdir(Config.DOCUMENTS_DIR)) if os.path.exists(Config.DOCUMENTS_DIR) else 0
        
        return jsonify({
            'documents_processed': doc_count,
            'knowledge_graph': graph_dict['stats'],
            'status': 'operational'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.FLASK_DEBUG)
