# Industrial Knowledge Intelligence Platform - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      INPUT LAYER                                 │
│     PDFs | CSVs | Scanned Forms | Email Archives | Databases   │
└────────────────────┬──────────────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │ Document Processing     │
        │ ├─ PDF Parser           │
        │ ├─ CSV Extractor        │
        │ ├─ Text Parser          │
        │ └─ OCR (Future)         │
        └────────────┬────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ Entity Extraction (NER)        │
        │ ├─ Equipment IDs (PUMP-A23)   │
        │ ├─ Procedures (SOP-PM-001)    │
        │ ├─ Regulations (OISD, PESO)   │
        │ ├─ Parameters (Pressure, Temp)│
        │ └─ Personnel, Dates           │
        └────────────┬──────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ Knowledge Graph Construction   │
        │ ├─ Equipment Nodes            │
        │ ├─ Document Nodes             │
        │ ├─ Procedure Nodes            │
        │ ├─ Regulation Nodes           │
        │ └─ Relationship Edges         │
        └────────────┬──────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ Vector Store (Chromadb)        │
        │ ├─ Semantic Embeddings        │
        │ ├─ Text Chunks                │
        │ └─ Metadata Storage           │
        └────────────┬──────────────────┘
                     │
     ┌───────────────┼───────────────┬─────────────────┐
     │               │               │                  │
┌────▼────┐  ┌──────▼──────┐  ┌────▼───────┐  ┌─────▼─────┐
│   RAG   │  │  Knowledge  │  │  Document  │  │  Entity   │
│ Copilot │  │   Graph     │  │   Search   │  │ Retrieval │
│  API    │  │ Visualization│  │   API      │  │   API     │
└────┬────┘  └──────┬──────┘  └────┬───────┘  └─────┬─────┘
     │              │              │               │
     └──────────────┬──────────────┬───────────────┘
                    │
        ┌───────────▼────────────┐
        │   Flask REST API        │
        │ /query, /upload,        │
        │ /knowledge-graph,       │
        │ /equipment/<id>         │
        └───────────┬────────────┘
                    │
        ┌───────────▼────────────┐
        │   Web/Mobile Clients    │
        │   (UI Layer)            │
        └────────────────────────┘
```

## Component Details

### 1. Document Processing Layer
- **PDF Parsing**: PyPDF2 + pdfplumber for text extraction
- **CSV Processing**: Structured data from maintenance logs
- **Text Extraction**: Support for .txt and .md files
- **OCR Ready**: EasyOCR integration for scanned documents

### 2. Entity Extraction Layer
Uses **spaCy NER** with industrial pattern matching:
- Equipment IDs: `PUMP-A23`, `HX-01`, `COM-03`
- Parameters: Pressure (bar, psi), Temperature (°C, °F)
- Procedures: SOP references
- Regulations: OISD, PESO, BIS, Factory Act
- Dates: Maintenance schedules, inspection dates

### 3. Knowledge Graph
**NetworkX DiGraph** with nodes and edges:

**Nodes:**
- Documents (PDFs, CSVs, procedures)
- Equipment (Pumps, compressors, exchangers)
- Procedures (Operating, maintenance)
- Regulations (Standards, compliance requirements)

**Edges:**
- `mentions_equipment`: Document → Equipment
- `references_procedure`: Document → Procedure
- `references_regulation`: Document → Regulation
- `maintenance_history`: Equipment → Document
- `requires_compliance`: Equipment → Regulation

### 4. Vector Store (Chromadb)
- Stores semantic embeddings of document chunks
- OpenAI embeddings for semantic search
- Metadata: source document, document type, chunk index
- Enables similarity-based retrieval

### 5. RAG Engine
**LangChain-based retrieval-augmented generation:**

```python
Query → Vector Search (Chromadb) → Top-3 Similar Docs
  → LLM Context Building → GPT-3.5-turbo
  → Answer + Source Citations
```

### 6. Flask API Layer

**Endpoints:**
- `POST /upload` - Upload and ingest documents
- `POST /query` - Ask questions to copilot
- `GET /knowledge-graph` - Get graph structure
- `GET /equipment/<id>` - Equipment details and history
- `POST /similar` - Find similar documents
- `GET /documents` - List all documents
- `GET /stats` - System statistics

## Data Flow Example

### Upload & Ingest
```
User uploads: pump_maintenance.pdf
  ↓
Document Processor extracts text
  ↓
Entity Extractor finds: [PUMP-A23, SOP-PM-001, 45 bar, 2024-03-10]
  ↓
Knowledge Graph adds:
  - Node: pump_maintenance_pdf
  - Node: PUMP-A23 (if not exists)
  - Edge: pump_maintenance_pdf → PUMP-A23
  ↓
Vector Store creates embeddings and indexes
  ↓
RAG Engine ready for queries
```

### Query & Response
```
User asks: "What's the maintenance history of Pump-A23?"
  ↓
Vector Search finds 3 most similar documents
  ↓
LLM builds context from those documents
  ↓
GPT-3.5 generates answer
  ↓
Return: Answer + Source Citations + Confidence Score
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|----------|
| Framework | Flask | REST API server |
| Document Processing | PyPDF2, pdfplumber | PDF extraction |
| NER | spaCy | Entity extraction |
| Knowledge Graph | NetworkX | Graph structure |
| Vector Store | Chromadb | Semantic search |
| LLM Integration | LangChain | RAG orchestration |
| LLM | OpenAI GPT-3.5/4 | Answer generation |
| Embeddings | OpenAI | Semantic representation |
| Language | Python 3.11+ | Backend |

## Database Schema (Conceptual)

### Documents Table
```json
{
  "id": "pump_maintenance_pdf",
  "filename": "pump_maintenance.pdf",
  "type": "pdf",
  "content": "...",
  "extracted_entities": {...},
  "created_at": "2024-03-20T10:30:00",
  "updated_at": "2024-03-20T10:30:00"
}
```

### Knowledge Graph Nodes
```json
{
  "type": "equipment",
  "id": "PUMP-A23",
  "equipment_type": "Centrifugal Pump",
  "specs": {
    "manufacturer": "Flowserve",
    "model": "3x2-10",
    "capacity": "100 m³/h"
  }
}
```

### Knowledge Graph Edges
```json
{
  "source": "pump_maintenance_pdf",
  "target": "PUMP-A23",
  "relation": "mentions_equipment",
  "weight": 1.0
}
```

## Scalability Considerations

### Current (MVP)
- Single instance Flask server
- In-memory knowledge graph (saved to JSON)
- Local file storage for documents
- Chromadb with local persistence

### Future (Production)
- Distributed API with load balancing
- PostgreSQL for structured data
- Neo4j or ArangoDB for knowledge graph
- S3/distributed storage for documents
- Elasticsearch for full-text search
- Redis for caching
- Message queue (Celery) for async processing

## Security Considerations

- API authentication (JWT tokens in future)
- File upload validation
- SQL injection prevention (parameterized queries)
- Rate limiting on API endpoints
- Data encryption at rest and in transit
- Access control based on equipment categories

## Performance Metrics

- Document ingestion: < 5 seconds per document
- Query response time: < 2 seconds
- Vector search: < 500ms for 10K+ documents
- Knowledge graph operations: < 100ms
- API endpoint response: < 1 second
