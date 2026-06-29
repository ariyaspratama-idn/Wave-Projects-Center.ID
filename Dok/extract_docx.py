import os
import docx

def extract_text_from_docx(file_path):
    try:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception as e:
        return f"Error reading {file_path}: {e}"

base_dir = r"c:\Users\Admin\.gemini\antigravity\scratch\Wave Project.ID Center"
for filename in os.listdir(base_dir):
    if filename.endswith(".docx"):
        docx_path = os.path.join(base_dir, filename)
        txt_filename = filename.replace(".docx", ".txt")
        txt_path = os.path.join(base_dir, txt_filename)
        
        text = extract_text_from_docx(docx_path)
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Extracted {filename} to {txt_filename}")
