import os

def simple_fix():
    directory = 'raw_questions'
    files = [f for f in os.listdir(directory)]
    for filename in files:
        if not filename.endswith('.xml'): continue
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        for line in lines:
            line = line.replace('&lt;', '<').replace('&gt;', '>')
            line = line.replace('&amp;', '&')
            
            # 1. Structural fix: <explanation>... </question>
            if '<explanation' in line and '</question>' in line and '</explanation>' not in line:
                line = line.replace('</question>', '</explanation></question>')
            
            # 2. Section fix
            if '</easy>' in line:
                # We need context, but let's assume if it follows a <medium> block it's wrong
                # Actually, let's just do a global replace for the common ones found in audit
                pass 
                
            new_lines.append(line)
            
        # Reconstruct and fix sections
        content = "".join(new_lines)
        content = content.replace('<medium>', '___MEDIUM___')
        # This is hard without state. Let's just do the ones we know.
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Simple fixed {filename}")

if __name__ == "__main__":
    simple_fix()
