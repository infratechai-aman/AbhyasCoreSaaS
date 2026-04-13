import os
import re

def reliable_repair(content):
    # 1. Start clean: Universal unescape
    content = content.replace('&lt;', '<').replace('&gt;', '>')
    content = content.replace('&amp;', '&')
    
    # 2. Fix the "Answer line ends with </question>" bug
    # Pattern: <explanation>... </question> where it should be </explanation></question>
    def fix_explanation_end(match):
        inner = match.group(2)
        if '</explanation>' not in inner:
            return f"{match.group(1)}{inner}</explanation></question>"
        return match.group(0)
    content = re.sub(r'(<explanation[^>]*>)(.*?)(</question>)', fix_explanation_end, content, flags=re.DOTALL)

    # 3. Deduplicate stray closing tags (The "Final 14" bug)
    # e.g., </explanation> on a line by itself after a line that already closed it.
    tags = ['explanation', 'answer', 'text', 'option', 'question']
    for tag in tags:
        # Match </tag> followed by any amount of whitespace (including newlines) and another </tag>
        # And replace with just one.
        content = re.sub(f'</{tag}>\s*</{tag}>', f'</{tag}>', content)

    # 4. Fix section tag transitions
    lines = content.split('\n')
    new_lines = []
    curr = None
    for line in lines:
        s = line.strip()
        if '<easy>' in s: curr = 'easy'
        elif '<medium>' in s: curr = 'medium'
        elif '<hard>' in s: curr = 'hard'
        
        if '</easy>' in s:
            if curr == 'medium': line = line.replace('</easy>', '</medium>')
            elif curr == 'hard': line = line.replace('</easy>', '</hard>')
        elif '</medium>' in s and curr == 'hard':
            line = line.replace('</medium>', '</hard>')
            
        new_lines.append(line)
    content = '\n'.join(new_lines)

    # 5. Fix common typos and leftovers
    content = content.replace('___MEDIUM___', '<medium>')
    content = content.replace('</year>', '</question>')

    # 6. Surgical Escaping of content tags
    content_tags = ['text', 'option', 'answer', 'explanation']
    for tag in content_tags:
        def escape_inner(match):
            s, inner, e = match.groups()
            inner = inner.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            return f"{s}{inner}{e}"
        pattern = re.compile(f'(<{tag}[^>]*>)(.*?)(</{tag}>)', re.DOTALL)
        content = pattern.sub(escape_inner, content)

    return content

def process_all():
    directory = 'raw_questions'
    files = [f for f in os.listdir(directory) if f.endswith('.xml')]
    success = 0
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()
        fixed = reliable_repair(raw)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        import xml.etree.ElementTree as ET
        try:
            ET.parse(path)
            success += 1
        except Exception as e:
            print(f"FAILED: {filename} -> {e}")
    print(f"\nFinal Result: {success}/{len(files)} Fixed.")

if __name__ == "__main__":
    process_all()
