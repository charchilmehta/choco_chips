import json
import networkx as nx
from typing import Dict, List, Any, Tuple
from datetime import datetime

class KnowledgeGraph:
    """Build and manage industrial knowledge graph"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.entities = {}
    
    def add_document_node(self, doc_id: str, doc_name: str, doc_type: str, summary: str = ""):
        """Add document to graph"""
        self.graph.add_node(doc_id, 
                           type='document',
                           name=doc_name,
                           doc_type=doc_type,
                           summary=summary,
                           added_at=datetime.now().isoformat())
    
    def add_equipment_node(self, equip_id: str, equip_type: str, specs: Dict = None):
        """Add equipment to graph"""
        specs = specs or {}
        self.graph.add_node(equip_id,
                           type='equipment',
                           equipment_type=equip_type,
                           specs=specs)
    
    def add_procedure_node(self, proc_id: str, proc_name: str, category: str = ""):
        """Add procedure to graph"""
        self.graph.add_node(proc_id,
                           type='procedure',
                           name=proc_name,
                           category=category)
    
    def add_regulation_node(self, reg_id: str, reg_name: str, standard: str = ""):
        """Add regulation to graph"""
        self.graph.add_node(reg_id,
                           type='regulation',
                           name=reg_name,
                           standard=standard)
    
    def add_edge(self, source: str, target: str, relation: str, weight: float = 1.0):
        """Add relationship between nodes"""
        self.graph.add_edge(source, target, relation=relation, weight=weight)
    
    def add_entities_from_extraction(self, doc_id: str, entities: Dict[str, List[str]]):
        """Add extracted entities and link to document"""
        # Add equipment entities
        for equip_id in entities.get('equipment_ids', []):
            self.add_equipment_node(equip_id, 'Unknown')
            self.add_edge(doc_id, equip_id, 'mentions_equipment')
        
        # Add procedures
        for proc_id in entities.get('procedures', []):
            self.add_procedure_node(proc_id, f'Procedure {proc_id}')
            self.add_edge(doc_id, proc_id, 'references_procedure')
        
        # Add regulations
        for reg_id in entities.get('regulations', []):
            self.add_regulation_node(reg_id, f'Regulation {reg_id}')
            self.add_edge(doc_id, reg_id, 'references_regulation')
    
    def get_node_neighbors(self, node_id: str, depth: int = 1) -> Dict[str, Any]:
        """Get related nodes"""
        neighbors = {}
        try:
            for i in range(1, depth + 1):
                if i == 1:
                    neighbors[f'depth_{i}'] = list(self.graph.neighbors(node_id))
        except:
            pass
        return neighbors
    
    def find_equipment_history(self, equip_id: str) -> List[Dict[str, Any]]:
        """Find all documents mentioning an equipment"""
        history = []
        try:
            for node in self.graph.predecessors(equip_id):
                if self.graph.nodes[node].get('type') == 'document':
                    history.append({
                        'document': node,
                        'name': self.graph.nodes[node].get('name'),
                        'type': self.graph.nodes[node].get('doc_type')
                    })
        except:
            pass
        return history
    
    def find_applicable_procedures(self, equip_id: str) -> List[Dict[str, Any]]:
        """Find procedures applicable to equipment"""
        procedures = []
        try:
            # Find documents mentioning this equipment
            for doc_node in self.graph.predecessors(equip_id):
                # Find procedures in those documents
                for proc_node in self.graph.successors(doc_node):
                    if self.graph.nodes[proc_node].get('type') == 'procedure':
                        procedures.append({
                            'procedure_id': proc_node,
                            'name': self.graph.nodes[proc_node].get('name'),
                            'category': self.graph.nodes[proc_node].get('category')
                        })
        except:
            pass
        return procedures
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert graph to dictionary representation"""
        nodes = []
        edges = []
        
        for node, attrs in self.graph.nodes(data=True):
            nodes.append({'id': node, **attrs})
        
        for source, target, attrs in self.graph.edges(data=True):
            edges.append({
                'source': source,
                'target': target,
                **attrs
            })
        
        return {
            'nodes': nodes,
            'edges': edges,
            'stats': {
                'total_nodes': self.graph.number_of_nodes(),
                'total_edges': self.graph.number_of_edges()
            }
        }
    
    def save_to_file(self, filepath: str):
        """Save graph to JSON file"""
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2, default=str)
    
    def load_from_file(self, filepath: str):
        """Load graph from JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        # Rebuild graph
        self.graph = nx.DiGraph()
        for node_data in data['nodes']:
            node_id = node_data.pop('id')
            self.graph.add_node(node_id, **node_data)
        
        for edge_data in data['edges']:
            source = edge_data.pop('source')
            target = edge_data.pop('target')
            self.graph.add_edge(source, target, **edge_data)
