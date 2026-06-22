#!/usr/bin/env python
"""Quick demo script: start API, run sample queries, and save a report."""

import json
import os
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

REPO_ROOT = Path(__file__).resolve().parent.parent
REPORTS_DIR = REPO_ROOT / "data" / "reports"


def resolve_port() -> str:
    env_path = REPO_ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("PORT="):
                value = line.split("=", 1)[1].strip()
                if value:
                    return value
    return os.getenv("PORT", "5000")


API_BASE_URL = f"http://127.0.0.1:{resolve_port()}"
HEALTH_URL = f"{API_BASE_URL}/health"
STATS_URL = f"{API_BASE_URL}/stats"
QUERY_URL = f"{API_BASE_URL}/query"

SAMPLE_QUERIES = [
    "What is the maintenance history of Pump-A23?",
    "Show me the operating procedures for the heat exchanger",
    "What are the compliance requirements for this equipment?",
]


def wait_for_server(url: str, timeout_seconds: int = 30) -> bool:
    start = time.time()
    while time.time() - start < timeout_seconds:
        try:
            with urlopen(url, timeout=2) as response:
                return response.status == 200
        except URLError:
            time.sleep(1)
    return False


def post_json(url: str, payload: dict) -> dict:
    body = json.dumps(payload).encode("utf-8")
    request = Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def get_json(url: str) -> dict:
    with urlopen(url, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> int:
    print("🤖 Industrial Knowledge Intelligence - Quick Demo")
    print("=" * 60)

    server_process = subprocess.Popen(
        [sys.executable, str(REPO_ROOT / "app" / "api.py")],
        cwd=REPO_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    print(f"✓ Started API server (PID: {server_process.pid})")

    try:
        if not wait_for_server(HEALTH_URL):
            print("✗ API server did not become healthy within timeout.")
            return 1

        health = get_json(HEALTH_URL)
        stats = get_json(STATS_URL)
        print(f"✓ Health: {health.get('status')}")
        print(f"✓ Documents processed: {stats.get('documents_processed', 0)}")

        query_results = []
        for query in SAMPLE_QUERIES:
            response = post_json(QUERY_URL, {"question": query})
            query_results.append({"query": query, "response": response})
            print(f"\nQ: {query}")
            answer_snippet = (response.get("answer") or "No answer returned")[:180]
            print(f"A: {answer_snippet}")

        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        report_path = REPORTS_DIR / "demo_report.json"
        report_payload = {
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "health": health,
            "stats": stats,
            "queries": query_results,
        }
        report_path.write_text(json.dumps(report_payload, indent=2), encoding="utf-8")
        print(f"\n✓ Demo report generated: {report_path}")
        return 0
    finally:
        if server_process.poll() is None:
            server_process.terminate()
            try:
                server_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server_process.kill()
                print("⚠ Forced API server shutdown after timeout.")
        try:
            stdout_output, stderr_output = server_process.communicate(timeout=2)
        except subprocess.TimeoutExpired:
            server_process.kill()
            stdout_output, stderr_output = server_process.communicate()
        if server_process.returncode not in (None, 0):
            print("⚠ API server exited with non-zero status.")
            if stderr_output:
                print("Server stderr (tail):")
                print(stderr_output[-500:])
        elif stdout_output:
            print("Server log captured.")
        print("✓ API server stopped.")


if __name__ == "__main__":
    raise SystemExit(main())
