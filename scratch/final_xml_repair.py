import os
import re

def robust_repair(content):
    # 1. Clean start: Unescape all
    content = content.replace('&lt;', '<').replace('&gt;', '>')
    content = content.replace('&amp;', '&')

    # 2. Fix stray closing tags before </question>
    # Pattern: </explanation>\s*</question> where the first one is on its own line
    content = re.sub(r'</(explanation|answer|text|option|year)>\s*</question>', r'</question>', content)
    
    # 3. Fix section tag mismatches (Common: <medium> ... </easy>)
    # We'll do this by looking for <medium> and then the next </easy>
    content = re.sub(r'(<medium>.*?)</easy>', r'\1</medium>', content, flags=re.DOTALL)
    # And <hard> ... </easy> or </medium>
    content = re.sub(r'(<hard>.*?)(</easy>|</medium>)', r'\1</hard>', content, flags=re.DOTALL)

    # 4. Global replacements for common typos
    content = content.replace('</year>', '</question>')

    # 5. Surgical line-by-line escaping
    lines = content.split('\n')
    new_lines = []
    
    structural_tags = ['chapter', 'easy', 'medium', 'hard', 'question']
    content_tags = ['text', 'option', 'answer', 'explanation']

    for line in lines:
        stripped = line.strip()
        # Protect structural lines
        if stripped.startswith('<?xml') or any(stripped.startswith(f'<{t}') or stripped.startswith(f'</{t}') for t in structural_tags):
            new_lines.append(line)
            continue
            
        # Regex to find any content tag on the line and escape its inner part
        tag_pattern = re.compile(r'<(text|option|answer|explanation)[^>]*>(.*?)</\1>', re.DOTALL)
        
        matches = list(tag_pattern.finditer(line))
        if not matches:
            new_lines.append(line)
            continue
            
        last_end = 0
        new_line = ""
        for match in matches:
            # We want to be extremely careful with the boundary
            s_tag_end = line.find('>', match.start()) + 1
            e_tag_block = f"</{match.group(1)}>"
            e_tag_start = line.rfind(e_tag_block, match.start(), match.end())
            
            if s_tag_end > 0 and e_tag_start > s_tag_end:
                s_tag = line[match.start():s_tag_end]
                e_tag = line[e_tag_start:match.end()]
                inner = line[s_tag_end:e_tag_start]
                
                # Escape inner
                inner = inner.replace('&', '&amp;')
                inner = inner.replace('<', '&lt;')
                inner = inner.replace('>', '&gt;')
                
                new_line += line[last_end:match.start()] + s_tag + inner + e_tag
            else:
                # Fallback if parsing failed for some reason
                new_line += line[last_end:match.end()]
            
            last_end = match.end()
            
        new_line += line[last_end:]
        new_lines.append(new_line)

    return '\n'.join(new_lines)

def process_all():
    directory = 'raw_questions'
    files = [f for f in os.listdir(directory) if f.endswith('.xml')]
    
    success_count = 0
    fail_count = 0
    
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()
            
        fixed = robust_repair(raw)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
            
        import xml.etree.ElementTree as ET
        try:
            ET.parse(path)
            success_count += 1
        except Exception as e:
            fail_count += 1
            print(f"STILL BROKEN: {filename} -> {e}")

    print(f"\nFinal Result: {success_count} Fixed, {fail_count} Still Broken.")

if __name__ == "__main__":
    process_all()
