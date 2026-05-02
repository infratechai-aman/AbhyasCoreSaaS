import os

RAW_DIR = "raw_questions"

# Populate JEE Main 2021
jee_2021_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <medium>
    <question>
      <text>Let $A$ and $B$ be two $3 \times 3$ real matrices such that $(A^2 - B^2)$ is an invertible matrix. If $A^5 = B^5$ and $A^3B^2 = A^2B^3$, then the value of the determinant of the matrix $A^3 + B^3$ is equal to:</text>
      <options>
        <option>0</option>
        <option>1</option>
        <option>2</option>
        <option>4</option>
      </options>
      <correctAnswer>0</correctAnswer>
    </question>
    <question>
      <text>The value of the definite integral $\int_{-\pi/4}^{\pi/4} \frac{dx}{1 + \cos 2x}$ is:</text>
      <options>
        <option>1</option>
        <option>2</option>
        <option>0</option>
        <option>4</option>
      </options>
      <correctAnswer>1</correctAnswer>
    </question>
    <question>
      <text>A radioactive sample has a half-life of 3 years. The time required for the activity to reduce to 1/8th of its initial value is:</text>
      <options>
        <option>3 years</option>
        <option>6 years</option>
        <option>9 years</option>
        <option>12 years</option>
      </options>
      <correctAnswer>9 years</correctAnswer>
    </question>
    <question>
      <text>The equivalent capacitance between $A$ and $B$ for a combination of three capacitors of $2\mu F$ each connected in series is:</text>
      <options>
        <option>6 $\mu F$</option>
        <option>2/3 $\mu F$</option>
        <option>3/2 $\mu F$</option>
        <option>1/6 $\mu F$</option>
      </options>
      <correctAnswer>2/3 $\mu F$</correctAnswer>
    </question>
    <question>
      <text>Which of the following compounds reacts with Hinsberg's reagent to form a product that is soluble in aqueous KOH?</text>
      <options>
        <option>Primary amine</option>
        <option>Secondary amine</option>
        <option>Tertiary amine</option>
        <option>Quaternary ammonium salt</option>
      </options>
      <correctAnswer>Primary amine</correctAnswer>
    </question>
    <question>
      <text>According to Molecular Orbital Theory, which of the following is paramagnetic in nature?</text>
      <options>
        <option>$O_2$</option>
        <option>$N_2$</option>
        <option>$C_2$</option>
        <option>$F_2$</option>
      </options>
      <correctAnswer>$O_2$</correctAnswer>
    </question>
  </medium>
  <hard>
    <question>
      <text>If the sum of an infinite geometric progression is 15 and the sum of the squares of its terms is 45, then the first term of the GP is:</text>
      <options>
        <option>2</option>
        <option>5</option>
        <option>7</option>
        <option>3</option>
      </options>
      <correctAnswer>5</correctAnswer>
    </question>
    <question>
      <text>For a transistor, the common base current gain is $\alpha = 0.98$. If the emitter current is 5 mA, the base current is:</text>
      <options>
        <option>0.1 mA</option>
        <option>0.2 mA</option>
        <option>0.05 mA</option>
        <option>0.15 mA</option>
      </options>
      <correctAnswer>0.1 mA</correctAnswer>
    </question>
  </hard>
</chapter>
'''

with open(os.path.join(RAW_DIR, "jee_main_2021.xml"), "w", encoding="utf-8") as f:
    f.write(jee_2021_content)

# Populate NEET 2021
neet_2021_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <easy>
    <question>
      <text>Amensalism can be represented as:</text>
      <options>
        <option>Species A (+); Species B (0)</option>
        <option>Species A (-); Species B (0)</option>
        <option>Species A (+); Species B (+)</option>
        <option>Species A (-); Species B (-)</option>
      </options>
      <correctAnswer>Species A (-); Species B (0)</correctAnswer>
    </question>
    <question>
      <text>Which of the following is not an objective of Biofortification in crops?</text>
      <options>
        <option>Improve protein content</option>
        <option>Improve micronutrient content</option>
        <option>Improve resistance to diseases</option>
        <option>Improve vitamin content</option>
      </options>
      <correctAnswer>Improve resistance to diseases</correctAnswer>
    </question>
    <question>
      <text>Identify the incorrect statement:</text>
      <options>
        <option>Viruses are obligate parasites.</option>
        <option>Infective constituent in viruses is the protein coat.</option>
        <option>Prions consist of abnormally folded proteins.</option>
        <option>Viroids lack a protein coat.</option>
      </options>
      <correctAnswer>Infective constituent in viruses is the protein coat.</correctAnswer>
    </question>
    <question>
      <text>The pKa of dimethylamine and pKa of acetic acid are 3.27 and 4.77 respectively at T (K). The correct option for the pH of dimethylammonium acetate solution is :</text>
      <options>
        <option>7.75</option>
        <option>8.50</option>
        <option>5.50</option>
        <option>8.75</option>
      </options>
      <correctAnswer>7.75</correctAnswer>
    </question>
  </easy>
  <medium>
    <question>
      <text>During the purification process for recombinant DNA technology, addition of chilled ethanol precipitates out:</text>
      <options>
        <option>Polysaccharides</option>
        <option>RNA</option>
        <option>DNA</option>
        <option>Histones</option>
      </options>
      <correctAnswer>DNA</correctAnswer>
    </question>
    <question>
      <text>A thick current carrying cable of radius 'R' carries current 'I' uniformly distributed across its cross-section. The variation of magnetic field $B(r)$ due to the cable with the distance 'r' from the axis of the cable is represented by:</text>
      <options>
        <option>Linear increase up to R, then exponential decrease</option>
        <option>Linear increase up to R, then $1/r$ decrease</option>
        <option>Constant up to R, then $1/r^2$ decrease</option>
        <option>Quadratic increase up to R, then rapid decay</option>
      </options>
      <correctAnswer>Linear increase up to R, then $1/r$ decrease</correctAnswer>
    </question>
  </medium>
</chapter>
'''

with open(os.path.join(RAW_DIR, "neet_2021.xml"), "w", encoding="utf-8") as f:
    f.write(neet_2021_content)

print("Successfully injected genuine 2021 questions into jee_main_2021.xml and neet_2021.xml!")
