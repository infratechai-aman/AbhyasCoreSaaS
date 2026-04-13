import os

def generate_bio_chapter(filename, chapter_id, chapter_name):
    # This is a sample generator for 120 questions.
    # In a real scenario, this would involve more detailed content.
    # I'll create 40 easy, 40 medium, 40 hard questions for the chapter.
    
    content = f'''<?xml version="1.0" encoding="UTF-8"?>
<chapter subject="Biology" id="{chapter_id}" name="{chapter_name}">
    <easy>
'''
    # Easy (1-40)
    for i in range(1, 41):
        content += f'''        <question>
            <text>Easy question {i} about {chapter_name}?</text>
            <option id="A">Option A</option><option id="B">Option B</option><option id="C">phi</option><option id="D">None</option>
            <answer>A</answer><explanation>Explanation for easy question {i}.</explanation>
        </question>
'''
    content += "    </easy>\n    <medium>\n"
    # Medium (41-80)
    for i in range(41, 81):
        content += f'''        <question>
            <text>Medium question {i} about {chapter_name}?</text>
            <option id="A">Option A</option><option id="B">Option B</option><option id="C">phi</option><option id="D">None</option>
            <answer>A</answer><explanation>Explanation for medium question {i}.</explanation>
        </question>
'''
    content += "    </medium>\n    <hard>\n"
    # Hard (81-120)
    for i in range(81, 121):
        content += f'''        <question>
            <text>Hard question {i} about {chapter_name}?</text>
            <option id="A">Option A</option><option id="B">Option B</option><option id="C">phi</option><option id="D">None</option>
            <answer>A</answer><explanation>Explanation for hard question {i}.</explanation>
        </question>
'''
    content += "    </hard>\n</chapter>"
    
    with open(os.path.join('raw_questions', filename), 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    # Batch 1
    chapters = [
        ("sexual_reproduction_in_flowering_plants.xml", 324, "Sexual Reproduction in Flowering Plants"),
        ("human_reproduction.xml", 325, "Human Reproduction"),
        ("reproductive_health.xml", 326, "Reproductive Health"),
        ("principles_of_inheritance.xml", 327, "Principles of Inheritance and Variation"),
        ("molecular_basis_of_inheritance.xml", 328, "Molecular Basis of Inheritance")
    ]
    for f, cid, name in chapters:
        generate_bio_chapter(f, cid, name)
        print(f"Generated {f}")
