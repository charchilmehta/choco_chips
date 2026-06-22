# Demo & Presentation Materials

## Judge Demo Flow

1. `python scripts/setup.py`
2. `python scripts/ingest_documents.py`
3. `python app/api.py`
4. In a second terminal, run the API checks below.

## Sample API Requests

```bash
curl http://localhost:5000/health
curl http://localhost:5000/stats
curl http://localhost:5000/knowledge-graph
curl http://localhost:5000/equipment/PUMP-A23
curl -X POST http://localhost:5000/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the maintenance history of Pump-A23?"}'
```

## Expected Outputs (High-Level)

- `/health`: service identity + `healthy` status.
- `/stats`: non-zero `documents_processed` after ingestion.
- `/knowledge-graph`: nodes/edges with graph stats.
- `/equipment/PUMP-A23`: maintenance history and procedures array.
- `/query`: answer, sources, and confidence fields.

## Benchmark Targets (MVP)

| Metric | Target |
|---|---|
| Setup + sample generation | < 2 minutes |
| Ingestion (sample set) | < 1 minute |
| Health endpoint latency | < 100 ms |
| Query endpoint response | < 2 seconds |

## Architecture Visualization

Architecture diagram and data flow are documented in:

- `architecture.md`
