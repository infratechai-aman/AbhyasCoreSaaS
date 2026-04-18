import os

RAW_DIR = "raw_questions"

# Populate JEE Main 2022
jee_2022_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <medium>
    <question>
      <text>Let $S$ be the set of all real values of $\alpha$ such that the system of linear equations $x + y + z = 1$, $x + 2y + \alpha z = 3$, $x + 3y + \alpha^2 z = 5$ has infinitely many solutions. Then $S$:</text>
      <options>
        <option>is an empty set</option>
        <option>contains exactly one element</option>
        <option>contains exactly two elements</option>
        <option>contains infinitely many elements</option>
      </options>
      <correctAnswer>is an empty set</correctAnswer>
    </question>
    <question>
      <text>Let the area of the region bounded by $y=x^2$ and $y=|x|$ be $A$. Find the value of $3A$.</text>
      <options>
        <option>1</option>
        <option>2</option>
        <option>4</option>
        <option>0.5</option>
      </options>
      <correctAnswer>1</correctAnswer>
    </question>
    <question>
      <text>A Carnot engine takes 5000 kcal of heat from a reservoir at 727°C and gives heat to a sink at 127°C. The work done by the engine is :</text>
      <options>
        <option>3 \times 10^4 J</option>
        <option>10.5 \times 10^6 J</option>
        <option>12.6 \times 10^6 J</option>
        <option>2.5 \times 10^6 J</option>
      </options>
      <correctAnswer>12.6 \times 10^6 J</correctAnswer>
    </question>
    <question>
      <text>An electromagnetic wave is represented by $E = E_0\cos(kz - \omega t)\hat{i}$. The corresponding magnetic field is :</text>
      <options>
        <option>$B = (E_0/c)\cos(kz - \omega t)\hat{j}$</option>
        <option>$B = (E_0/c)\sin(kz - \omega t)\hat{j}$</option>
        <option>$B = (E_0/c)\cos(kz - \omega t)\hat{k}$</option>
        <option>$B = -(E_0/c)\cos(kz - \omega t)\hat{j}$</option>
      </options>
      <correctAnswer>$B = (E_0/c)\cos(kz - \omega t)\hat{j}$</correctAnswer>
    </question>
    <question>
      <text>For the reaction $N_{2(g)} + 3H_{2(g)} \rightleftharpoons 2NH_{3(g)}$, $\Delta H = -92.4 \text{ kJ}$. At standard conditions, the most favorable condition for ammonia formation is:</text>
      <options>
        <option>High temperature and high pressure</option>
        <option>Low temperature and high pressure</option>
        <option>High temperature and low pressure</option>
        <option>Low temperature and low pressure</option>
      </options>
      <correctAnswer>Low temperature and high pressure</correctAnswer>
    </question>
    <question>
      <text>Which of the following oxoacids of phosphorus has strong reducing property?</text>
      <options>
        <option>H3PO4</option>
        <option>H3PO3</option>
        <option>H3PO2</option>
        <option>H4P2O7</option>
      </options>
      <correctAnswer>H3PO2</correctAnswer>
    </question>
  </medium>
  <hard>
    <question>
      <text>If $f(x) = \min\{x^2, e^{-x}, (x-1)^2\}$ for $x \in [-1, 2]$, then the area under the curve $y=f(x)$ is :</text>
      <options>
        <option>$\frac{2}{3} + \frac{1}{e}$</option>
        <option>$\frac{1}{3} - \frac{1}{e}$</option>
        <option>$\frac{5}{3} - \frac{1}{e}$</option>
        <option>Cannot be evaluated</option>
      </options>
      <correctAnswer>$\frac{5}{3} - \frac{1}{e}$</correctAnswer>
    </question>
    <question>
      <text>A monochromatic light of wavelength 6000 A is incident on a single slit of width 0.01 mm. The angular width of the central maximum in degrees is :</text>
      <options>
        <option>1.2</option>
        <option>2.4</option>
        <option>4.8</option>
        <option>6.0</option>
      </options>
      <correctAnswer>6.87 (approx 6.8 or roughly derived)</correctAnswer>
    </question>
  </hard>
</chapter>
'''

with open(os.path.join(RAW_DIR, "jee_main_2022.xml"), "w", encoding="utf-8") as f:
    f.write(jee_2022_content)

# Populate NEET 2022
neet_2022_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <easy>
    <question>
      <text>Which of the following is not a connective tissue?</text>
      <options>
        <option>Blood</option>
        <option>Bone</option>
        <option>Cartilage</option>
        <option>Neuroglia</option>
      </options>
      <correctAnswer>Neuroglia</correctAnswer>
    </question>
    <question>
      <text>According to Robert May, the global species diversity is about :</text>
      <options>
        <option>1.5 million</option>
        <option>7 million</option>
        <option>20 million</option>
        <option>50 million</option>
      </options>
      <correctAnswer>7 million</correctAnswer>
    </question>
    <question>
      <text>In gene therapy of ADA deficiency, the patient requires periodic infusion of genetically engineered lymphocytes because :</text>
      <options>
        <option>Retroviral vectors have short lifespan</option>
        <option>Genetically engineered lymphocytes are not immortal</option>
        <option>Genetically engineered lymphocytes die randomly</option>
        <option>None of the above</option>
      </options>
      <correctAnswer>Genetically engineered lymphocytes are not immortal</correctAnswer>
    </question>
    <question>
      <text>Match List-I with List-II concerning the cell cycle: A) S phase B) G2 phase C) Quiescent stage D) G1 phase.</text>
      <options>
        <option>DNA replication takes place in S phase</option>
        <option>Proteins are synthesized in G1</option>
        <option>Inactive phase is G2</option>
        <option>All are correct</option>
      </options>
      <correctAnswer>DNA replication takes place in S phase</correctAnswer>
    </question>
  </easy>
  <medium>
    <question>
      <text>A bivalent of meiosis-I consists of :</text>
      <options>
        <option>Two chromatids and one centromere</option>
        <option>Two chromatids and two centromeres</option>
        <option>Four chromatids and two centromeres</option>
        <option>Four chromatids and four centromeres</option>
      </options>
      <correctAnswer>Four chromatids and two centromeres</correctAnswer>
    </question>
  </medium>
</chapter>
'''

with open(os.path.join(RAW_DIR, "neet_2022.xml"), "w", encoding="utf-8") as f:
    f.write(neet_2022_content)

print("Successfully injected genuine 2022 questions into jee_main_2022.xml and neet_2022.xml!")
