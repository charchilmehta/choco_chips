import os
import json
from pathlib import Path
import PyPDF2
import pdfplumber
import csv
from typing import Dict, List, Any

class DocumentProcessor:
    def __init__(self, data_dir: str = 'data'):
        self.data_dir = data_dir
        self.documents = []
        
    def process_pdf(self, file_path: str) -> Dict[str, Any]:
        """Extract text from PDF"""
        try:
            text = ""
            metadata = {}
            with pdfplumber.open(file_path) as pdf:
                metadata['total_pages'] = len(pdf.pages)
                for page_num, page in enumerate(pdf.pages):
                    text += f"\n[Page {page_num + 1}]\n"
                    text += page.extract_text() or ""
            
            return {
                'content': text,
                'metadata': metadata,
                'type': 'pdf'
            }
        except Exception as e:
            return {'error': str(e)}
    
    def process_csv(self, file_path: str) -> Dict[str, Any]:
        """Extract data from CSV"""
        try:
            data = []
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
            
            # Convert to text format
            text = json.dumps(data, indent=2)
            return {
                'content': text,
                'metadata': {'rows': len(data)},
                'type': 'csv',
                'structured_data': data
            }
        except Exception as e:
            return {'error': str(e)}
    
    def process_text(self, file_path: str) -> Dict[str, Any]:
        """Extract data from text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {
                'content': content,
                'metadata': {'size': len(content)},
                'type': 'text'
            }
        except Exception as e:
            return {'error': str(e)}
    
    def process_document(self, file_path: str) -> Dict[str, Any]:
        """Process document based on file type"""
        ext = Path(file_path).suffix.lower()
        
        if ext == '.pdf':
            return self.process_pdf(file_path)
        elif ext == '.csv':
            return self.process_csv(file_path)
        elif ext in ['.txt', '.md']:
            return self.process_text(file_path)
        else:
            return {'error': f'Unsupported file type: {ext}'}
    
    def process_batch(self, directory: str) -> List[Dict[str, Any]]:
        """Process all documents in a directory"""
        documents = []
        for file in os.listdir(directory):
            file_path = os.path.join(directory, file)
            if os.path.isfile(file_path):
                result = self.process_document(file_path)
                if 'error' not in result:
                    result['filename'] = file
                    result['file_path'] = file_path
                    documents.append(result)
        return documents
