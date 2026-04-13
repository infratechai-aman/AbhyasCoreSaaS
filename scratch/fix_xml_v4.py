import os
import re

def fix_content(content):
    # 1. Undo previous damage
    content = content.replace('&lt;', '<').replace('&gt;', '>')
    content = content.replace('&amp;', '&')

    # 2. Define valid tags we want to preserve
    # Note: we include optional attributes for chapter
    valid_tag_names = ['chapter', 'easy', 'medium', 'hard', 'question', 'text', 'option', 'answer', 'explanation']
    
    # Also include the XML declaration and any other structural stuff
    placeholders = {}
    
    def tag_replacer(match):
        tag = match.group(0)
        # Check if it's a valid tag
        # Extract tag name
        name_match = re.search(r'</?([a-zA-Z0-9]+)', tag)
        if name_match:
            name = name_match.group(1).lower()
            if name in valid_tag_names or name == 'xml':
                # It's a valid tag - preserve it
                pid = f"__TAG_{len(placeholders)}__"
                placeholders[pid] = tag
                return pid
        
        # If not a valid tag, it's just text content that happens to look like a tag (or is a typo)
        return tag

    # Temporarily hide valid tags
    # regex for any <...> block
    content = re.sub(r'<[^>]+>', tag_replacer, content)

    # 3. Now escape ALL remaining <, >, & in the content
    content = content.replace('&', '&amp;')
    content = content.replace('<', '&lt;')
    content = content.replace('>', '&gt;')

    # 4. Restore the valid tags
    # Sort keys by sequence number descending to avoid partial replacement issues
    for pid in sorted(placeholders.keys(), key=lambda x: int(re.search(r'\d+', x).group()), reverse=True):
        content = content.replace(pid, placeholders[pid])

    # 5. Post-process: Fix known mismatched tag typos that were preserved
    # These were preserved as "valid tags" but they are in the wrong place
    # <answer>A</explanation> -> <answer>A</answer>
    content = re.sub(r'(<answer[^>]*>)(.*?)(</explanation>)', r'\1\2</answer>', content)
    content = re.sub(r'(<explanation[^>]*>)(.*?)(</answer>)', r'\1\2</explanation>', content)
    content = content.replace('</year>', '</question>')

    return content

def process_all():
    directory = 'raw_questions'
    files = [f for f in os.listdir(directory) if f.endswith('.xml')]
    
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()
            
        fixed = fix_content(raw)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        
        print(f"Processed {filename}")

if __name__ == "__main__":
    process_all()
