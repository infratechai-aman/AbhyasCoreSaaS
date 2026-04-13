import os
import re

def get_syllabus_files():
    files = []
    with open('lib/syllabus.ts', 'r', encoding='utf-8') as f:
        content = f.read()
        # Find all occurrences of file: "filename.xml"
        matches = re.findall(r'file:\s*["\']([^"\']+\.xml)["\']', content)
        files.extend(matches)
    return files

def verify_files():
    syllabus_files = get_syllabus_files()
    print(f"Total files in syllabus: {len(syllabus_files)}")
    
    missing = []
    found = []
    for f in syllabus_files:
        path = os.path.join('raw_questions', f)
        if os.path.exists(path):
            found.append(f)
        else:
            missing.append(f)
    
    print(f"Found: {len(found)}")
    print(f"Missing: {len(missing)}")
    if missing:
        print("\nMissing files:")
        for m in missing:
            print(f" - {m}")

if __name__ == "__main__":
    verify_files()
