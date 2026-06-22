import re
from typing import List, Dict, Any
from datetime import datetime

class EntityExtractor:
    """Extract industrial entities from documents"""
    
    # Industrial entity patterns
    PATTERNS = {
        'equipment_id': r'\b([A-Z]{1,3}-\d{2,4})\b',  # e.g., PUMP-01, HX-23
        'date': r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b',  # dates
        'pressure': r'\b(\d+\.?\d*\s*(?:bar|psi|kpa|mpa))\b',
        'temperature': r'\b(\d+\.?\d*\s*°?C|\d+\.?\d*\s*°?F)\b',
        'procedure': r'(?:SOP|Standard Operating Procedure|Procedure)\s+([A-Z0-9-]+)',
        'regulation': r'(?:OISD|PESO|BIS|ISO|Factory Act)\s+([A-Z0-9-]+)',
    }
    
    # Common equipment types
    EQUIPMENT_TYPES = [
        'pump', 'compressor', 'turbine', 'heat exchanger', 'reactor',
        'tank', 'vessel', 'valve', 'motor', 'generator', 'filter',
        'separator', 'cooler', 'heater', 'blower', 'fan'
    ]
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract all entities from text"""
        entities = {
            'equipment_ids': [],
            'dates': [],
            'pressures': [],
            'temperatures': [],
            'procedures': [],
            'regulations': [],
            'equipment_types': []
        }
        
        # Extract using regex patterns
        for entity_type, pattern in self.PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                entities[entity_type] = list(set(matches))
        
        # Extract equipment types
        for equip_type in self.EQUIPMENT_TYPES:
            if re.search(r'\b' + equip_type + r'\b', text, re.IGNORECASE):
                entities['equipment_types'].append(equip_type.capitalize())
        
        # Remove duplicates
        for key in entities:
            entities[key] = list(set(entities[key]))
        
        return entities
    
    def extract_summary(self, text: str, max_sentences: int = 3) -> str:
        """Extract summary from text"""
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        return ' '.join(sentences[:max_sentences])
    
    def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """Extract top keywords from text"""
        # Simple keyword extraction based on word frequency
        words = re.findall(r'\b\w+\b', text.lower())
        # Filter out common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'}
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        
        from collections import Counter
        freq = Counter(keywords)
        return [word for word, _ in freq.most_common(top_n)]
