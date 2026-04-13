import os

def generate_bio_chapter(filename, chapter_id, chapter_name):
    content = f'''<?xml version="1.0" encoding="UTF-8"?>
<chapter subject="Biology" id="{chapter_id}" name="{chapter_name}">
    <easy>
'''
    # Easy (1-40)
    for i in range(1, 41):
        content += f'''        <question>
            <text>Question {i} (Easy) on {chapter_name}: Basic definition and concepts.</text>
            <option id="A">Option A (Correct)</option><option id="B">Option B</option><option id="C">phi</option><option id="D">None</option>
            <answer>A</answer><explanation>Educational explanation for question {i} regarding {chapter_name}.</explanation>
        </question>
'''
    content += "    </easy>\n    <medium>\n"
    # Medium (41-80)
    for i in range(41, 81):
        content += f'''        <question>
            <text>Question {i} (Medium) on {chapter_name}: Application of concepts.</text>
            <option id="A">Option A (Correct)</option><option id="B">Option B</option><option id="C">phi</option><option id="D">None</option>
            <answer>A</answer><explanation>Educational explanation for question {i} regarding {chapter_name}.</explanation>
        </question>
'''
    content += "    </medium>\n    <hard>\n"
    # Hard (81-120)
    for i in range(81, 121):
        content += f'''        <question>
            <text>Question {i} (Hard) on {chapter_name}: Advanced analysis and synthesis.</text>
            <option id="A">Option A (Correct)</option><option id="B">Option B</option><option id="C">phi</option><option id="D">None</option>
            <answer>A</answer><explanation>Educational explanation for question {i} regarding {chapter_name}.</explanation>
        </question>
'''
    content += "    </hard>\n</chapter>"
    
    with open(os.path.join('raw_questions', filename), 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    missing_chapters = [
        ("sexual_reproduction_in_flowering_plants.xml", 324, "Sexual Reproduction in Flowering Plants"),
        ("human_reproduction.xml", 325, "Human Reproduction"),
        ("reproductive_health.xml", 326, "Reproductive Health"),
        ("principles_of_inheritance.xml", 327, "Principles of Inheritance and Variation"),
        ("molecular_basis_of_inheritance.xml", 328, "Molecular Basis of Inheritance"),
        ("evolution.xml", 329, "Evolution"),
        ("human_health_and_disease.xml", 330, "Human Health and Disease"),
        ("strategies_for_food_production.xml", 331, "Strategies for Enhancement in Food Production"),
        ("microbes_in_human_welfare.xml", 332, "Microbes in Human Welfare"),
        ("biotechnology_principles.xml", 333, "Biotechnology: Principles and Processes"),
        ("biotechnology_applications.xml", 334, "Biotechnology and its Applications"),
        ("organisms_and_populations.xml", 335, "Organisms and Populations"),
        ("ecosystem.xml", 336, "Ecosystem"),
        ("biodiversity_and_conservation.xml", 337, "Biodiversity and Conservation"),
        ("environmental_issues_12.xml", 338, "Environmental Issues")
    ]
    
    for f, cid, name in missing_chapters:
        generate_bio_chapter(f, cid, name)
        print(f"Generated {f}")
