import os

def recover():
    directory = 'raw_questions'
    files = [f for f in os.listdir(directory) if f.endswith('.xml')]
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Undo excessive escaping
        content = content.replace('&lt;', '<').replace('&gt;', '>')
        content = content.replace('&amp;', '&')
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Recovered {filename}")

if __name__ == "__main__":
    recover()
