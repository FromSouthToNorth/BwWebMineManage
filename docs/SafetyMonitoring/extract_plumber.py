import pdfplumber
import sys
from pathlib import Path

pdf_path = Path(sys.argv[1])
out_path = Path(sys.argv[2])

text_parts = []
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        text_parts.append(f"--- Page {i + 1} ---\n{text or ''}")

out_path.write_text("\n\n".join(text_parts), encoding="utf-8")
print(f"Extracted {len(pdf.pages)} pages to {out_path}")
