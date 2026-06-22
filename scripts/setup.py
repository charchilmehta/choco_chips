#!/usr/bin/env python
"""Master setup script for the Industrial Knowledge Intelligence Platform MVP."""

import argparse
import json
import os
import platform
import re
import shutil
import subprocess
import sys
from importlib import util as importlib_util
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"
DOCUMENTS_DIR = DATA_DIR / "documents"
EMBEDDINGS_DIR = DATA_DIR / "embeddings"
REPORTS_DIR = DATA_DIR / "reports"
GRAPH_FILE = DATA_DIR / "knowledge_graph.json"
ENV_FILE = REPO_ROOT / ".env"
ENV_TEMPLATE = REPO_ROOT / ".env.example"
REQUIREMENTS_FILE = REPO_ROOT / "requirements.txt"
API_BASE_URL = f"http://127.0.0.1:{os.getenv('PORT', '5000')}"
HEALTH_URL = f"{API_BASE_URL}/health"

REQUIRED_PATHS = [
    "README.md",
    "architecture.md",
    "requirements.txt",
    "app/__init__.py",
    "app/api.py",
    "app/config.py",
    "app/document_processor.py",
    "app/entity_extractor.py",
    "app/knowledge_graph.py",
    "app/rag_engine.py",
    "scripts/setup.py",
    "scripts/generate_samples.py",
    "scripts/ingest_documents.py",
    "scripts/query_demo.py",
]

PACKAGE_IMPORT_MAP = {
    "python-dotenv": "dotenv",
    "pypdf2": "PyPDF2",
    "python-multipart": "multipart",
    "scikit-learn": "sklearn",
}


def print_step(label: str) -> None:
    print(f"\n{label}")
    print("-" * 60)


def ensure_python_version() -> bool:
    print_step("1) Checking Python version")
    version = sys.version_info
    print(f"Detected: Python {platform.python_version()}")
    if version < (3, 9):
        print("✗ Python 3.9+ is required.")
        return False
    print("✓ Python version is supported.")
    return True


def parse_requirements(requirements_path: Path) -> list[str]:
    if not requirements_path.exists():
        return []
    packages = []
    for line in requirements_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.split(r"[<>=!~]", line, maxsplit=1)
        packages.append(match[0].strip())
    return packages


def verify_dependencies() -> bool:
    print_step("2) Verifying dependencies")
    packages = parse_requirements(REQUIREMENTS_FILE)
    if not packages:
        print("✗ requirements.txt is missing or empty.")
        return False

    missing = []
    for package in packages:
        import_name = PACKAGE_IMPORT_MAP.get(package.lower(), package.replace("-", "_"))
        if importlib_util.find_spec(import_name) is None:
            missing.append(package)

    if missing:
        print("✗ Missing dependencies:")
        for package in missing:
            print(f"  - {package}")
        print("Install them with: pip install -r requirements.txt")
        return False

    print(f"✓ All {len(packages)} dependencies are importable.")
    return True


def verify_repository_structure() -> bool:
    print_step("3) Verifying source file structure")
    missing = [path for path in REQUIRED_PATHS if not (REPO_ROOT / path).exists()]
    if missing:
        print("✗ Missing required files:")
        for path in missing:
            print(f"  - {path}")
        return False

    print("✓ Required app/, scripts/, and documentation files are present.")
    return True


def ensure_environment_file() -> bool:
    print_step("4) Ensuring environment file")
    if not ENV_FILE.exists():
        if ENV_TEMPLATE.exists():
            shutil.copy2(ENV_TEMPLATE, ENV_FILE)
            print(f"✓ Created {ENV_FILE.name} from {ENV_TEMPLATE.name}.")
        else:
            ENV_FILE.write_text("OPENAI_API_KEY=sk-your-openai-api-key-here\n", encoding="utf-8")
            print(f"✓ Created {ENV_FILE.name} with placeholder key.")
    else:
        print(f"✓ {ENV_FILE.name} already exists.")

    print(f"Edit {ENV_FILE} and set OPENAI_API_KEY before querying /query.")
    return True


def initialize_directories_and_graph() -> bool:
    print_step("5) Initializing directories and baseline graph")
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    if not GRAPH_FILE.exists():
        empty_graph = {
            "nodes": [],
            "edges": [],
            "stats": {"total_nodes": 0, "total_edges": 0},
        }
        GRAPH_FILE.write_text(json.dumps(empty_graph, indent=2), encoding="utf-8")
    print(f"✓ Documents directory: {DOCUMENTS_DIR}")
    print(f"✓ Embeddings directory: {EMBEDDINGS_DIR}")
    print(f"✓ Reports directory: {REPORTS_DIR}")
    print(f"✓ Knowledge graph file: {GRAPH_FILE}")
    return True


def generate_sample_data() -> bool:
    print_step("6) Generating sample data")
    result = subprocess.run([sys.executable, str(REPO_ROOT / "scripts" / "generate_samples.py")], cwd=REPO_ROOT)
    if result.returncode != 0:
        print("✗ Sample data generation failed.")
        return False
    print("✓ Sample data generated successfully.")
    return True


def run_connectivity_check() -> bool:
    print_step("7) Testing basic connectivity")
    try:
        with urlopen(HEALTH_URL, timeout=2) as response:
            payload = response.read().decode("utf-8")
            print(f"✓ API reachable: {payload[:200]}")
            return True
    except URLError:
        print("ℹ API is not running yet (expected on fresh setup).")
        print("  Start it with: python app/api.py")
        return True


def print_next_steps() -> None:
    print_step("Next steps")
    print("1. pip install -r requirements.txt")
    print("2. python scripts/setup.py")
    print("3. python scripts/ingest_documents.py")
    print("4. python app/api.py")
    print("5. python scripts/query_demo.py")


def main() -> int:
    parser = argparse.ArgumentParser(description="Master setup automation for the MVP.")
    parser.add_argument(
        "--skip-samples",
        action="store_true",
        help="Skip sample data generation step.",
    )
    args = parser.parse_args()

    print("🏭 Industrial Knowledge Intelligence Platform - Master Setup")
    print("=" * 60)

    checks = [
        ensure_python_version(),
        verify_dependencies(),
        verify_repository_structure(),
        ensure_environment_file(),
        initialize_directories_and_graph(),
    ]

    if not args.skip_samples:
        checks.append(generate_sample_data())

    checks.append(run_connectivity_check())
    print_next_steps()

    if all(checks):
        print("\n✅ Setup automation completed successfully.")
        return 0

    print("\n⚠ Setup completed with issues. Review messages above.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
