import os
import xml.etree.ElementTree as ET

def find_broken_files():
    broken = []
    directory = 'raw_questions'
    if not os.path.exists(directory):
        print(f"Directory {directory} not found.")
        return
        
    for f in os.listdir(directory):
        if f.endswith('.xml'):
            path = os.path.join(directory, f)
            try:
                ET.parse(path)
            except Exception as e:
                broken.append((f, str(e)))
    
    if broken:
        print(f"Total broken files: {len(broken)}")
        for f, err in broken:
            print(f"{f} | {err}")
    else:
        print("No broken XML files found.")

if __name__ == "__main__":
    find_broken_files()
