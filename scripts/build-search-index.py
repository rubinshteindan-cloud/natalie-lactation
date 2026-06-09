import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUTPUT = ROOT / "search-index.json"


def clean_text(value: str) -> str:
    value = value.replace("\u200f", " ").replace("\u200e", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def make_chunks(text: str, size: int = 620, overlap: int = 100) -> list[str]:
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(len(words), start + size // 5)
        chunk = " ".join(words[start:end]).strip()
        if len(chunk) > 80:
            chunks.append(chunk)
        if end == len(words):
            break
        start = max(0, end - overlap // 5)
    return chunks


def pdf_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def build_index() -> dict:
    entries = []
    seen_hashes = set()

    for pdf_path in sorted(DATA_DIR.glob("*.pdf"), key=lambda item: item.name):
        digest = pdf_hash(pdf_path)
        if digest in seen_hashes:
            continue
        seen_hashes.add(digest)

        reader = PdfReader(str(pdf_path))
        page_count = len(reader.pages)
        for page_number, page in enumerate(reader.pages, start=1):
            text = clean_text(page.extract_text() or "")
            if not text:
                continue

            for chunk_index, chunk in enumerate(make_chunks(text), start=1):
                entries.append(
                    {
                        "id": f"{pdf_path.stem}-{page_number}-{chunk_index}",
                        "source": pdf_path.stem,
                        "file": f"data/{pdf_path.name}",
                        "page": page_number,
                        "pages": page_count,
                        "text": chunk,
                    }
                )

    return {
        "generatedFrom": "data/*.pdf",
        "documentCount": len(seen_hashes),
        "entryCount": len(entries),
        "entries": entries,
    }


if __name__ == "__main__":
    OUTPUT.write_text(
        json.dumps(build_index(), ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT}")
