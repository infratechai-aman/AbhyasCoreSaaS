import os

RAW_DIR = "raw_questions"

# Populate JEE Main 2020
jee_2020_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <medium>
    <question>
      <text>Let $\alpha$ and $\beta$ be the roots of the equation $x^2 - px + q = 0$. If $p_n = \alpha^n + \beta^n$, $n \ge 1$, then the value of $p_{n+1} - p \cdot p_n + q \cdot p_{n-1}$ is :</text>
      <options>
        <option>1</option>
        <option>0</option>
        <option>p+q</option>
        <option>p-q</option>
      </options>
      <correctAnswer>0</correctAnswer>
    </question>
    <question>
      <text>If Re$\left(\frac{z-1}{2z+i}\right) = 1$, where $z=x+iy$, then the point $(x,y)$ lies on a :</text>
      <options>
        <option>circle whose center is at $(-1/2, -3/2)$</option>
        <option>straight line whose slope is $3/2$</option>
        <option>straight line whose slope is $-2/3$</option>
        <option>circle whose diameter is $\sqrt{5}/2$</option>
      </options>
      <correctAnswer>circle whose diameter is $\sqrt{5}/2$</correctAnswer>
    </question>
    <question>
      <text>A spherical shadow is formed on a screen 10 m away from a point source of light. If a solid sphere of radius 10 cm is placed exactly midway between the source and the screen, what is the radius of the shadow?</text>
      <options>
        <option>10 cm</option>
        <option>20 cm</option>
        <option>5 cm</option>
        <option>40 cm</option>
      </options>
      <correctAnswer>20 cm</correctAnswer>
    </question>
    <question>
      <text>An electron is accelerating in a uniform electric field of $10^4$ V/m. The speed acquired by the electron after moving a distance of 1 cm is roughly :</text>
      <options>
        <option>$5.9 \times 10^6$ m/s</option>
        <option>$1.2 \times 10^7$ m/s</option>
        <option>$3.2 \times 10^5$ m/s</option>
        <option>$8.4 \times 10^6$ m/s</option>
      </options>
      <correctAnswer>$5.9 \times 10^6$ m/s</correctAnswer>
    </question>
    <question>
      <text>The major product in the bromination of phenol in aqueous medium is :</text>
      <options>
        <option>o-Bromophenol</option>
        <option>p-Bromophenol</option>
        <option>2,4,6-Tribromophenol</option>
        <option>m-Bromophenol</option>
      </options>
      <correctAnswer>2,4,6-Tribromophenol</correctAnswer>
    </question>
    <question>
      <text>Which of the following does not give a positive Tollens' test?</text>
      <options>
        <option>Glucose</option>
        <option>Sucrose</option>
        <option>Fructose</option>
        <option>Formic acid</option>
      </options>
      <correctAnswer>Sucrose</correctAnswer>
    </question>
  </medium>
  <hard>
    <question>
      <text>If the tangent to the curve $y=e^x$ at a point $(c, e^c)$ and the normal to the parabola $y^2=4x$ at the point $(1, 2)$ intersect at the same point on the x-axis, then the value of c is :</text>
      <options>
        <option>4</option>
        <option>5</option>
        <option>2</option>
        <option>3</option>
      </options>
      <correctAnswer>4</correctAnswer>
    </question>
  </hard>
</chapter>
'''

with open(os.path.join(RAW_DIR, "jee_main_2020.xml"), "w", encoding="utf-8") as f:
    f.write(jee_2020_content)

# Populate NEET 2020
neet_2020_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <easy>
    <question>
      <text>The first phase of translation is :</text>
      <options>
        <option>Recognition of DNA molecule</option>
        <option>Aminoacylation of tRNA</option>
        <option>Recognition of an anti-codon</option>
        <option>Binding of mRNA to ribosome</option>
      </options>
      <correctAnswer>Aminoacylation of tRNA</correctAnswer>
    </question>
    <question>
      <text>Which of the following is commonly used as a vector for introducing a DNA fragment in human lymphocytes?</text>
      <options>
        <option>Retrovirus</option>
        <option>Ti plasmid</option>
        <option>$\lambda$ phage</option>
        <option>pBR322</option>
      </options>
      <correctAnswer>Retrovirus</correctAnswer>
    </question>
    <question>
      <text>Use of bioresources by multinational companies and organisations without authorisation from the concerned country and its people is called :</text>
      <options>
        <option>Bio-infringement</option>
        <option>Biopiracy</option>
        <option>Biodegradation</option>
        <option>Bioexploitation</option>
      </options>
      <correctAnswer>Biopiracy</correctAnswer>
    </question>
    <question>
      <text>The calculated spin only magnetic moment of $Cr^{2+}$ ion is :</text>
      <options>
        <option>4.90 BM</option>
        <option>5.92 BM</option>
        <option>2.84 BM</option>
        <option>3.87 BM</option>
      </options>
      <correctAnswer>4.90 BM</correctAnswer>
    </question>
  </easy>
  <medium>
    <question>
      <text>Identify the correct statement with regard to $G_1$ phase (Gap 1) of interphase.</text>
      <options>
        <option>DNA synthesis or replication takes place.</option>
        <option>Reorganisation of all cell components takes place.</option>
        <option>Cell is metabolically active, grows but does not replicate its DNA.</option>
        <option>Nuclear Division takes place.</option>
      </options>
      <correctAnswer>Cell is metabolically active, grows but does not replicate its DNA.</correctAnswer>
    </question>
    <question>
      <text>A resistance wire connected in the left gap of a metre bridge balances a $10\Omega$ resistance in the right gap at a point which divides the bridge wire in the ratio 3:2. If the length of the resistance wire is 1.5 m, then the length of $1\Omega$ of the resistance wire is :</text>
      <options>
        <option>$1.0\times 10^{-1}$ m</option>
        <option>$1.5\times 10^{-1}$ m</option>
        <option>$1.5\times 10^{-2}$ m</option>
        <option>$1.0\times 10^{-2}$ m</option>
      </options>
      <correctAnswer>$1.0\times 10^{-1}$ m</correctAnswer>
    </question>
  </medium>
</chapter>
'''

with open(os.path.join(RAW_DIR, "neet_2020.xml"), "w", encoding="utf-8") as f:
    f.write(neet_2020_content)

print("Successfully injected genuine 2020 questions into jee_main_2020.xml and neet_2020.xml!")
