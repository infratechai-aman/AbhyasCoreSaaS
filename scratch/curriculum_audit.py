import os
import re
import difflib
import xml.etree.ElementTree as ET

def get_syllabus_data():
    chapters = []
    with open('lib/syllabus.ts', 'r', encoding='utf-8') as f:
        content = f.read()
        # Find all chapter objects
        # Format: { chapterNumber: ..., name: "...", file: "...", hasData: ... }
        pattern = re.compile(r'\{\s*chapterNumber:\s*\d+,\s*name:\s*["\']([^"\']+)["\'],\s*file:\s*["\']?([^"\',]+)["\']?,\s*hasData:\s*(true|false)\s*\}')
        matches = pattern.findall(content)
        for name, filename, has_data in matches:
            chapters.append({
                'name': name.strip(),
                'file': filename.strip().strip('"').strip("'"),
                'hasData': has_data == 'true'
            })
    return chapters

def audit():
    syllabus_chapters = get_syllabus_data()
    existing_files = [f for f in os.listdir('raw_questions') if f.endswith('.xml')]
    
    results = []
    total_questions = 0
    
    for chapter in syllabus_chapters:
        target_file = chapter['file']
        full_path = os.path.join('raw_questions', target_file)
        
        status = {
            'chapter': chapter['name'],
            'target_file': target_file,
            'hasData_flag': chapter['hasData'],
            'file_exists': False,
            'close_matches': [],
            'easy': 0,
            'medium': 0,
            'hard': 0,
            'valid_xml': False,
            'error': None
        }
        
        if os.path.exists(full_path):
            status['file_exists'] = True
            try:
                tree = ET.parse(full_path)
                root = tree.getroot()
                status['valid_xml'] = True
                
                easy_node = root.find('easy')
                medium_node = root.find('medium')
                hard_node = root.find('hard')
                
                status['easy'] = len(easy_node.findall('question')) if easy_node is not None else 0
                status['medium'] = len(medium_node.findall('question')) if medium_node is not None else 0
                status['hard'] = len(hard_node.findall('question')) if hard_node is not None else 0
                
            except Exception as e:
                status['error'] = str(e)
        else:
            status['close_matches'] = difflib.get_close_matches(target_file, existing_files, n=2, cutoff=0.7)
            
        results.append(status)
    
    # Report
    print("--- CURRICULUM AUDIT REPORT ---")
    print(f"Total Syllabus Chapters: {len(syllabus_chapters)}")
    
    missing_files = [r for r in results if not r['file_exists']]
    print(f"Missing Files: {len(missing_files)}")
    
    mismatched_flags = [r for r in results if r['file_exists'] and not r['hasData_flag']]
    print(f"Mismatched hasData (File exists but flag False): {len(mismatched_flags)}")
    
    incomplete_counts = [r for r in results if r['file_exists'] and (r['easy'] != 40 or r['medium'] != 40 or r['hard'] != 40)]
    print(f"Incomplete Question Counts (Not 40/40/40): {len(incomplete_counts)}")
    
    invalid_xml = [r for r in results if r['file_exists'] and not r['valid_xml']]
    print(f"Invalid XML Files: {len(invalid_xml)}")
    
    print("\n--- DETAILS ---")
    
    if missing_files:
        print("\nMISSING CHAPTERS:")
        for r in missing_files:
            match_str = f" (Suggested: {', '.join(r['close_matches'])})" if r['close_matches'] else ""
            print(f" - {r['chapter']} (Target: {r['target_file']}){match_str}")
            
    if incomplete_counts:
        print("\nINCOMPLETE CONTENT:")
        for r in incomplete_counts:
            print(f" - {r['chapter']}: E:{r['easy']}, M:{r['medium']}, H:{r['hard']}")

    if invalid_xml:
        print("\nINVALID XML:")
        for r in invalid_xml:
            print(f" - {r['chapter']} ({r['target_file']}): {r['error']}")

if __name__ == "__main__":
    audit()
