import zipfile
import re
import sys
import xml.etree.ElementTree as ET

def extract_pptx(filepath):
    try:
        with zipfile.ZipFile(filepath, 'r') as z:
            slide_names = [n for n in z.namelist() if re.match(r"^ppt/slides/slide\d+\.xml$", n)]
            slide_names.sort(key=lambda x: int(re.search(r'\d+', x).group()))
            
            full_text = ""
            for slide in slide_names:
                xml_data = z.read(slide).decode('utf-8')
                matches = re.findall(r'<a:t[^>]*>([\s\S]*?)</a:t>', xml_data)
                if matches:
                    clean_text = [re.sub(r'<[^>]+>', '', m).strip() for m in matches if m.strip()]
                    full_text += " ".join(clean_text) + "\n\n"
            return full_text
    except Exception as e:
        return f"Error: {e}"

def extract_pdf_dummy(filepath):
    # just basic to see if we can read pypdf2
    try:
        import PyPDF2
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            return " ".join(page.extract_text() for page in reader.pages)
    except:
        return "Install PyPDF2 or the pdf is empty text"

print("--- PPTX ---")
print(extract_pptx(r"d:\jaswant\gravity-work\New folder\sql_study_material_demo.pptx")[:1000])

print("--- PDF ---")
print(extract_pdf_dummy(r"d:\jaswant\gravity-work\New folder\48049.pdf")[:1000])
