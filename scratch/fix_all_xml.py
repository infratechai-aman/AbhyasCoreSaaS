import os
import re
import xml.etree.ElementTree as ET

def repair_xml_line(content):
    # 1. Fix unescaped < and > inside tags like <text>, <option>, <explanation>
    # We use a regex to find content between tags and escape it.
    
    def escape_content(match):
        tag_open = match.group(1)
        inner_content = match.group(2)
        tag_close = match.group(3)
        
        # Escape special XML chars in inner_content
        inner_content = inner_content.replace('&', '&amp;')
        inner_content = inner_content.replace('<', '&lt;')
        inner_content = inner_content.replace('>', '&gt;')
        # Re-allow &amp; if we accidentally double-escaped it (unlikely but safe)
        inner_content = inner_content.replace('&amp;amp;', '&amp;')
        inner_content = inner_content.replace('&amp;lt;', '&lt;')
        inner_content = inner_content.replace('&amp;gt;', '&gt;')
        
        return f"{tag_open}{inner_content}{tag_close}"

    # Target tags: text, option, explanation, answer
    tags = ['text', 'option', 'explanation', 'answer']
    for tag in tags:
        pattern = re.compile(f'(<{tag}[^>]*>)(.*?)(</{tag}>)', re.DOTALL)
        content = pattern.sub(escape_content, content)
        
        # Also handle cases where the closing tag is mismatched but we can guess it
        # e.g. <answer>A</explanation> -> <answer>A</answer>
        # Use [^<]* instead of .*? to avoid crossing other tags on the same line
        mismatched_pattern = re.compile(f'(<{tag}[^>]*>)([^<]*)(</(?!{tag})[a-zA-Z]+>)')
        def fix_mismatched(m):
            t_open, inner, t_close = m.group(1), m.group(2), m.group(3)
            # Only fix if it's a known confusion (explanation vs answer) or typo
            if tag == 'answer' and t_close == '</explanation>':
                return f"<answer>{inner}</answer>"
            if tag == 'explanation' and t_close == '</answer>':
                 return f"<explanation>{inner}</explanation>"
            return m.group(0) # Else leave it for manual or later fix
            
        content = mismatched_pattern.sub(fix_mismatched, content)

    # 2. Fix specific known typos
    content = content.replace('</year>', '</question>')
    
    # 3. Handle the messy <answer>A</explanation> pattern seen in audit
    content = re.sub(r'<answer>([^<]+)</explanation>', r'<answer>\1</answer>', content)

    return content

def process_files():
    directory = 'raw_questions'
    broken_files = []
    
    # Find broken files first
    for f in os.listdir(directory):
        if f.endswith('.xml'):
            path = os.path.join(directory, f)
            try:
                ET.parse(path)
            except:
                broken_files.append(f)
                
    print(f"Repairing {len(broken_files)} files...")
    
    for filename in broken_files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as file:
            raw_content = file.read()
            
        repaired = repair_xml_line(raw_content)
        
        # Write back
        with open(path, 'w', encoding='utf-8') as file:
            file.write(repaired)
            
        # Verify
        try:
            ET.parse(path)
            print(f"Fixed: {filename}")
        except Exception as e:
            print(f"FAILED to fix: {filename} | {e}")

if __name__ == "__main__":
    process_files()
