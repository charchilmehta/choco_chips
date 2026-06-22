# Industrial Knowledge Intelligence Platform (MVP)

Production-ready and demo-ready MVP for industrial document intelligence with:
- document ingestion (`.pdf`, `.csv`, `.txt`, `.md`)
- entity extraction (equipment, procedures, regulations, parameters)
- knowledge graph construction
- RAG-style query API

## Quick Start (Judge Friendly)

```bash
cd <project-root>
pip install -r requirements.txt
python scripts/setup.py
python scripts/ingest_documents.py
python app/api.py
```

In another terminal:

```bash
python scripts/query_demo.py
```

## Repository Structure Verification

The setup script validates all required files are present:
- `app/` modules: `api.py`, `config.py`, `document_processor.py`, `entity_extractor.py`, `knowledge_graph.py`, `rag_engine.py`
- `scripts/` utilities: `setup.py`, `generate_samples.py`, `ingest_documents.py`, `query_demo.py`
- docs: `README.md`, `architecture.md`
- dependencies: `requirements.txt`

## Installation Instructions

1. Install Python `3.9+` (3.11 recommended).
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create environment file:
   ```bash
   cp .env.example .env
   ```
4. Update `.env`:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   FLASK_ENV=development
   FLASK_DEBUG=True
   PORT=5000
   MAX_UPLOAD_SIZE=50MB
   ```
5. Run setup and ingest:
   ```bash
   python scripts/setup.py
   python scripts/ingest_documents.py
   ```

## Master Setup Automation Script

`python scripts/setup.py` performs end-to-end setup checks:
- Python version check
- dependency verification from `requirements.txt`
- repository structure validation
- `.env` creation if missing
- directory initialization (`data/documents`, `data/embeddings`, `data/reports`)
- sample data generation
- basic connectivity test to `GET /health` (if API already running)
- next-step guidance

Optional:
```bash
python scripts/setup.py --skip-samples
```

## API Endpoint Documentation

Base URL: `http://localhost:5000`

### `GET /health`
Health endpoint.

### `POST /upload`
Uploads and processes a document.

Example:
```bash
curl -X POST http://localhost:5000/upload -F "file=@data/documents/pump_maintenance_log.txt"
```

### `POST /query`
Asks a natural language question.

Example:
```bash
curl -X POST http://localhost:5000/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the maintenance history of Pump-A23?"}'
```

### `GET /knowledge-graph`
Returns full graph JSON.

### `GET /equipment/<equipment_id>`
Returns maintenance history and applicable procedures.

### `GET /documents`
Returns processed document list.

### `POST /similar`
Finds similar documents.

### `GET /stats`
Returns high-level platform statistics.

## Sample Query Examples

1. `What is the maintenance history of PUMP-A23?`
2. `Show me operating procedures for HX-01`
3. `What compliance gaps exist for COM-03?`
4. `Which equipment has urgent maintenance findings?`

## Demo / Presentation Materials

### Sample requests for judges
```bash
curl http://localhost:5000/health
curl http://localhost:5000/stats
curl http://localhost:5000/knowledge-graph
curl -X POST http://localhost:5000/query -H "Content-Type: application/json" -d '{"question":"What happened to COM-03?"}'
```

### Expected outputs (high-level)
- `/health` returns `status: healthy`
- `/stats` returns document count + graph node/edge counts
- `/knowledge-graph` returns nodes/edges arrays
- `/query` returns answer + sources + confidence

### Performance benchmark data (MVP targets)
- document ingestion: `< 5s/doc`
- query response: `< 2s`
- graph operations: `< 100ms`

### Architecture visualization
See `architecture.md` for component and data-flow diagrams.

## Docker Setup (Optional)

1. Ensure Docker and Docker Compose are installed.
2. Configure `.env`.
3. Build and run:
   ```bash
   docker compose up --build
   ```
4. API will be available on `http://localhost:5000`.

## OpenAPI Specification

A baseline OpenAPI document is available at:
- `openapi.yaml`

You can import it into Swagger Editor or Postman.

## Quick Demo Script

Run:
```bash
python scripts/query_demo.py
```

It will:
- start `app/api.py` in the background
- run sample queries against `/query`
- print result snippets
- generate `data/reports/demo_report.json`
- stop the server automatically

## Troubleshooting Guide

### `OPENAI_API_KEY not set`
- Ensure `.env` exists and contains `OPENAI_API_KEY=...`
- Restart the API after updating `.env`

### `No module named ...`
- Reinstall dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### `/query` returns fallback/no-answer
- Ensure ingestion was run:
  ```bash
  python scripts/generate_samples.py
  python scripts/ingest_documents.py
  ```
- Confirm valid OpenAI API key and available quota

### Port 5000 already in use
- Stop existing process or set `PORT` in `.env`

## Security Notes

- Keep `.env` private and never commit real API keys.
- `.env.example` is safe placeholder-only.
