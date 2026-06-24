import fitz  # PyMuPDF
import sys
from pathlib import Path
from rapidocr_onnxruntime import RapidOCR

pdf_path = Path(sys.argv[1])
out_path = Path(sys.argv[2])

ocr = RapidOCR()
doc = fitz.open(pdf_path)
text_parts = []

for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    # Render at 2x zoom for better OCR
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat)
    img_bytes = pix.tobytes("png")

    result, _ = ocr(img_bytes)
    if result:
        text = "\n".join([item[1] for item in result])
    else:
        text = ""

    text_parts.append(f"--- Page {page_num + 1} ---\n{text}")
    print(f"Processed page {page_num + 1}/{len(doc)}")

out_path.write_text("\n\n".join(text_parts), encoding="utf-8")
print(f"OCR extracted {len(doc)} pages to {out_path}")
