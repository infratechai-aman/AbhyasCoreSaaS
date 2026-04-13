import os
import re

def master_fix(content):
    # 1. Start clean
    content = content.replace('&lt;', '<').replace('&gt;', '>')
    content = content.replace('&amp;', '&')

    # 2. Fix the "Answer line ends with </question>" bug
    # Pattern: <answer>...<explanation>...</question>
    # We want to change it to <answer>...<explanation>...</explanation>\n        </question>
    content = re.sub(r'(<explanation[^>]*>)([^<]*)(</question>)', r'\1\2</explanation>\n        </question>', content)

    # 3. Fix section tag mismatches
    content = re.sub(r'(<medium>.*?)</easy>', r'\1</medium>', content, flags=re.DOTALL)
    content = re.sub(r'(<hard>.*?)(</easy>|</medium>)', r'\1</hard>', content, flags=re.DOTALL)

    # 4. Fix stray closing tags
    content = re.sub(r'</(explanation|answer|text|option|year)>\s*</question>', r'</question>', content)
    content = content.replace('</year>', '</question>')

    # 5. Surgical Escaping
    lines = content.split('\n')
    new_lines = []
    structural_tags = ['chapter', 'easy', 'medium', 'hard', 'question']
    content_tags = ['text', 'option', 'answer', 'explanation']

    for line in lines:
        stripped = line.strip()
        if stripped.startswith('<?xml') or any(stripped.startswith(f'<{t}') or stripped.startswith(f'</{t}') for t in structural_tags):
            new_lines.append(line)
            continue
            
        tag_pattern = re.compile(r'<(text|option|answer|explanation)[^>]*>(.*?)</\1>', re.DOTALL)
        matches = list(tag_pattern.finditer(line))
        if not matches:
            new_lines.append(line)
            continue
            
        last_end = 0
        new_line = ""
        for match in matches:
            t_name = match.group(1)
            s_tag_end = line.find('>', match.start()) + 1
            e_tag_block = f"</{t_name}>"
            e_tag_start = line.rfind(e_tag_block, match.start(), match.end())
            
            if s_tag_end > 0 and e_tag_start > s_tag_end:
                s_tag = line[match.start():s_tag_end]
                e_tag = line[e_tag_start:match.end()]
                inner = line[s_tag_end:e_tag_start]
                inner = inner.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                new_line += line[last_end:match.start()] + s_tag + inner + e_tag
            else:
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
        fixed = master_fix(raw)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        import xml.etree.ElementTree as ET
        try:
            ET.parse(path)
            success_count += 1
        except Exception as e:
            fail_count += 1
            print(f"FAILED: {filename} -> {e}")
    print(f"\nFinal Result: {success_count} Fixed, {fail_count} Still Broken.")

if __name__ == "__main__":
    process_all()
