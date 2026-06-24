import fitz
import sys
from pathlib import Path

pdf_path = Path(sys.argv[1])
out_path = Path(sys.argv[2])

doc = fitz.open(pdf_path)
text_parts = []
for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    text_parts.append(f"--- Page {page_num + 1} ---\n{page.get_text()}")

out_path.write_text("\n\n".join(text_parts), encoding="utf-8")
print(f"Extracted {len(doc)} pages to {out_path}")
