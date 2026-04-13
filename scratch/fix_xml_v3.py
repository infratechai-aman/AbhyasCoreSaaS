import os
import re

def fix_line(line):
    # 1. First, undo any previous bad escaping if it happened
    line = line.replace('&lt;', '<').replace('&gt;', '>')
    line = line.replace('&amp;', '&')

    # 2. Fix mismatched tags on the same line (very common in this dataset)
    # <answer>A</explanation> -> <answer>A</answer>
    line = re.sub(r'(<answer[^>]*>)([^<]+)</explanation>', r'\1\2</answer>', line)
    # <explanation>... </answer> -> <explanation>... </explanation>
    line = re.sub(r'(<explanation[^>]*>)([^<]+)</answer>', r'\1\2</explanation>', line)
    # </year> -> </question>
    line = line.replace('</year>', '</question>')

    # 3. Escape naked < and > in specific tags
    # We do this by finding the content between the FIRST and LAST tag on the line
    # for the specific content-bearing tags.
    
    tags_to_fix = ['text', 'option', 'explanation']
    for tag in tags_to_fix:
        # Pattern to find <tag>CONTENT</tag>
        # We use a non-greedy match for the tag itself but we are careful
        pattern = f'(<{tag}[^>]*>)(.*)(</{tag}>)'
        match = re.search(pattern, line)
        if match:
            start_tag = match.group(1)
            content = match.group(2)
            end_tag = match.group(3)
            
            # Escape symbols in content
            content = content.replace('&', '&amp;')
            content = content.replace('<', '&lt;')
            content = content.replace('>', '&gt;')
            
            # Put it back
            line = line[:match.start()] + start_tag + content + end_tag + line[match.end():]

    return line

def process_all():
    directory = 'raw_questions'
    files = [f for f in os.listdir(directory) if f.endswith('.xml')]
    
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        new_lines = [fix_line(l) for l in lines]
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        print(f"Processed {filename}")

if __name__ == "__main__":
    process_all()
