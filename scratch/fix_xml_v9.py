import os
import re

def structural_cleanup(content):
    # This function ensures that tags are properly nested and closed.
    # It's specifically designed for the <question> tag in these files.
    
    # 1. Unescape all for processing
    content = content.replace('&lt;', '<').replace('&gt;', '>')
    content = content.replace('&amp;', '&')
    
    # Cleaning up common mistakes from previous scripts
    content = content.replace('___MEDIUM___', '<medium>')
    content = content.replace('</easy>\n    </easy>', '</easy>\n    <medium>')
    
    lines = content.split('\n')
    new_lines = []
    
    in_question = False
    in_explanation = False
    
    for i, line in enumerate(lines):
        s = line.strip()
        
        # If we see a new question start, and we're inside one, we missed a closure.
        if '<question' in s:
            if in_question:
                # Close the previous question before starting new one
                # If we were in explanation, close that too
                if in_explanation:
                    # We assume it was closed on the previous line if it had </explanation>
                    # But let's be safe. Check previous line.
                    prev = new_lines[-1].strip()
                    if '</explanation>' not in prev:
                        new_lines[-1] = new_lines[-1].rstrip() + '</explanation>'
                
                # Close question
                new_lines[-1] = new_lines[-1].rstrip() + '\n        </question>'
            in_question = True
            in_explanation = False # Reset for new question
            
        if '<explanation' in s:
            in_explanation = True
            if '</explanation>' in s:
                in_explanation = False
        
        if '</question>' in s:
            in_question = False
            in_explanation = False
            
        # If we see a section close/open, and we're in a question, close it.
        if any(t in s for t in ['</easy>', '</medium>', '</hard>', '<medium>', '<hard>', '</chapter>']):
            if in_question:
                if in_explanation:
                    prev = new_lines[-1].strip()
                    if '</explanation>' not in prev:
                        new_lines[-1] = new_lines[-1].rstrip() + '</explanation>'
                new_lines[-1] = new_lines[-1].rstrip() + '\n        </question>'
                in_question = False
            
        new_lines.append(line)
        
    content = '\n'.join(new_lines)
    
    # Deduplicate closing tags that might have been added doubled by mistake
    content = re.sub(r'</explanation>\s*</explanation>', '</explanation>', content)
    content = re.sub(r'</question>\s*</question>', '</question>', content)
    
    # Fix section tags (Easy -> Medium -> Hard)
    lines = content.split('\n')
    fixed_lines = []
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
        fixed_lines.append(line)
        
    return '\n'.join(fixed_lines)

def escape_content(content):
    # Surgical escaping
    tags = ['text', 'option', 'answer', 'explanation']
    for tag in tags:
        def sub_fn(m):
            s, inner, e = m.groups()
            inner = inner.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            return f"{s}{inner}{e}"
        content = re.compile(f'(<{tag}[^>]*>)(.*?)(</{tag}>)', re.DOTALL).sub(sub_fn, content)
    return content

def process_all():
    directory = 'raw_questions'
    files = [f for f in os.listdir(directory) if f.endswith('.xml')]
    success = 0
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()
        
        # Process structural cleanup then escape
        content = structural_cleanup(raw)
        content = escape_content(content)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        import xml.etree.ElementTree as ET
        try:
            ET.parse(path)
            success += 1
        except Exception as e:
            print(f"FAILED: {filename} -> {e}")
            
    print(f"\nFinal Result: {success}/{len(files)} Fixed.")

if __name__ == "__main__":
    process_all()
