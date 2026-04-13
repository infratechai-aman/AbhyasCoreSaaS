import os
import xml.etree.ElementTree as ET

def count_questions():
    directory = 'raw_questions'
    files = [f for f in os.listdir(directory) if f.endswith('.xml')]
    
    results = []
    for filename in sorted(files):
        path = os.path.join(directory, filename)
        try:
            tree = ET.parse(path)
            root = tree.getroot()
            count = len(root.findall('.//question'))
            results.append((filename, count))
        except:
            results.append((filename, "ERROR"))
            
    print(f"{'Filename':<50} | {'Count':<5}")
    print("-" * 60)
    for f, c in results:
        print(f"{f:<50} | {c:<5}")

if __name__ == "__main__":
    count_questions()
