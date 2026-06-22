import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', False)
    PORT = int(os.getenv('PORT', 5000))
    MAX_UPLOAD_SIZE = os.getenv('MAX_UPLOAD_SIZE', '50MB')
    DATA_DIR = 'data'
    DOCUMENTS_DIR = os.path.join(DATA_DIR, 'documents')
    EMBEDDINGS_DIR = os.path.join(DATA_DIR, 'embeddings')
    GRAPH_FILE = os.path.join(DATA_DIR, 'knowledge_graph.json')
    ENTITIES_FILE = os.path.join(DATA_DIR, 'entities.json')

if not os.path.exists(Config.DOCUMENTS_DIR):
    os.makedirs(Config.DOCUMENTS_DIR, exist_ok=True)
if not os.path.exists(Config.EMBEDDINGS_DIR):
    os.makedirs(Config.EMBEDDINGS_DIR, exist_ok=True)
