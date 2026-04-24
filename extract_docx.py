import docx
import os
import sys

def extract_text(file_path):
    try:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
        return full_text
    except Exception as e:
        return [f"Error reading {file_path}: {e}"]

files = [
    "briefing_autoescuela_practicas.docx",
    "guia_desarrollo_autoescuela_practicas.docx",
    "base_datos_modelos_migraciones_autoescuela.docx",
    "guia_repositorio_equipo.docx",
    "dev1_backend_base.docx",
    "dev2_backend_negocio.docx",
    "dev3_frontend.docx"
]

base_path = r"C:\Users\JOSE\Downloads"

for file_name in files:
    file_path = os.path.join(base_path, file_name)
    print(f"\n--- {file_name} ---")
    if os.path.exists(file_path):
        lines = extract_text(file_path)
        # Get up to 30 lines (middle section or start if short)
        start = max(0, len(lines) // 4)
        end = min(len(lines), start + 30)
        excerpt = lines[start:end]
        for line in excerpt:
            print(line)
    else:
        print(f"File not found: {file_name}")
