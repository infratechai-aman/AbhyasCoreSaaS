import os
import re

def get_syllabus_files():
    path = 'lib/syllabus.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract file: "filename.xml"
    files = re.findall(r'file:\s*"([^"]+)"', content)
    return set(files)

def check_missing():
    syllabus_files = get_syllabus_files()
    existing_files = set(os.listdir('raw_questions'))
    
    missing = syllabus_files - existing_files
    extra = existing_files - syllabus_files
    
    print("MISSING FILES (In syllabus but not in raw_questions):")
    for m in sorted(missing):
        print(f" - {m}")
        
    print("\nEXTRA FILES (In raw_questions but not in syllabus):")
    for e in sorted(extra):
        if e.endswith('.xml'):
            print(f" - {e}")

if __name__ == "__main__":
    check_missing()
